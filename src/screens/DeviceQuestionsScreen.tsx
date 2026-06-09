import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants';
import type { RootStackNavigationProp, RootStackParamList } from '../navigation/types';

type DeviceQuestionsScreenRouteProp = RouteProp<RootStackParamList, 'DeviceQuestions'>;

type YesNoState = boolean | null;

const DeviceQuestionsScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<DeviceQuestionsScreenRouteProp>();
  const { variant, modelName, city, brandName, category } = route.params ?? {};

  const [canCall, setCanCall] = useState<YesNoState>(null);
  const [touchOk, setTouchOk] = useState<YesNoState>(null);
  const [screenOriginal, setScreenOriginal] = useState<YesNoState>(null);
  const [batteryOk, setBatteryOk] = useState<YesNoState>(null);

  const normalizedModel = (modelName ?? '').toLowerCase();
  const needsBatteryQuestion = /iphone|ipad|ipod/.test(normalizedModel);
  const isAndroidRuntime = Platform.OS === 'android';

  const questions = useMemo(() => {
    const list = [
      {
        key: 'call',
        icon: 'phone-check-outline',
        title: 'Are you able to make and receive calls?',
        help: 'Check your device for cellular network connectivity issues.',
        value: canCall,
        setValue: setCanCall,
      },
      {
        key: 'touch',
        icon: 'gesture-tap-button',
        title: "Is your device's touch screen working properly?",
        help: 'Check the touch screen functionality of your phone.',
        value: touchOk,
        setValue: setTouchOk,
      },
      {
        key: 'screen',
        icon: 'cellphone-screenshot',
        title: "Is your phone's screen original?",
        help: "Pick 'Yes' if screen was never changed or replaced by authorized service.",
        value: screenOriginal,
        setValue: setScreenOriginal,
      },
    ];

    if (needsBatteryQuestion) {
      list.push({
        key: 'battery',
        icon: 'battery-heart-variant',
        title: 'Battery Health above 80%',
        help: "Check if your device's battery health is above 80%.",
        value: batteryOk,
        setValue: setBatteryOk,
      });
    }

    return list;
  }, [batteryOk, canCall, needsBatteryQuestion, screenOriginal, touchOk]);

  const answeredCount = questions.filter((q) => q.value !== null).length;

  const canContinue =
    canCall !== null &&
    touchOk !== null &&
    screenOriginal !== null &&
    (!needsBatteryQuestion || batteryOk !== null);

  const renderToggle = (value: YesNoState, onChange: (next: boolean) => void) => (
    <View style={styles.toggleRow}>
      <Pressable
        style={({ pressed }) => [
          styles.toggleCard,
          styles.yesTone,
          value === true && styles.toggleCardActive,
          pressed && styles.togglePressed,
        ]}
        onPress={() => onChange(true)}
      >
        <MaterialCommunityIcons
          name={value === true ? 'check-circle' : 'check-circle-outline'}
          size={18}
          color="#0F766E"
        />
        <Text style={styles.toggleText}>Yes</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.toggleCard,
          styles.noTone,
          value === false && styles.toggleCardActive,
          pressed && styles.togglePressed,
        ]}
        onPress={() => onChange(false)}
      >
        <MaterialCommunityIcons
          name={value === false ? 'close-circle' : 'close-circle-outline'}
          size={18}
          color="#B91C1C"
        />
        <Text style={styles.toggleText}>No</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressCard}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>STEP 4 OF 8</Text>
            <Text style={styles.progressCounter}>{answeredCount}/{questions.length}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(answeredCount / questions.length) * 100}%` }]} />
          </View>
        </View>

        <Text style={styles.title}>Tell us more about your {modelName}</Text>
        <Text style={styles.subtitle}>Please answer a few questions for an accurate quote.</Text>

        {questions.map((question) => (
          <View key={question.key} style={styles.card}>
            <View style={styles.questionHeader}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name={question.icon} size={18} color="#0F4FA8" />
              </View>
              <Text style={styles.question}>{question.title}</Text>
            </View>
            <Text style={styles.help}>{question.help}</Text>
            {renderToggle(question.value, question.setValue)}
          </View>
        ))}

        {isAndroidRuntime && needsBatteryQuestion ? (
          <Text style={styles.runtimeHint}>Battery question is shown for Apple devices only.</Text>
        ) : null}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          styles.nextButtonWrap,
          !canContinue && styles.nextButtonDisabled,
          pressed && styles.togglePressed,
        ]}
        disabled={!canContinue}
        onPress={() => {
          navigation.navigate('Condition', {
            variant,
            city,
            questions: { canCall, touchOk, screenOriginal, batteryOk },
            modelName,
            brandName,
            category,
          });
        }}
      >
        <View style={[styles.nextButton, !canContinue ? styles.nextButtonMuted : styles.nextButtonActive]}>
          <Text style={styles.nextText}>Continue</Text>
          <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" />
        </View>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F7FC' },
  scrollContent: { padding: 16, paddingBottom: 128 },
  progressCard: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DFEC',
    marginBottom: 12,
  },
  progressMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressLabel: { color: '#0F4FA8', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  progressCounter: { color: '#475569', fontSize: 12, fontWeight: '700' },
  progressTrack: {
    marginTop: 10,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: '#2A66C8' },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.BLACK, lineHeight: 36 },
  subtitle: { marginTop: 8, color: '#6B7280', fontSize: 13, fontWeight: '500' },
  card: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  questionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  help: { marginTop: 8, color: '#6B7280', fontSize: 13, lineHeight: 19 },
  toggleRow: { flexDirection: 'row', marginTop: 12, gap: 10 },
  toggleCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  yesTone: { backgroundColor: '#F0FDFA', borderColor: '#99F6E4' },
  noTone: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  toggleCardActive: {
    borderColor: '#60A5FA',
    backgroundColor: '#EAF2FF',
  },
  toggleText: { fontSize: 14, fontWeight: '800', color: '#111827' },
  togglePressed: { transform: [{ scale: 0.96 }] },
  runtimeHint: {
    marginTop: 10,
    textAlign: 'center',
    color: COLORS.GRAY_DARK,
    fontSize: 11,
  },
  nextButtonWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextButtonDisabled: { opacity: 0.7 },
  nextButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  nextButtonActive: {
    backgroundColor: '#245FC6',
  },
  nextButtonMuted: {
    backgroundColor: '#A3B5D6',
  },
  nextText: { color: COLORS.WHITE, fontWeight: '800', fontSize: 16 },
});

export default DeviceQuestionsScreen;
