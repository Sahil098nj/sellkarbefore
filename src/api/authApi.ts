import { useMutation, useQuery } from '@tanstack/react-query';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { firebaseAuth } from '../utils/firebaseConfig';
import { supabase } from '../utils/supabaseClient';
import { getAsyncJSON, removeAsyncItem, setAsyncItem } from '../utils/asyncStorageHelper';
import { STORAGE_KEYS } from '../constants';

// Holds the Firebase confirmation result between postAuthOtp and postAuthVerify calls.
let _pendingConfirmation: FirebaseAuthTypes.ConfirmationResult | null = null;
let _pendingVerificationId: string | null = null;

const mapFirebaseAuthError = (error: any): string => {
  const code = String(error?.code || '');

  if (code.includes('invalid-phone-number')) return 'Invalid phone number format.';
  if (code.includes('missing-phone-number')) return 'Phone number is required.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Please wait and try again.';
  if (code.includes('quota-exceeded')) return 'OTP quota exceeded. Please try again later.';
  if (code.includes('invalid-verification-code')) return 'Invalid OTP. Please check and retry.';
  if (code.includes('session-expired')) return 'OTP expired. Please request a new OTP.';
  if (code.includes('missing-verification-code')) return 'Please enter the OTP code.';
  if (code.includes('app-not-authorized')) {
    return 'This app is not authorized for Firebase Phone Auth. Check package name/SHA in Firebase.';
  }

  return error?.message || 'OTP request failed. Please try again.';
};

