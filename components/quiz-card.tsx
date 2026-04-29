import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { DefaultText } from './default-text';
import { useAppTheme } from '../app-theme/app-theme';
import Ionicons from '@expo/vector-icons/Ionicons';

const WINDOW_SIZE = 3;

export type Question = {
  id: number;
  question: string;
  topic: string;
};

type CardProps = {
  question: Question;
  position: number;
  isPublic: boolean;
  onAnswer: (id: number, value: boolean | null) => void;
  onTogglePublic: (id: number) => void;
};

const QuizCard = ({ question, position, isPublic, onAnswer, onTogglePublic }: CardProps) => {
  const { appTheme } = useAppTheme();
  const opacity = position === 0 ? 1 : position === 1 ? 0.6 : 0.35;
  const scale = position === 0 ? 1 : position === 1 ? 0.97 : 0.94;

  return (
    <View
      style={[
        styles.card,
        {
          opacity,
          transform: [{ scale }],
          marginBottom: position < WINDOW_SIZE - 1 ? 10 : 0,
        },
      ]}
    >
      <DefaultText style={[styles.topic, { color: appTheme.primaryColor }]}>
        {question.topic.toUpperCase()}
      </DefaultText>

      <DefaultText style={styles.questionText}>
        {question.question}
      </DefaultText>

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.answerBtn, styles.noBtn]}
          onPress={() => onAnswer(question.id, false)}
        >
          <Ionicons name="close" size={20} color="white" />
          <DefaultText style={styles.btnLabel}>No</DefaultText>
        </Pressable>

        <Pressable
          style={[styles.answerBtn, styles.skipBtn]}
          onPress={() => onAnswer(question.id, null)}
        >
          <DefaultText style={[styles.btnLabel, { color: '#666' }]}>Skip</DefaultText>
        </Pressable>

        <Pressable
          style={[styles.answerBtn, styles.yesBtn]}
          onPress={() => onAnswer(question.id, true)}
        >
          <Ionicons name="checkmark" size={20} color="white" />
          <DefaultText style={styles.btnLabel}>Yes</DefaultText>
        </Pressable>
      </View>

      <Pressable
        onPress={() => onTogglePublic(question.id)}
        style={styles.publicRow}
      >
        <Ionicons
          name={isPublic ? 'eye-outline' : 'eye-off-outline'}
          size={14}
          color="#aaa"
        />
        <DefaultText style={styles.publicLabel}>
          {isPublic ? 'Public' : 'Private'}
        </DefaultText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  topic: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 26,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  answerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  noBtn: {
    backgroundColor: '#ff4d4d',
  },
  skipBtn: {
    backgroundColor: '#f0f0f0',
  },
  yesBtn: {
    backgroundColor: '#22c55e',
  },
  btnLabel: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  publicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  publicLabel: {
    fontSize: 12,
    color: '#aaa',
  },
});

export { QuizCard };
