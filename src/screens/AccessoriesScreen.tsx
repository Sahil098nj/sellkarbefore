import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, NAVIGATION_ROUTES } from '../constants';
import type { RootStackNavigationProp, RootStackParamList } from '../navigation/types';

type AccessoriesScreenRouteProp = RouteProp<RootStackParamList, 'Accessories'>;

const accessories = [
  {
    id: 'bill',
    title: 'Original Bill',
    subtitle: 'Invoice or digital purchase receipt',
    icon: 'file-document-outline',
    iconBg: '#DBEAFE',
    iconColor: '#1D4ED8',
  },
  {
    id: 'box',
    title: 'Original Box',
    subtitle: 'Packaging with matching IMEI/Serial',
    icon: 'package-variant-closed',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: 'charger',
    title: 'Original Charger',
    subtitle: 'Working authentic wall adapter',
    icon: 'power-plug-outline',
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
  },
  {
    id: 'none',
    title: "I don't have any of the above",
    subtitle: 'No accessories available',
    icon: 'cancel',
    iconBg: '#F1F5F9',
    iconColor: '#64748B',
  },
];

const NONE_ID = 'none';

const AccessoriesScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<AccessoriesScreenRouteProp>();
  const { variant, conditionData, questions, city, modelName, brandName } = route.params;
  const [selected, setSelected] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    if (id === NONE_ID) {
      setSelected((prev) => (prev.includes(NONE_ID) ? [] : [NONE_ID]));
    } else {
      setSelected((prev) => {
        const without = prev.filter((v) => v !== NONE_ID);
        return without.includes(id) ? without.filter((v) => v !== id) : [...without, id];
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Accessories</Text>
      <Text style={styles.subtitle}>Do you have the following?</Text>
      <Text style={styles.helperText}>
        Select the original accessories you can provide. Including these items will significantly increase your device's buyback value.
      </Text>

      <View style={styles.list}>
        {accessories.map((item) => {
          const isActive = selected.includes(item.id);
          const isNoneOption = item.id === NONE_ID;
          return (
            <Pressable
              key={item.id}
              style={[
                styles.card,
                isActive && (isNoneOption ? styles.cardNoneActive : styles.cardActive),
              ]}
              onPress={() => toggleItem(item.id)}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
                <MaterialCommunityIcons name={item.icon} size={22} color={item.iconColor} />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.cardText}>{item.title}</Text>
                <Text style={styles.cardSubText}>{item.subtitle}</Text>
              </View>
              <View style={[styles.checkbox, isActive && (isNoneOption ? styles.checkboxNone : styles.checkboxActive)]}>
                {isActive && (
                  <MaterialCommunityIcons
                    name="check"
                    size={13}
                    color={isNoneOption ? '#64748B' : '#FFFFFF'}
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={styles.nextButton}
        onPress={() => {
          // Get category from navigation params (passed from ConditionScreen)
          const category = route.params && 'category' in route.params ? (route.params as any).category : undefined;
          navigation.navigate('Auth', {
            variant,
            conditionData,
            accessoriesData: selected.filter((id) => id !== NONE_ID),
            questions,
            city,
            modelName,
            brandName,
            category,
          });
        }}
      >
        <Text style={styles.nextText}>Continue</Text>
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
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  subtitle: {
    marginTop: 6,
    color: COLORS.GRAY_DARK,
    fontWeight: '700',
  },
  helperText: {
    marginTop: 8,
    color: COLORS.GRAY_DARK,
    fontSize: 13,
    lineHeight: 19,
  },
  list: {
    marginTop: 20,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
  },
  cardActive: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: '#E7F0FF',
  },
  cardNoneActive: {
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  checkboxNone: {
    backgroundColor: '#E2E8F0',
    borderColor: '#94A3B8',
  },
  cardText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  cardSubText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    lineHeight: 17,
  },
  nextButton: {
    marginTop: 'auto',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  nextText: {
    color: COLORS.WHITE,
    fontWeight: '800',
    fontSize: 16,
  },
});

export default AccessoriesScreen;

