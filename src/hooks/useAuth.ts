import { clearSession, useRequestOtpMutation, useVerifyOtpMutation } from '../api';
import { useAuthStore } from '../store';

export const useAuthHook = () => {
  const requestOtpMutation = useRequestOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const { setSession, logout: clearStore } = useAuthStore();

  const requestOtp = async (phoneNumber: string) => {
    try {
      return await requestOtpMutation.mutateAsync(phoneNumber);
    } catch (error) {
      console.error('OTP request failed:', error);
      throw error;
    }
  };

  const verifyOtp = async (payload: {
    phoneNumber: string;
    otp: string;
    name?: string;
    city?: string;
    deviceInterest?: string;
  }) => {
    try {
      const session = await verifyOtpMutation.mutateAsync(payload);
      setSession(session);
      return session;
    } catch (error) {
      console.error('OTP verify failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearSession();
      clearStore();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return { requestOtp, verifyOtp, logout };
};
