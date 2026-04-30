import {
  LayoutAnimation,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
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
import { useAppTheme } from '../app-theme/app-theme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const WINDOW_SIZE = 3;
const LOAD_AHEAD = 6;
const MILESTONES = [20, 50, 100, 200, 500];

const getMilestone = (count: number) => {
  return MILESTONES.find(m => count < m) ?? MILESTONES[MILESTONES.length - 1];
};

const fetchQuestions = async (
  offset: number,
  topic: string | null,
): Promise<Question[]> => {
  const topicParam = topic ? `&topic=${encodeURIComponent(topic)}` : '';
  const response = await api('GET', `/next-questions?n=10&o=${offset}${topicParam}`);
  if (!response.json) return [];
  return response.json.map((q: any) => ({
    id: q.id,
    question: q.question,
    topic: q.topic,
  }));
};

const getMessage = (count: number, topic: string | null): string => {
  if (topic) return `Filtering by "${topic}"`;
  if (count === 0)  return 'Answer questions to start finding your matches';
  if (count < 5)    return 'Good start! Keep going to improve your matches';
  if (count < 10)   return 'Nice! Your matches are getting more accurate';
  if (count < 20)   return `${20 - count} more to unlock full matching`;
  if (count < 50)   return 'Matching unlocked! Keep going to refine further';
  if (count < 100)  return 'Great depth! Your matches are highly personalised';
  if (count < 200)  return 'Impressive! You\'re getting the best possible matches';
  return '🏆 Expert level — your matches are as accurate as they get';
};

const QuizHeader = ({
  count,
  topics,
  selectedTopic,
  onSelectTopic,
}: {
  count: number;
  topics: string[];
  selectedTopic: string | null;
  onSelectTopic: (t: string | null) => void;
}) => {
  const { appTheme } = useAppTheme();
  const milestone = getMilestone(count);
  const prevMilestone = MILESTONES[MILESTONES.indexOf(milestone) - 1] ?? 0;
  const progress = (count - prevMilestone) / (milestone - prevMilestone);
  const reached = count >= 20;

  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.messageRow}>
        <DefaultText style={headerStyles.message}>
          {getMessage(count, selectedTopic)}
        </DefaultText>
        {!selectedTopic &&
          <DefaultText style={[headerStyles.counter, { color: reached ? '#22c55e' : appTheme.brandColor }]}>
            {count}/{milestone}
          </DefaultText>
        }
      </View>

      {!selectedTopic && (
        <View style={headerStyles.track}>
          <View
            style={[
              headerStyles.fill,
              {
                width: `${Math.min(progress * 100, 100)}%` as any,
                backgroundColor: reached ? '#22c55e' : appTheme.brandColor,
              },
            ]}
          />
        </View>
      )}

      {topics.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={headerStyles.topicScroll}
          contentContainerStyle={headerStyles.topicContent}
        >
          <Pressable
            onPress={() => onSelectTopic(null)}
            style={[
              headerStyles.chip,
              !selectedTopic && { backgroundColor: appTheme.brandColor },
            ]}
          >
            <DefaultText style={[
              headerStyles.chipText,
              !selectedTopic && { color: 'white' },
            ]}>
              All
            </DefaultText>
          </Pressable>

          {topics.map(t => (
            <Pressable
              key={t}
              onPress={() => onSelectTopic(t === selectedTopic ? null : t)}
              style={[
                headerStyles.chip,
                selectedTopic === t && { backgroundColor: appTheme.brandColor },
              ]}
            >
              <DefaultText style={[
                headerStyles.chipText,
                selectedTopic === t && { color: 'white' },
              ]}>
                {t}
              </DefaultText>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: '#555',
    flex: 1,
    marginRight: 8,
  },
  counter: {
    fontSize: 13,
    fontFamily: 'MontserratBold',
  },
  track: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  topicScroll: {
    marginTop: 4,
  },
  topicContent: {
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'MontserratSemiBold',
    color: '#555',
  },
});

const QuizTab = () => {
  const [queue, setQueue] = useState<Question[]>([]);
  const [publicMap, setPublicMap] = useState<Record<number, boolean>>({});
  const [countAnswers, setCountAnswers] = useState(0);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const topicRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await japi('get', '/profile-info');
      if (r.ok) setCountAnswers(r.json?.count_answers ?? 0);
    })();
    (async () => {
      const r = await api('GET', '/question-topics');
      if (r.json) setTopics(r.json);
    })();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const next = await fetchQuestions(offsetRef.current, topicRef.current);
    offsetRef.current += next.length;
    setQueue(prev => [...prev, ...next]);
    loadingRef.current = false;
  }, []);

  useEffect(() => {
    loadMore();
  }, []);

  const onSelectTopic = useCallback((topic: string | null) => {
    topicRef.current = topic;
    setSelectedTopic(topic);
    offsetRef.current = 0;
    setQueue([]);
    loadingRef.current = false;
    loadMore();
  }, [loadMore]);

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

    if (value !== null) setCountAnswers(prev => prev + 1);

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
      <DuoliciousTopNavBar screenTitle="Q&A" />
      <QuizHeader
        count={countAnswers}
        topics={topics}
        selectedTopic={selectedTopic}
        onSelectTopic={onSelectTopic}
      />
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
            {selectedTopic
              ? `No more questions in "${selectedTopic}"`
              : 'No more questions right now'}
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