export interface CustomerProfile {
  id: string;
  name: string | null;
  phone_number: string;
  city: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PickupRequest {
  id: string;
  customer_id: string;
  device_name: string;
  device_variant: string | null;
  condition_answers: Record<string, any> | null;
  price_final: number;
  pickup_address: string;
  city: string;
  status: 'scheduled' | 'picked' | 'completed';
  created_at: string;
}

interface SessionPayload {
  token: string;
  user: {
    id: string;
    name: string;
    phone: string;
    city?: string | null;
    leadId?: string | null;
  };
}

const normalizePhone = (phone: string) => phone.replace(/\D/g, '').slice(-10);

const logActivitySafe = async (customerId: string, action: string, metadata?: Record<string, any>) => {
  try {
    await supabase.from('customer_activity_history').insert({
      customer_id: customerId,
      action,
      metadata: metadata ?? {},
      source: 'app',
      created_at: new Date().toISOString(),
    });
  } catch {
    // Activity tracking is best-effort and should not block conversion flow.
  }
};

const createLeadSafe = async ({
  name,
  phone,
  deviceInterest,
}: {
  name?: string;
  phone: string;
  deviceInterest?: string;
}): Promise<string | null> => {
  const primaryPayload = {
    phone_number: phone,
    name: name ?? null,
    device_interest: deviceInterest ?? null,
    source: 'app',
    status: 'lead',
    created_at: new Date().toISOString(),
  };

  const primaryInsert = await supabase.from('leads').insert(primaryPayload).select('id').single();
  if (!primaryInsert.error && primaryInsert.data?.id) {
    return primaryInsert.data.id as string;
  }

  const fallbackPayload = {
    phone_number: phone,
    customer_name: name ?? null,
    verified_phone: phone,
    is_phone_verified: true,
    created_at: new Date().toISOString(),
  };

  const fallbackInsert = await supabase.from('leads').insert(fallbackPayload).select('id').single();
  if (!fallbackInsert.error && fallbackInsert.data?.id) {
    return fallbackInsert.data.id as string;
  }

  return null;
};

export const postAuthOtp = async (phoneNumber: string) => {
  const phone = normalizePhone(phoneNumber);
  if (phone.length !== 10) {
    throw new Error('Please enter a valid 10-digit phone number.');
  }

  try {
    const confirmation = await firebaseAuth().signInWithPhoneNumber('+91' + phone);
    _pendingConfirmation = confirmation;
    _pendingVerificationId = confirmation.verificationId;
  } catch (err: any) {
    _pendingConfirmation = null;
    _pendingVerificationId = null;
    throw new Error(mapFirebaseAuthError(err));
  }

  try {
    await supabase.from('customer_login_history').insert({
      phone_number: phone,
      event: 'otp_requested',
      source: 'app',
      created_at: new Date().toISOString(),
    });
  } catch {
    // Login history schema can vary; auth should still continue.
  }

  return { success: true, phone, expiresInSeconds: 300 };
};

export const postAuthVerify = async (payload: {
  phoneNumber: string;
  otp: string;
  name?: string;
  city?: string;
  deviceInterest?: string;
}): Promise<SessionPayload> => {
  const phone = normalizePhone(payload.phoneNumber);
  const otpValue = payload.otp.trim();

  if (!_pendingConfirmation && !_pendingVerificationId) {
    throw new Error('OTP session expired. Please request a new OTP.');
  }

  try {
    if (_pendingConfirmation) {
      await _pendingConfirmation.confirm(otpValue);
    } else if (_pendingVerificationId) {
      const credential = firebaseAuth.PhoneAuthProvider.credential(_pendingVerificationId, otpValue);
      await firebaseAuth().signInWithCredential(credential);
    }

    _pendingConfirmation = null;
    _pendingVerificationId = null;
  } catch (err: any) {
    throw new Error(mapFirebaseAuthError(err));
  }

  const profileLookup = await supabase
    .from('customer_profiles')
    .select('id, name, phone_number, city')
    .eq('phone_number', phone)
    .maybeSingle();

  if (profileLookup.error) {
    throw new Error(profileLookup.error.message || 'Failed to fetch customer profile.');
  }

  let profile = profileLookup.data as CustomerProfile | null;

  if (!profile) {
    const insertProfile = await supabase
      .from('customer_profiles')
      .insert({
        phone_number: phone,
        name: payload.name?.trim() || null,
        city: payload.city?.trim() || null,
      })
      .select('id, name, phone_number, city')
      .single();

    if (insertProfile.error) {
      throw new Error(insertProfile.error.message || 'Failed to create customer profile.');
    }
    profile = insertProfile.data as CustomerProfile;
  } else {
    const shouldUpdateName = !!payload.name?.trim() && payload.name?.trim() !== profile.name;
    const shouldUpdateCity = !!payload.city?.trim() && payload.city?.trim() !== profile.city;
    if (shouldUpdateName || shouldUpdateCity) {
      const updateRes = await supabase
        .from('customer_profiles')
        .update({
          name: shouldUpdateName ? payload.name?.trim() : profile.name,
          city: shouldUpdateCity ? payload.city?.trim() : profile.city,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select('id, name, phone_number, city')
        .single();

      if (!updateRes.error) {
        profile = updateRes.data as CustomerProfile;
      }
    }
  }

  const leadId = await createLeadSafe({
    name: payload.name?.trim() || profile.name || undefined,
    phone,
    deviceInterest: payload.deviceInterest,
  });

  const session: SessionPayload = {
    token: `sk_${profile.id}_${Date.now()}`,
    user: {
      id: profile.id,
      name: profile.name || payload.name?.trim() || 'Customer',
      phone: profile.phone_number,
      city: profile.city,
      leadId,
    },
  };

  await setAsyncItem(STORAGE_KEYS.USER_TOKEN, session.token);
  await setAsyncItem(STORAGE_KEYS.USER_DATA, session.user);

  await logActivitySafe(profile.id, 'login', { source: 'app' });
  return session;
};

export const loadSession = async (): Promise<SessionPayload | null> => {
  const token = await getAsyncJSON(STORAGE_KEYS.USER_TOKEN);
  const user = await getAsyncJSON(STORAGE_KEYS.USER_DATA);

  if (!token || !user?.id) {
    return null;
  }

  return { token, user } as SessionPayload;
};

export const clearSession = async () => {
  await removeAsyncItem(STORAGE_KEYS.USER_TOKEN);
  await removeAsyncItem(STORAGE_KEYS.USER_DATA);
};

export const deleteLeadById = async (leadId: string) => {
  if (!leadId) return;
  await supabase.from('leads').delete().eq('id', leadId);
};

export const postLeadCreate = async (payload: {
  phoneNumber: string;
  name?: string;
  deviceInterest?: string;
}) => {
  const phone = normalizePhone(payload.phoneNumber);
  const leadId = await createLeadSafe({
    name: payload.name,
    phone,
    deviceInterest: payload.deviceInterest,
  });
  return { id: leadId, phone_number: phone };
};

export const getProfile = async (customerId: string) => {
  const { data, error } = await supabase
    .from('customer_profiles')
    .select('id, name, phone_number, city, created_at, updated_at')
    .eq('id', customerId)
    .single();
  if (error) throw error;
  return data as CustomerProfile;
};

export const getOrdersHistory = async (customerId: string) => {
  const { data, error } = await supabase
    .from('pickup_requests')
    .select('id, customer_id, device_name, device_variant, condition_answers, price_final, pickup_address, city, status, created_at')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PickupRequest[];
};

export const postPickupCreate = async (payload: {
  customerId: string;
  leadId?: string | null;
  deviceName: string;
  deviceVariant?: string | null;
  conditionAnswers?: Record<string, any>;
  priceFinal: number;
  pickupAddress: string;
  city: string;
  status?: 'scheduled' | 'picked' | 'completed';
}) => {
  const insertRes = await supabase
    .from('pickup_requests')
    .insert({
      customer_id: payload.customerId,
      device_name: payload.deviceName,
      device_variant: payload.deviceVariant ?? null,
      condition_answers: payload.conditionAnswers ?? {},
      price_final: payload.priceFinal,
      pickup_address: payload.pickupAddress,
      city: payload.city,
      status: payload.status ?? 'scheduled',
      created_at: new Date().toISOString(),
    })
    .select('id, customer_id, device_name, device_variant, condition_answers, price_final, pickup_address, city, status, created_at')
    .single();

  if (insertRes.error) throw insertRes.error;

  if (payload.leadId) {
    await deleteLeadById(payload.leadId);
  }

  await logActivitySafe(payload.customerId, 'completed_order', {
    pickup_request_id: insertRes.data.id,
  });

  return insertRes.data as PickupRequest;
};

export const useRequestOtpMutation = () =>
  useMutation({
    mutationFn: postAuthOtp,
  });

export const useVerifyOtpMutation = () =>
  useMutation({
    mutationFn: postAuthVerify,
  });

export const useProfileQuery = (customerId?: string) =>
  useQuery({
    queryKey: ['customer-profile', customerId],
    enabled: !!customerId,
    queryFn: async () => getProfile(customerId as string),
  });

export const useOrderHistoryQuery = (customerId?: string) =>
  useQuery({
    queryKey: ['orders-history', customerId],
    enabled: !!customerId,
    queryFn: async () => getOrdersHistory(customerId as string),
  });

export const useUpdateProfileMutation = () =>
  useMutation({
    mutationFn: async (payload: { customerId: string; name?: string; city?: string }) => {
      const { data, error } = await supabase
        .from('customer_profiles')
        .update({
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.city !== undefined ? { city: payload.city } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.customerId)
        .select('id, name, phone_number, city, created_at, updated_at')
        .single();
      if (error) throw error;
      return data as CustomerProfile;
    },
  });

export const useCreatePickupMutation = () =>
  useMutation({
    mutationFn: postPickupCreate,
  });

// Kept for backward compatibility in places still importing useAuthApi.
export const useAuthApi = () => ({
  requestOtpMutation: useRequestOtpMutation(),
  verifyOtpMutation: useVerifyOtpMutation(),
});
