import {
  LayoutAnimation,
  Platform,
  SafeAreaView,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { DefaultText } from './default-text';
import { DuoliciousTopNavBar } from './top-nav-bar';
import { api, japi } from '../api/api';
import { quizQueue } from '../api/queue';
import { QuizCard, Question } from './quiz-card';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const WINDOW_SIZE = 3;
const LOAD_AHEAD = 6;

const fetchQuestions = async (offset: number): Promise<Question[]> => {
  const response = await api('GET', `/next-questions?n=10&o=${offset}`);
  if (!response.json) return [];
  return response.json.map((q: any) => ({
    id: q.id,
    question: q.question,
    topic: q.topic,
  }));
};

const QuizTab = () => {
  const [queue, setQueue] = useState<Question[]>([]);
  const [publicMap, setPublicMap] = useState<Record<number, boolean>>({});
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const next = await fetchQuestions(offsetRef.current);
    offsetRef.current += next.length;
    setQueue(prev => [...prev, ...next]);
    loadingRef.current = false;
  }, []);

  useEffect(() => {
    loadMore();
  }, []);

  const visible = queue.slice(0, WINDOW_SIZE);

  const onAnswer = useCallback((id: number, value: boolean | null) => {
    const isPublic = publicMap[id] ?? true;

    quizQueue.addTask(() =>
      japi('post', '/answer', { question_id: id, answer: value, public: isPublic })
    );

    LayoutAnimation.configureNext({
      duration: 280,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });

    setQueue(prev => {
      const next = prev.filter(q => q.id !== id);
      if (next.length < LOAD_AHEAD) loadMore();
      return next;
    });
  }, [publicMap, loadMore]);

  const onTogglePublic = useCallback((id: number) => {
    setPublicMap(prev => ({ ...prev, [id]: !(prev[id] ?? true) }));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <DuoliciousTopNavBar />
      <View style={styles.feed}>
        {visible.map((q, i) => (
          <QuizCard
            key={q.id}
            question={q}
            position={i}
            isPublic={publicMap[q.id] ?? true}
            onAnswer={onAnswer}
            onTogglePublic={onTogglePublic}
          />
        ))}
        {queue.length === 0 && (
          <DefaultText style={styles.emptyText}>
            No more questions right now
          </DefaultText>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  feed: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 40,
    fontSize: 14,
  },
});

export { QuizTab };
