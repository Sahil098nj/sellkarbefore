import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NAVIGATION_ROUTES } from '../constants';
import type { RootStackParamList } from './types';

// Import screens with proper type safety
import DebugScreen from '../screens/DebugScreen';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import BrandScreen from '../screens/BrandScreen';
import ModelVariantScreen from '../screens/ModelVariantScreen';
import VariantSelectionScreen from '../screens/VariantSelectionScreen';
import CitySelectionScreen from '../screens/CitySelectionScreen';
import DeviceQuestionsScreen from '../screens/DeviceQuestionsScreen';
import BasePriceScreen from '../screens/BasePriceScreen';
import ConditionScreen from '../screens/ConditionScreen';
import AccessoriesScreen from '../screens/AccessoriesScreen';
import AuthScreen from '../screens/AuthScreen';
import PriceUnlockScreen from '../screens/PriceUnlockScreen';
import AddressPickupScreen from '../screens/AddressPickupScreen';
import TrackOrderScreen from '../screens/TrackOrderScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LeadsScreen from '../screens/LeadsScreen';
import PickupRequestsScreen from '../screens/PickupRequestsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import AboutUsScreen from '../screens/AboutUsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Component map to ensure all components are properly resolved
const screenComponents = {
  [NAVIGATION_ROUTES.SPLASH]: SplashScreen,
  [NAVIGATION_ROUTES.ONBOARDING]: OnboardingScreen,
  [NAVIGATION_ROUTES.HOME]: HomeScreen,
  [NAVIGATION_ROUTES.BRAND]: BrandScreen,
  [NAVIGATION_ROUTES.MODEL_VARIANT]: ModelVariantScreen,
  [NAVIGATION_ROUTES.VARIANT_SELECTION]: VariantSelectionScreen,
  [NAVIGATION_ROUTES.CITY_SELECTION]: CitySelectionScreen,
  [NAVIGATION_ROUTES.DEVICE_QUESTIONS]: DeviceQuestionsScreen,
  [NAVIGATION_ROUTES.BASE_PRICE]: BasePriceScreen,
  [NAVIGATION_ROUTES.CONDITION]: ConditionScreen,
  [NAVIGATION_ROUTES.ACCESSORIES]: AccessoriesScreen,
  [NAVIGATION_ROUTES.AUTH]: AuthScreen,
  [NAVIGATION_ROUTES.PRICE_UNLOCK]: PriceUnlockScreen,
  [NAVIGATION_ROUTES.ADDRESS_PICKUP]: AddressPickupScreen,
  [NAVIGATION_ROUTES.TRACK_ORDER]: TrackOrderScreen,
} as const;

const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName={NAVIGATION_ROUTES.SPLASH as keyof RootStackParamList}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name={NAVIGATION_ROUTES.SPLASH as keyof RootStackParamList}
        component={SplashScreen}
        options={{ animation: 'none' }}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.DEBUG as keyof RootStackParamList}
        component={DebugScreen}
        options={{ animation: 'none' }}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.ONBOARDING as keyof RootStackParamList}
        component={OnboardingScreen}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.HOME as keyof RootStackParamList}
        component={HomeScreen}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.BRAND as keyof RootStackParamList}
        component={BrandScreen}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.MODEL_VARIANT as keyof RootStackParamList}
        component={ModelVariantScreen}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.VARIANT_SELECTION as keyof RootStackParamList}
        component={VariantSelectionScreen}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.CITY_SELECTION as keyof RootStackParamList}
        component={CitySelectionScreen}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.DEVICE_QUESTIONS as keyof RootStackParamList}
        component={DeviceQuestionsScreen}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.BASE_PRICE as keyof RootStackParamList}
        component={BasePriceScreen}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.CONDITION as keyof RootStackParamList}
        component={ConditionScreen}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.ACCESSORIES as keyof RootStackParamList}
        component={AccessoriesScreen}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.AUTH as keyof RootStackParamList}
        component={AuthScreen}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.PRICE_UNLOCK as keyof RootStackParamList}
        component={PriceUnlockScreen}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.ADDRESS_PICKUP as keyof RootStackParamList}
        component={AddressPickupScreen}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.TRACK_ORDER as keyof RootStackParamList}
        component={TrackOrderScreen}
      />
      <Stack.Screen
        name={'Orders' as keyof RootStackParamList}
        component={OrdersScreen}
      />
      <Stack.Screen
        name={'Profile' as keyof RootStackParamList}
        component={ProfileScreen}
      />
      <Stack.Screen
        name={'Leads' as keyof RootStackParamList}
        component={LeadsScreen}
        options={{
          title: 'My Leads',
        }}
      />
      <Stack.Screen
        name={'PickupRequests' as keyof RootStackParamList}
        component={PickupRequestsScreen}
        options={{
          title: 'Pickup Requests',
        }}
      />
      <Stack.Screen
        name={'PrivacyPolicy' as keyof RootStackParamList}
        component={PrivacyPolicyScreen}
        options={{
          title: 'Privacy Policy',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={'AboutUs' as keyof RootStackParamList}
        component={AboutUsScreen}
        options={{
          title: 'About Us',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
