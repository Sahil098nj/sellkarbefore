import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, NAVIGATION_ROUTES } from '../constants';
import type { RootStackNavigationProp, RootStackParamList } from '../navigation/types';

type ConditionScreenRouteProp = RouteProp<RootStackParamList, 'Condition'>;

const ageOptions = [
  { id: '0-3', label: '0-3 Months', desc: 'No Physical Damage' },
  { id: '3-6', label: '3-6 Months', desc: 'No Physical Damage' },
  { id: '6-11', label: '6-11 Months', desc: 'No Physical Damage' },
  { id: '11+', label: '11+ Months', desc: 'Out Of Warranty' },
];

const conditionOptions = [
  { id: 'good', label: 'Good', desc: 'No scratch, No dent, Works perfectly' },
  { id: 'average', label: 'Average', desc: 'Visible scratches or dents but fully functional' },
  { id: 'below-average', label: 'Below Average', desc: 'Major Dents & Major Scratches' },
];

const ConditionScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<ConditionScreenRouteProp>();
  const { variant } = route.params;

  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  const canContinue = selectedAge !== null && selectedCondition !== null;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Device Details</Text>

      <Text style={styles.sectionTitle}>How old is your phone?</Text>
      <View style={styles.list}>
        {ageOptions.map((option) => {
          const isActive = option.id === selectedAge;
          return (
            <Pressable
              key={option.id}
              style={({ pressed }) => [styles.card, isActive && styles.cardActive, pressed && styles.cardPressed]}
              onPress={() => setSelectedAge(option.id)}
            >
              <Text style={[styles.cardTitle, isActive && styles.cardTitleActive]}>
                {option.label}
              </Text>
              <Text style={styles.cardSubtitle}>{option.desc}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>What is the overall condition?</Text>
      <View style={styles.list}>
        {conditionOptions.map((option) => {
          const isActive = option.id === selectedCondition;
          return (
            <Pressable
              key={option.id}
              style={({ pressed }) => [styles.card, isActive && styles.cardActive, pressed && styles.cardPressed]}
              onPress={() => setSelectedCondition(option.id)}
            >
              <Text style={[styles.cardTitle, isActive && styles.cardTitleActive]}>
                {option.label}
              </Text>
              <Text style={styles.cardSubtitle}>{option.desc}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={({ pressed }) => [styles.nextButton, !canContinue && styles.nextButtonDisabled, pressed && styles.nextButtonPressed]}
        disabled={!canContinue}
        onPress={() =>
          navigation.navigate('Accessories', {
            variant,
            conditionData: {
              deviceAge: selectedAge,
              overallCondition: selectedCondition,
            },
          })
        }
      >
        <Text style={styles.nextText}>Next</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  list: {
    gap: 12,
  },
  card: {
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
  },
  cardActive: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: '#E7F0FF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  cardTitleActive: {
    color: COLORS.PRIMARY,
  },
  cardSubtitle: {
    marginTop: 6,
    color: COLORS.GRAY_DARK,
    fontSize: 13,
    lineHeight: 18,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95,
  },
  nextButton: {
    marginTop: 'auto',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9,
  },
  nextText: {
    color: COLORS.WHITE,
    fontWeight: '800',
    fontSize: 16,
  },
});

export default ConditionScreen;
