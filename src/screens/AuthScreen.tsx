import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  useRequestOtpMutation,
  useVerifyOtpMutation,
} from '../api';
import { useAuthStore } from '../store';
import { COLORS } from '../constants';
import type { RootStackNavigationProp, RootStackParamList } from '../navigation/types';

type AuthScreenRouteProp = RouteProp<RootStackParamList, 'Auth'>;

const AuthScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<AuthScreenRouteProp>();
  const {
    variant,
    conditionData,
    accessoriesData,
    questions,
    city: routeCity,
    modelName,
    brandName,
  } = route.params ?? {};
  const { setSession } = useAuthStore();

  const isSellFlow = !!variant;

  const requestOtpMutation = useRequestOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();

  const otpInputRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(routeCity ?? '');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Only allow digits in phone input, max 10 digits
  const sanitizedPhone = useMemo(() => phone.replace(/\D/g, '').slice(0, 10), [phone]);

  // Timer effect for resend OTP cooldown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const canSendOtp = name.trim().length >= 2 && sanitizedPhone.length === 10;
  const canVerifyOtp = canSendOtp && otp.trim().length === 6;

  const getErrorMessage = (errorValue: unknown, fallback: string) => {
    if (errorValue instanceof Error && errorValue.message) return errorValue.message;
    if (
      errorValue &&
      typeof errorValue === 'object' &&
      'message' in errorValue &&
      typeof (errorValue as { message?: unknown }).message === 'string'
    ) {
      return (errorValue as { message: string }).message;
    }
    return fallback;
  };

  const sendOtp = async () => {
    if (!canSendOtp) {
      setError('Please enter name and valid 10-digit mobile number.');
      return;
    }

    try {
      await requestOtpMutation.mutateAsync(sanitizedPhone);
      setIsOtpSent(true);
      setError('');
      setResendTimer(30); // 30 second cooldown
      setTimeout(() => otpInputRef.current?.focus(), 120);
    } catch (e) {
      setError(getErrorMessage(e, 'Unable to send OTP. Please try again.'));
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      setOtp(''); // Clear previous OTP
      await requestOtpMutation.mutateAsync(sanitizedPhone);
      setResendTimer(30); // 30 second cooldown
      setError('');
      setTimeout(() => otpInputRef.current?.focus(), 120);
    } catch (e) {
      setError(getErrorMessage(e, 'Unable to resend OTP. Please try again.'));
    }
  };

  const changePhoneNumber = () => {
    setIsOtpSent(false);
    setOtp('');
    setError('');
    setResendTimer(0);
  };

  const verifyOtp = async () => {
    if (!canVerifyOtp) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    try {
      const session = await verifyOtpMutation.mutateAsync({
        phoneNumber: sanitizedPhone,
        otp: otp.trim(),
        name: name.trim(),
        city: city.trim() || routeCity || undefined,
        deviceInterest: variant?.model_name ?? modelName ?? undefined,
        variantId: variant?.id,
        deviceId: variant?.device_id,
        brandName,
        questions,
        conditionData,
        accessoriesData,
      });

      setSession(session);
      setError('');
      if (isSellFlow) {
        navigation.navigate('PriceUnlock', {
          variant,
          conditionData,
          accessoriesData,
          questions,
          city: city.trim() || routeCity || undefined,
          modelName,
          brandName,
          category: route.params && 'category' in route.params ? (route.params as any).category : undefined,
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (e) {
      setError(getErrorMessage(e, 'OTP verification failed.'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandWrap}>
            <Image
              source={require('../../sellkar-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>SellkarIndia</Text>
            <Text style={styles.brandSubtitle}>SECURE PRICE VERIFICATION</Text>
          </View>

          <View style={styles.authCard}>
            <Text style={styles.title}>
              {isSellFlow ? 'Verify to unlock your final price' : 'Login to your account'}
            </Text>
            <Text style={styles.subtitle}>
              {isSellFlow
                ? 'Enter your details and complete OTP verification to continue.'
                : 'Use your mobile number to continue. Login and registration happen in one OTP step.'}
            </Text>

            <TextInput
              placeholder="Enter full name"
              placeholderTextColor="#94A3B8"
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              returnKeyType="next"
            />

            <TextInput
              placeholder="City (optional)"
              placeholderTextColor="#94A3B8"
              style={styles.nameInput}
              value={city}
              onChangeText={setCity}
              returnKeyType="next"
            />

            <View style={[styles.phoneRow, isOtpSent && styles.phoneRowDisabled]}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                style={styles.phoneInput}
                value={sanitizedPhone}
                onChangeText={(value: string) => {
                  // Only allow digits, no dashes/spaces
                  const digits = value.replace(/\D/g, '').slice(0, 10);
                  setPhone(digits);
                }}
                editable={!isOtpSent}
                maxLength={10}
              />
            </View>

            {isOtpSent && (
              <Pressable
                style={({ pressed }: { pressed: boolean }) => [
                  styles.changeNumberButton,
                  pressed && styles.changeNumberButtonPressed,
                ]}
                onPress={changePhoneNumber}
              >
                <MaterialCommunityIcons name="pencil" size={14} color="#0F4FA8" />
                <Text style={styles.changeNumberText}>Change Number</Text>
              </Pressable>
            )}

            {isOtpSent && (
              <>
                <Text style={styles.otpLabel}>Enter OTP</Text>
                <Pressable
                  style={styles.digitGrid}
                  onPress={() => otpInputRef.current?.focus()}
                >
                  {Array.from({ length: 6 }).map((_, index) => {
                    const char = otp[index] ?? '';
                    return (
                      <View key={index} style={[styles.digitBox, char && styles.digitBoxFilled]}>
                        <Text style={styles.digitText}>{char}</Text>
                      </View>
                    );
                  })}
                </Pressable>
                <TextInput
                  ref={otpInputRef}
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={(value: string) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  style={styles.hiddenInput}
                />

                <Pressable
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.resendButton,
                    resendTimer > 0 || requestOtpMutation.isPending
                      ? styles.resendButtonDisabled
                      : null,
                    pressed && resendTimer === 0 ? styles.resendButtonPressed : null,
                  ]}
                  disabled={resendTimer > 0 || requestOtpMutation.isPending}
                  onPress={resendOtp}
                >
                  <MaterialCommunityIcons
                    name="refresh"
                    size={16}
                    color={resendTimer > 0 || requestOtpMutation.isPending ? '#94A3B8' : '#0F4FA8'}
                  />
                  <Text
                    style={[
                      styles.resendText,
                      (resendTimer > 0 || requestOtpMutation.isPending) && styles.resendTextDisabled,
                    ]}
                  >
                    {requestOtpMutation.isPending
                      ? 'Sending...'
                      : resendTimer > 0
                        ? `Resend OTP in ${resendTimer}s`
                        : 'Resend OTP'}
                  </Text>
                </Pressable>
              </>
            )}

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              style={({ pressed }: { pressed: boolean }) => [
                styles.nextButton,
                (!isOtpSent && !canSendOtp) || (isOtpSent && !canVerifyOtp)
                  ? styles.nextButtonDisabled
                  : null,
                requestOtpMutation.isPending || verifyOtpMutation.isPending
                  ? styles.nextButtonDisabled
                  : null,
                pressed ? styles.nextButtonPressed : null,
              ]}
              disabled={
                (!isOtpSent && !canSendOtp) ||
                (isOtpSent && !canVerifyOtp) ||
                requestOtpMutation.isPending ||
                verifyOtpMutation.isPending
              }
              onPress={isOtpSent ? verifyOtp : sendOtp}
            >
              <Text style={styles.nextText}>
                {requestOtpMutation.isPending || verifyOtpMutation.isPending
                  ? 'Please wait...'
                  : isOtpSent
                    ? 'Verify OTP'
                    : 'Continue with OTP'}
              </Text>
            </Pressable>

            <View style={styles.securityRow}>
              <MaterialCommunityIcons name="shield-check-outline" size={15} color="#64748B" />
              <Text style={styles.securityText}>100% SECURE VERIFICATION</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2F6',
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
    flexGrow: 1,
    justifyContent: 'center',
  },
  brandWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    marginTop: 4,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    color: '#64748B',
  },
  authCard: {
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: -2,
  },
  subtitle: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  nameInput: {
    marginTop: 14,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    color: '#0F172A',
    fontWeight: '600',
  },
  phoneRow: {
    marginTop: 12,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: COLORS.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  phoneRowDisabled: {
    opacity: 0.85,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  phoneInput: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 8,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  changeNumberButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6,
  },
  changeNumberButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.7,
  },
  changeNumberText: {
    color: '#0F4FA8',
    fontSize: 13,
    fontWeight: '700',
  },
  digitGrid: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  digitBox: {
    width: 36,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBoxFilled: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: '#EEF2FF',
  },
  digitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  otpLabel: {
    marginTop: 14,
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  resendButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  resendText: {
    color: '#0F4FA8',
    fontSize: 14,
    fontWeight: '700',
  },
  resendTextDisabled: {
    color: '#94A3B8',
  },
  hint: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 8,
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  nextButton: {
    marginTop: 14,
    backgroundColor: '#0F4FA8',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#93A9CB',
  },
  nextButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  nextText: {
    color: COLORS.WHITE,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  securityRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
});

export default AuthScreen;
