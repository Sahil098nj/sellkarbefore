import { useMutation, useQuery } from '@tanstack/react-query';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import Config from 'react-native-config';
import { firebaseAuth } from '../utils/firebaseConfig';
import { supabase } from '../utils/supabaseClient';
import { getAsyncItem, getAsyncJSON, removeAsyncItem, setAsyncItem } from '../utils/asyncStorageHelper';
import { STORAGE_KEYS } from '../constants';

// Holds the Firebase confirmation result between postAuthOtp and postAuthVerify calls.
let _pendingConfirmation: FirebaseAuthTypes.ConfirmationResult | null = null;
let _pendingVerificationId: string | null = null;
let _pendingDevBypassPhone: string | null = null;

const firebaseTestModeEnabled =
  __DEV__ && String(Config.FIREBASE_AUTH_TEST_MODE || '').toLowerCase() === 'true';

const firebaseTestPhones = String(Config.FIREBASE_AUTH_TEST_PHONES || '')
  .split(',')
  .map((value) => value.trim())
  .map((value) => value.replace(/\D/g, '').slice(-10))
  .filter((value) => value.length === 10);

const firebaseTestOtp = String(Config.FIREBASE_AUTH_TEST_OTP || '').trim();
const firebaseDevBypassEnabled =
  __DEV__ && String(Config.FIREBASE_AUTH_DEV_BYPASS || 'false').toLowerCase() === 'true';
const firebaseAutoDevFallbackEnabled =
  __DEV__ && String(Config.FIREBASE_AUTH_AUTO_DEV_FALLBACK || 'true').toLowerCase() !== 'false';
const resolvedDevBypassOtp = firebaseTestOtp || '888888';

const isFirebaseTestPhone = (phone: string) =>
  firebaseTestModeEnabled && firebaseTestPhones.includes(phone);

const isFirebaseTestBypassEnabled = (phone: string) =>
  isFirebaseTestPhone(phone) && firebaseTestOtp.length > 0;

// Utility function to check if a phone is configured for testing
export const isPhoneConfiguredForTesting = (phone: string) => {
  const normalizedPhone = normalizePhone(phone);
  return isFirebaseTestPhone(normalizedPhone);
};

// Utility function to get available test phones
export const getAvailableTestPhones = () => {
  return firebaseTestPhones;
};

export const getFirebaseAuthDevConfig = () => ({
  testModeEnabled: firebaseTestModeEnabled,
  devBypassEnabled: firebaseDevBypassEnabled,
  autoDevFallbackEnabled: firebaseAutoDevFallbackEnabled,
  testOtp: resolvedDevBypassOtp,
  testPhones: firebaseTestPhones,
});

const getFirebaseTestVerificationId = (phone: string) => `test:${phone}`;

const isDevBypassFirebaseError = (error: any) => {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();
  return (
    code.includes('missing-client-identifier') ||
    message.includes('missing-client-identifier') ||
    code.includes('app-not-authorized') ||
    code.includes('recaptcha') ||
    code.includes('captcha') ||
    message.includes('play integrity')
  );
};

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
  if (code.includes('recaptcha') || code.includes('captcha')) {
    return 'reCAPTCHA verification required. Please complete the verification in your browser.';
  }
  if (code.includes('network-request-failed')) {
    return 'Network error. Please check your internet connection and try again.';
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
  status: 'new' | 'rnr' | 'not-interested' | 'scheduled' | 'rescheduled' | 'in-progress' | 'completed' | 'cancelled' | 'pending' | 'confirmed' | 'in-transit' | 'picked';
  created_at: string;
  order_id?: string | null;
}

export interface PickupTrackingRequest {
  id: string;
  order_id?: string | null;
  user_phone?: string | null;
  device_id?: string | null;
  variant_id?: string | null;
  city_id?: string | null;
  condition?: string | null;
  age_group?: string | null;
  final_price: number;
  customer_name: string;
  address: string;
  pickup_date?: string | null;
  pickup_time?: string | null;
  status: string;
  created_at: string;
  notes?: string | null;
  updated_by?: string | null;
  submitted_by?: string | null;
  device?: { model_name?: string | null } | null;
  variant?: { storage_gb?: string | null; ram_options?: { size_gb?: number | null } | null } | null;
  city_row?: { name?: string | null } | null;
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

const generateOrderId = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const ts = String(now.getTime()).slice(-6);
  return `SK-${y}${m}${d}-${ts}`;
};

const buildLeadNotesSummary = (details: {
  brandName?: string;
  deviceAge?: string;
  overallCondition?: string;
  canCall?: boolean | null;
  touchOk?: boolean | null;
  screenOriginal?: boolean | null;
  batteryOk?: boolean | null;
  hasCharger?: boolean | null;
  hasBox?: boolean | null;
  hasBill?: boolean | null;
}) => {
  const parts: string[] = [];
  if (details.brandName?.trim()) parts.push(`Brand: ${details.brandName.trim()}`);
  if (details.deviceAge?.trim()) parts.push(`Age: ${details.deviceAge.trim()}`);
  if (details.overallCondition?.trim()) parts.push(`Condition: ${details.overallCondition.trim()}`);
  if (typeof details.canCall === 'boolean') parts.push(`Calls: ${details.canCall ? 'yes' : 'no'}`);
  if (typeof details.touchOk === 'boolean') parts.push(`Touch: ${details.touchOk ? 'yes' : 'no'}`);
  if (typeof details.screenOriginal === 'boolean') parts.push(`Screen original: ${details.screenOriginal ? 'yes' : 'no'}`);
  if (typeof details.batteryOk === 'boolean') parts.push(`Battery healthy: ${details.batteryOk ? 'yes' : 'no'}`);
  if (typeof details.hasCharger === 'boolean') parts.push(`Charger: ${details.hasCharger ? 'yes' : 'no'}`);
  if (typeof details.hasBox === 'boolean') parts.push(`Box: ${details.hasBox ? 'yes' : 'no'}`);
  if (typeof details.hasBill === 'boolean') parts.push(`Bill: ${details.hasBill ? 'yes' : 'no'}`);
  return parts.length ? parts.join(' | ') : undefined;
};

const isMissingColumnError = (message?: string) =>
  !!message && message.includes('column') && message.includes('does not exist');

const formatSupabaseError = (error: any) => {
  if (!error) return 'Unknown error';
  const message = error.message || 'Unknown error';
  const details = error.details ? ` | details: ${error.details}` : '';
  const hint = error.hint ? ` | hint: ${error.hint}` : '';
  const code = error.code ? ` | code: ${error.code}` : '';
  return `${message}${details}${hint}${code}`;
};

const updateLeadFieldsSafe = async (leadId: string, fields: Record<string, any>) => {
  for (const [column, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ [column]: value } as any)
        .eq('id', leadId);

      if (error && !isMissingColumnError(error.message)) {
        console.warn(`[lead-update] Failed updating ${column}:`, error.message);
      }
      if (error && __DEV__) {
        console.log(`[lead-update][debug] leadId=${leadId} column=${column} result=${formatSupabaseError(error)}`);
      }
    } catch {
      // Best effort only; never block user flow for lead metadata sync.
    }
  }
};

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
  city,
  variantId,
  deviceId,
  brandName,
  deviceAge,
  overallCondition,
  canCall,
  touchOk,
  screenOriginal,
  batteryOk,
  hasCharger,
  hasBox,
  hasBill,
}: {
  customerId?: string;
  name?: string;
  phone: string;
  city?: string;
  deviceInterest?: string;
  variantId?: string;
  deviceId?: string;
  brandName?: string;
  deviceAge?: string;
  overallCondition?: string;
  canCall?: boolean | null;
  touchOk?: boolean | null;
  screenOriginal?: boolean | null;
  batteryOk?: boolean | null;
  hasCharger?: boolean;
  hasBox?: boolean;
  hasBill?: boolean;
}): Promise<string | null> => {
  const normalizedPhone = normalizePhone(phone);
  const resolvedCustomerName = name?.trim() || 'Customer';

  // Look up city_id if a city name was provided
  let cityId: string | null = null;
  if (city) {
    const { data: cityRow } = await supabase
      .from('cities')
      .select('id')
      .ilike('name', city.trim())
      .maybeSingle();
    cityId = cityRow?.id ?? null;
  }

  const leadNotes = buildLeadNotesSummary({
    brandName,
    deviceAge,
    overallCondition,
    canCall,
    touchOk,
    screenOriginal,
    batteryOk,
    hasCharger,
    hasBox,
    hasBill,
  });

  const baseLeadFields = {
    customer_name: resolvedCustomerName,
    phone_number: normalizedPhone,
    verified_phone: normalizedPhone,
    is_phone_verified: true,
    device_id: deviceId ?? null,
    variant_id: variantId ?? null,
    city_id: cityId,
    brand_name: brandName ?? null,
    age_group: deviceAge ?? null,
    condition: overallCondition ?? null,
    device_powers_on: canCall ?? null,
    display_condition: overallCondition ?? null,
    body_condition: overallCondition ?? null,
    overall_condition: overallCondition ?? null,
    can_make_calls: canCall ?? null,
    is_touch_working: touchOk ?? null,
    is_screen_original: screenOriginal ?? null,
    is_battery_healthy: batteryOk ?? null,
    has_charger: hasCharger ?? null,
    has_box: hasBox ?? null,
    has_bill: hasBill ?? null,
    ...(leadNotes ? { lead_notes: leadNotes } : {}),
    converted_to_pickup: false,
    pickup_request_id: null,
    source_channel: 'app',
    lead_status: 'RNR',
    updated_at: new Date().toISOString(),
  };

  // Restrict updates to columns present in the current leads schema.
  const leadEnrichmentFields = {
    ...baseLeadFields,
    source_channel: 'app',
  };

  // Keep one active lead per phone for app flow and keep enriching it as user progresses.
  try {
    const existingLeadRes = await supabase
      .from('leads')
      .select('id, converted_to_pickup')
      .or(`phone_number.eq.${normalizedPhone},verified_phone.eq.${normalizedPhone}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!existingLeadRes.error && existingLeadRes.data?.id && !existingLeadRes.data.converted_to_pickup) {
      await updateLeadFieldsSafe(existingLeadRes.data.id as string, leadEnrichmentFields);
      if (__DEV__) {
        console.log(`[lead-create][debug] Reused existing lead ${existingLeadRes.data.id} for phone=${normalizedPhone}`);
      }
      return existingLeadRes.data.id as string;
    }

    if (existingLeadRes.error && __DEV__) {
      console.log(`[lead-create][debug] Existing lead lookup failed for phone=${normalizedPhone}: ${formatSupabaseError(existingLeadRes.error)}`);
    }
  } catch {
    // Fall through to insertion path.
  }

  const payload = {
    ...baseLeadFields,
    created_at: new Date().toISOString(),
  };

  const result = await supabase.from('leads').insert(payload).select('id').single();
  if (result.error || !result.data?.id) {
    if (__DEV__) {
      console.log(`[lead-create][debug] Primary lead insert failed for phone=${normalizedPhone}: ${formatSupabaseError(result.error)}`);
    }

    // Progressive fallbacks for lean/legacy schemas.
    const fallbackPayloads: Array<Record<string, any>> = [
      {
        customer_name: resolvedCustomerName,
        phone_number: normalizedPhone,
        verified_phone: normalizedPhone,
        is_phone_verified: true,
        condition: overallCondition ?? null,
        device_powers_on: canCall ?? null,
        display_condition: overallCondition ?? null,
        body_condition: overallCondition ?? null,
        overall_condition: overallCondition ?? null,
        can_make_calls: canCall ?? null,
        is_touch_working: touchOk ?? null,
        is_screen_original: screenOriginal ?? null,
        is_battery_healthy: batteryOk ?? null,
        has_charger: hasCharger ?? null,
        has_box: hasBox ?? null,
        has_bill: hasBill ?? null,
        ...(leadNotes ? { lead_notes: leadNotes } : {}),
        source_channel: 'app',
        lead_status: 'RNR',
        created_at: new Date().toISOString(),
      },
      {
        customer_name: resolvedCustomerName,
        phone_number: normalizedPhone,
        verified_phone: normalizedPhone,
        is_phone_verified: true,
        condition: overallCondition ?? null,
        device_powers_on: canCall ?? null,
        display_condition: overallCondition ?? null,
        body_condition: overallCondition ?? null,
        overall_condition: overallCondition ?? null,
        can_make_calls: canCall ?? null,
        is_touch_working: touchOk ?? null,
        is_screen_original: screenOriginal ?? null,
        is_battery_healthy: batteryOk ?? null,
        has_charger: hasCharger ?? null,
        has_box: hasBox ?? null,
        has_bill: hasBill ?? null,
        ...(leadNotes ? { lead_notes: leadNotes } : {}),
        source_channel: 'app',
        lead_status: 'RNR',
        created_at: new Date().toISOString(),
      },
      {
        customer_name: resolvedCustomerName,
        phone_number: normalizedPhone,
        condition: overallCondition ?? null,
        device_powers_on: canCall ?? null,
        display_condition: overallCondition ?? null,
        body_condition: overallCondition ?? null,
        overall_condition: overallCondition ?? null,
        can_make_calls: canCall ?? null,
        is_touch_working: touchOk ?? null,
        is_screen_original: screenOriginal ?? null,
        is_battery_healthy: batteryOk ?? null,
        has_charger: hasCharger ?? null,
        has_box: hasBox ?? null,
        has_bill: hasBill ?? null,
        ...(leadNotes ? { lead_notes: leadNotes } : {}),
        source_channel: 'app',
        lead_status: 'RNR',
        created_at: new Date().toISOString(),
      },
      {
        customer_name: resolvedCustomerName,
        verified_phone: normalizedPhone,
        condition: overallCondition ?? null,
        device_powers_on: canCall ?? null,
        display_condition: overallCondition ?? null,
        body_condition: overallCondition ?? null,
        overall_condition: overallCondition ?? null,
        can_make_calls: canCall ?? null,
        is_touch_working: touchOk ?? null,
        is_screen_original: screenOriginal ?? null,
        is_battery_healthy: batteryOk ?? null,
        has_charger: hasCharger ?? null,
        has_box: hasBox ?? null,
        has_bill: hasBill ?? null,
        ...(leadNotes ? { lead_notes: leadNotes } : {}),
        source_channel: 'app',
        lead_status: 'RNR',
        created_at: new Date().toISOString(),
      },
    ];

    for (const fallbackPayload of fallbackPayloads) {
      const fallbackInsert = await supabase
        .from('leads')
        .insert(fallbackPayload)
        .select('id')
        .single();

      if (!fallbackInsert.error && fallbackInsert.data?.id) {
        if (__DEV__) {
          console.log(`[lead-create][debug] Fallback lead insert succeeded for phone=${normalizedPhone} leadId=${fallbackInsert.data.id}`);
        }
        await updateLeadFieldsSafe(fallbackInsert.data.id as string, {
          ...leadEnrichmentFields,
        });
        return fallbackInsert.data.id as string;
      }

      if (__DEV__) {
        console.log(`[lead-create][debug] Fallback lead insert failed for phone=${normalizedPhone}: ${formatSupabaseError(fallbackInsert.error)}`);
      }
    }

    if (__DEV__) {
      console.log(`[lead-create][debug] All lead insert attempts failed for phone=${normalizedPhone}`);
    }
    return null;
  }

  // Best-effort metadata updates across varied schemas.
  await updateLeadFieldsSafe(result.data.id as string, {
    ...leadEnrichmentFields,
  });

  if (__DEV__) {
    console.log(`[lead-create][debug] Primary lead insert succeeded for phone=${normalizedPhone} leadId=${result.data.id}`);
  }

  return result.data.id as string;
};

export const postAuthOtp = async (phoneNumber: string) => {
  const phone = normalizePhone(phoneNumber);
  if (phone.length !== 10) {
    throw new Error('Please enter a valid 10-digit phone number.');
  }

  _pendingDevBypassPhone = null;

  if (isFirebaseTestBypassEnabled(phone)) {
    _pendingConfirmation = null;
    _pendingVerificationId = getFirebaseTestVerificationId(phone);

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
  }

  // Debug builds still use real Firebase Phone Auth unless explicit test env flags are enabled.
  if (__DEV__ && !isFirebaseTestPhone(phone)) {
    console.warn(
      `[Firebase Auth] Using non-test phone ${phone} in development. ` +
      'Firebase will send a real OTP after app verification succeeds.'
    );
  }

  try {
    const confirmation = await firebaseAuth().signInWithPhoneNumber('+91' + phone);
    _pendingConfirmation = confirmation;
    _pendingVerificationId = confirmation.verificationId;
  } catch (err: any) {
    _pendingConfirmation = null;
    _pendingVerificationId = null;

    if ((firebaseDevBypassEnabled || firebaseAutoDevFallbackEnabled) && isDevBypassFirebaseError(err)) {
      _pendingVerificationId = getFirebaseTestVerificationId(phone);
      _pendingDevBypassPhone = phone;

      console.warn(
        `[Firebase Auth][DEV FALLBACK] Falling back for phone ${phone}. ` +
        `Use OTP ${resolvedDevBypassOtp} for local testing.`
      );

      return { success: true, phone, expiresInSeconds: 300 };
    }

    // Provide specific guidance for reCAPTCHA issues in development
    if (__DEV__ && String(err?.code || '').includes('recaptcha')) {
      throw new Error(
        'reCAPTCHA verification required. Complete Firebase app verification to send a real OTP.'
      );
    }

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
  variantId?: string;
  deviceId?: string;
  brandName?: string;
  questions?: { canCall: boolean | null; touchOk: boolean | null; screenOriginal: boolean | null; batteryOk?: boolean | null };
  conditionData?: { deviceAge?: string; overallCondition?: string };
  accessoriesData?: string[];
}): Promise<SessionPayload> => {
  const phone = normalizePhone(payload.phoneNumber);
  const otpValue = payload.otp.trim();
  const isTestBypass = isFirebaseTestBypassEnabled(phone);
  const expectedTestVerificationId = getFirebaseTestVerificationId(phone);
  const isDevBypass =
    firebaseDevBypassEnabled &&
    _pendingDevBypassPhone === phone &&
    _pendingVerificationId === expectedTestVerificationId;

  if (isTestBypass || isDevBypass) {
    if (_pendingVerificationId !== expectedTestVerificationId) {
      throw new Error('OTP session expired. Please request a new OTP.');
    }

    const expectedOtp = isTestBypass ? firebaseTestOtp : resolvedDevBypassOtp;
    if (otpValue !== expectedOtp) {
      throw new Error('Invalid OTP. Please check and retry.');
    }

    _pendingConfirmation = null;
    _pendingVerificationId = null;
    _pendingDevBypassPhone = null;
  } else {
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
      _pendingDevBypassPhone = null;
    } catch (err: any) {
      throw new Error(mapFirebaseAuthError(err));
    }
  }

  // Try full select first; if columns like name/city don't exist yet, fall back to minimal select.
  let profileLookup = await supabase
    .from('customer_profiles')
    .select('id, name, phone_number, city')
    .eq('phone_number', phone)
    .maybeSingle();

  const missingColumn =
    profileLookup.error?.message?.includes('column') &&
    profileLookup.error?.message?.includes('does not exist');

  if (profileLookup.error && !missingColumn) {
    throw new Error(profileLookup.error.message || 'Failed to fetch customer profile.');
  }

  if (missingColumn) {
    // Schema not yet migrated — fall back to id + phone only.
    const fallback = await supabase
      .from('customer_profiles')
      .select('id, phone_number')
      .eq('phone_number', phone)
      .maybeSingle();
    if (fallback.error) {
      throw new Error(fallback.error.message || 'Failed to fetch customer profile.');
    }
    profileLookup = { ...fallback, data: fallback.data ? { ...fallback.data, name: null, city: null } : null } as any;
  }

  let profile = profileLookup.data as CustomerProfile | null;

  if (!profile) {
    // Insert with only the columns that are guaranteed to exist; name/city are best-effort.
    const insertPayload: Record<string, any> = { phone_number: phone };
    if (!missingColumn) {
      insertPayload.name = payload.name?.trim() || null;
      insertPayload.city = payload.city?.trim() || null;
    }

    const insertProfile = await supabase
      .from('customer_profiles')
      .insert(insertPayload)
      .select('id, phone_number')
      .single();

    if (insertProfile.error) {
      throw new Error(insertProfile.error.message || 'Failed to create customer profile.');
    }
    profile = { ...insertProfile.data, name: payload.name?.trim() || null, city: payload.city?.trim() || null } as CustomerProfile;
  } else {
    if (!missingColumn) {
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
  }

  const leadId = await createLeadSafe({
    customerId: profile.id,
    name: payload.name?.trim() || profile.name || undefined,
    phone,
    city: payload.city,
    deviceInterest: payload.deviceInterest,
    variantId: payload.variantId,
    deviceId: payload.deviceId,
    brandName: payload.brandName,
    deviceAge: payload.conditionData?.deviceAge,
    overallCondition: payload.conditionData?.overallCondition,
    canCall: payload.questions?.canCall ?? null,
    touchOk: payload.questions?.touchOk ?? null,
    screenOriginal: payload.questions?.screenOriginal ?? null,
    batteryOk: payload.questions?.batteryOk ?? null,
    hasCharger: payload.accessoriesData?.includes('charger'),
    hasBox: payload.accessoriesData?.includes('box'),
    hasBill: payload.accessoriesData?.includes('bill'),
  });

  if (__DEV__) {
    if (leadId) {
      console.log(`[lead-create][debug] Lead linked after OTP verify: leadId=${leadId} customerId=${profile.id}`);
    } else {
      console.log(`[lead-create][debug] Lead creation returned null after OTP verify for customerId=${profile.id} phone=${phone}`);
    }
  }

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

export const postLeadQuoteSync = async (payload: {
  leadId?: string | null;
  phoneNumber?: string;
  customerName?: string;
  city?: string;
  variantId?: string;
  deviceId?: string;
  brandName?: string;
  finalPrice: number;
  deviceInterest?: string;
}) => {
  let resolvedLeadId = payload.leadId ?? null;

  if (__DEV__) {
    console.log('[lead-sync] Starting quote sync:', {
      existingLeadId: resolvedLeadId,
      phoneNumber: payload.phoneNumber,
      brandName: payload.brandName,
      variantId: payload.variantId,
      deviceId: payload.deviceId,
      finalPrice: payload.finalPrice,
    });
  }

  if (!resolvedLeadId && payload.phoneNumber) {
    if (__DEV__) {
      console.log('[lead-sync] No existing lead found, creating new lead for phone:', payload.phoneNumber);
    }
    
    resolvedLeadId = await createLeadSafe({
      name: payload.customerName ?? 'Customer',
      phone: payload.phoneNumber,
      city: payload.city,
      deviceInterest: payload.deviceInterest,
      variantId: payload.variantId,
      deviceId: payload.deviceId,
      brandName: payload.brandName,
    });
    
    if (__DEV__) {
      console.log('[lead-sync] Lead creation result:', resolvedLeadId);
    }
  }

  if (!resolvedLeadId) {
    return { updated: false, leadId: null };
  }

  if (__DEV__) {
    console.log('[lead-sync] Updating lead fields for leadId:', resolvedLeadId, 'finalPrice:', payload.finalPrice);
  }

  await updateLeadFieldsSafe(resolvedLeadId, {
    source_channel: 'app',
    // Persist quote in canonical leads price column.
    final_price: payload.finalPrice,
    updated_at: new Date().toISOString(),
  });

  if (__DEV__) {
    console.log('[lead-sync] Quote sync completed successfully for leadId:', resolvedLeadId);
  }

  return { updated: true, leadId: resolvedLeadId };
};

export const loadSession = async (): Promise<SessionPayload | null> => {
  const token = await getAsyncItem(STORAGE_KEYS.USER_TOKEN);
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
}) => {
  const phone = normalizePhone(payload.phoneNumber);
  const leadId = await createLeadSafe({ name: payload.name, phone });
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
  const profileRes = await supabase
    .from('customer_profiles')
    .select('phone_number')
    .eq('id', customerId)
    .maybeSingle();

  if (profileRes.error) {
    throw profileRes.error;
  }

  const normalizedPhone = profileRes.data?.phone_number ? normalizePhone(profileRes.data.phone_number) : null;

  const query = supabase
    .from('pickup_requests')
    .select(`
      id,
      user_phone,
      device_id,
      variant_id,
      city_id,
      condition,
      age_group,
      final_price,
      customer_name,
      address,
      pickup_date,
      pickup_time,
      status,
      created_at,
      order_id,
      device:devices!pickup_requests_device_id_fkey (
        model_name
      ),
      variant:variants!pickup_requests_variant_id_fkey (
        storage_gb,
        ram_id,
        ram_options (
          size_gb
        )
      ),
      city_row:cities!pickup_requests_city_id_fkey (
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (normalizedPhone) {
    query.or(`user_phone.eq.+91${normalizedPhone},verified_phone.eq.+91${normalizedPhone}`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const variantLabel = row.variant
      ? [row.variant.storage_gb, row.variant.ram_options?.size_gb ? `${row.variant.ram_options.size_gb} GB RAM` : null]
          .filter(Boolean)
          .join(' / ')
      : null;

    return {
      id: row.id,
      customer_id: customerId,
      device_name: row.device?.model_name ?? row.customer_name ?? 'Device',
      device_variant: variantLabel,
      condition_answers: {
        condition: row.condition,
        age_group: row.age_group,
      },
      price_final: Number(row.final_price ?? 0),
      pickup_address: row.address ?? '',
      city: row.city_row?.name ?? '',
      status: row.status,
      created_at: row.created_at,
      order_id: row.order_id,
    } as PickupRequest;
  });
};

export const getPickupTrackingRequest = async (trackingId: string) => {
  const { data: byOrderId, error: orderIdError } = await supabase
    .from('pickup_requests')
    .select(`
      id,
      order_id,
      user_phone,
      device_id,
      variant_id,
      city_id,
      condition,
      age_group,
      final_price,
      customer_name,
      address,
      pickup_date,
      pickup_time,
      status,
      created_at,
      notes,
      updated_by,
      submitted_by,
      device:devices!pickup_requests_device_id_fkey (
        model_name
      ),
      variant:variants!pickup_requests_variant_id_fkey (
        storage_gb,
        ram_id,
        ram_options (
          size_gb
        )
      ),
      city_row:cities!pickup_requests_city_id_fkey (
        name
      )
    `)
    .or(`order_id.eq.${trackingId},id.eq.${trackingId}`)
    .maybeSingle();

  if (orderIdError) {
    throw orderIdError;
  }

  if (!byOrderId) {
    return null;
  }

  return byOrderId as PickupTrackingRequest;
};

export const postPickupCreate = async (payload: {
  customerId: string;
  leadId?: string | null;
  userPhone?: string;
  customerName?: string;
  deviceId?: string;
  variantId?: string;
  cityId?: string;
  deviceName: string;
  deviceVariant?: string | null;
  conditionAnswers?: Record<string, any>;
  priceFinal: number;
  pickupAddress: string;
  pincode?: string;
  pickupDate?: string;
  pickupTime?: string;
  city: string;
  status?: 'new' | 'rnr' | 'not-interested' | 'scheduled' | 'rescheduled' | 'in-progress' | 'completed' | 'cancelled' | 'pending' | 'confirmed' | 'in-transit' | 'picked';
}) => {
  const normalizeCondition = (value?: string | null) => {
    // Legacy DB enum values are: good | fair | poor
    if (value === 'average') return 'fair';
    if (value === 'below-average') return 'poor';
    return 'good';
  };

  const normalizeAgeGroup = (value?: string | null) => {
    // UI uses 11+ while backend enum expects 12+ for the last slab.
    if (value === '11+') return '12+';
    const allowed = new Set(['0-3', '3-6', '6-11', '12+']);
    return value && allowed.has(value) ? value : '12+';
  };

  const normalizeDate = (value?: string) => {
    if (!value) return new Date().toISOString().slice(0, 10);
    // Accept incoming ids like YYYY-M-D and normalize to YYYY-MM-DD for date column.
    const parts = value.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return value;
  };

  const conditionData = payload.conditionAnswers?.conditionData ?? {};
  const accessoriesData = (payload.conditionAnswers?.accessoriesData ?? []) as string[];
  const questions = payload.conditionAnswers?.questions ?? {};
  const generatedOrderId = generateOrderId();

  let cityId = payload.cityId ?? null;
  if (!cityId && payload.city) {
    const cityLookup = await supabase
      .from('cities')
      .select('id')
      .ilike('name', payload.city.trim())
      .maybeSingle();
    cityId = cityLookup.data?.id ?? null;
  }

  if (!cityId) {
    const fallbackCity = await supabase
      .from('cities')
      .select('id')
      .ilike('name', '%not listed%')
      .maybeSingle();
    cityId = fallbackCity.data?.id ?? null;
  }

  const legacyPayload = {
    order_id: generatedOrderId,
    user_phone: payload.userPhone ? `+91${normalizePhone(payload.userPhone)}` : `+91${normalizePhone(payload.customerId)}`,
    device_id: payload.deviceId,
    variant_id: payload.variantId,
    city_id: cityId,
    condition: normalizeCondition(conditionData?.overallCondition),
    age_group: normalizeAgeGroup(conditionData?.deviceAge),
    has_charger: accessoriesData.includes('charger'),
    has_bill: accessoriesData.includes('bill'),
    has_box: accessoriesData.includes('box'),
    device_powers_on: true,
    display_condition: normalizeCondition(conditionData?.overallCondition),
    body_condition: normalizeCondition(conditionData?.overallCondition),
    final_price: payload.priceFinal,
    customer_name: payload.customerName ?? 'Customer',
    address: payload.pickupAddress,
    pincode: payload.pincode ?? '',
    pickup_date: normalizeDate(payload.pickupDate),
    pickup_time: payload.pickupTime ?? '10:00 AM - 01:00 PM',
    status: payload.status ?? 'scheduled',
    can_make_calls: typeof questions?.canCall === 'boolean' ? questions.canCall : true,
    is_touch_working: typeof questions?.touchOk === 'boolean' ? questions.touchOk : true,
    is_screen_original: typeof questions?.screenOriginal === 'boolean' ? questions.screenOriginal : true,
    is_battery_healthy: typeof questions?.batteryOk === 'boolean' ? questions.batteryOk : true,
    overall_condition: normalizeCondition(conditionData?.overallCondition),
    verified_phone: payload.userPhone ? `+91${normalizePhone(payload.userPhone)}` : null,
    is_phone_verified: true,
    phone_verified_at: new Date().toISOString(),
    source_channel: 'app',
    lead_status: 'scheduled',
  };

  let insertRes = await supabase
    .from('pickup_requests')
    .insert(legacyPayload)
    .select('id, status, created_at, final_price, address')
    .single();

  // Fallback with a compact payload that still targets the same pickup_requests schema.
  // This avoids retrying with incompatible column names such as `city`.
  if (insertRes.error && insertRes.error.message?.includes('column')) {
    insertRes = await supabase
      .from('pickup_requests')
      .insert({
        order_id: generatedOrderId,
        user_phone: payload.userPhone ? `+91${normalizePhone(payload.userPhone)}` : `+91${normalizePhone(payload.customerId)}`,
        device_id: payload.deviceId,
        variant_id: payload.variantId,
        city_id: cityId,
        condition: normalizeCondition(conditionData?.overallCondition),
        age_group: normalizeAgeGroup(conditionData?.deviceAge),
        display_condition: normalizeCondition(conditionData?.overallCondition),
        body_condition: normalizeCondition(conditionData?.overallCondition),
        final_price: payload.priceFinal,
        customer_name: payload.customerName ?? 'Customer',
        address: payload.pickupAddress,
        pincode: payload.pincode ?? '',
        pickup_date: normalizeDate(payload.pickupDate),
        pickup_time: payload.pickupTime ?? '10:00 AM - 01:00 PM',
        source_channel: 'app',
        status: payload.status ?? 'scheduled',
      })
      .select('id, status, created_at, final_price, address')
      .single();
  }

  if (insertRes.error) {
    console.error('[postPickupCreate] Supabase error:', JSON.stringify(insertRes.error));
    throw new Error(insertRes.error.message || insertRes.error.details || 'Failed to create pickup request.');
  }

  // Best-effort admin metadata update.
  // If order_id/source columns exist, admin panel will show generated ID + app source.
  // If columns are missing in some environments, this does not block booking flow.
  try {
    await supabase
      .from('pickup_requests')
      .update({ order_id: generatedOrderId, source: 'app', source_channel: 'app' } as any)
      .eq('id', insertRes.data.id);
  } catch {
    // no-op
  }

  if (payload.leadId) {
    await updateLeadFieldsSafe(payload.leadId, {
      converted_to_pickup: true,
      pickup_request_id: insertRes.data.id,
      lead_status: 'Scheduled',
      final_price: payload.priceFinal,
      source_channel: 'app',
      updated_at: new Date().toISOString(),
    });
  }

  await logActivitySafe(payload.customerId, 'completed_order', {
    pickup_request_id: insertRes.data.id,
  });

  return {
    id: insertRes.data.id,
    customer_id: payload.customerId,
    device_name: payload.deviceName,
    device_variant: payload.deviceVariant ?? null,
    condition_answers: payload.conditionAnswers ?? {},
    price_final: Number(insertRes.data.price_final ?? payload.priceFinal),
    pickup_address: insertRes.data.pickup_address ?? insertRes.data.address ?? payload.pickupAddress,
    city: payload.city,
    status: (insertRes.data.status ?? payload.status ?? 'scheduled') as PickupRequest['status'],
    created_at: insertRes.data.created_at ?? new Date().toISOString(),
  } as PickupRequest;
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

// ── Leads Management ───────────────────────────────────────────────────────
export const getLeadsByPhone = async (phoneNumber: string) => {
  const normalizedPhone = normalizePhone(phoneNumber);
  const e164Phone = `+91${normalizedPhone}`;
  
  // Search for leads with both phone formats (with and without +91 prefix)
  // Some leads in DB have +91 prefix, others don't
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .or(`phone_number.eq.${normalizedPhone},phone_number.eq.${e164Phone},verified_phone.eq.${normalizedPhone},verified_phone.eq.${e164Phone}`)
    .eq('converted_to_pickup', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const getLeadById = async (leadId: string) => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (error) throw error;
  return data;
};

export const updateLeadStatus = async (leadId: string, status: string) => {
  const { error } = await supabase
    .from('leads')
    .update({
      lead_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId);

  if (error) throw error;
};

// ── Pickup Requests Management ───────────────────────────────────────────────
export const getPickupRequestsByPhone = async (phoneNumber: string) => {
  const normalizedPhone = normalizePhone(phoneNumber);
  const e164Phone = `+91${normalizedPhone}`;

  const { data, error } = await supabase
    .from('pickup_requests')
    .select(`
      *,
      device:device_id(*),
      variant:variant_id(*),
      city:city_id(*)
    `)
    .or(`user_phone.eq.${e164Phone},verified_phone.eq.${e164Phone}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const getPickupRequestById = async (pickupId: string) => {
  const { data, error } = await supabase
    .from('pickup_requests')
    .select(`
      *,
      device:device_id(*),
      variant:variant_id(*),
      city:city_id(*)
    `)
    .eq('id', pickupId)
    .single();

  if (error) throw error;
  return data;
};

export const updatePickupRequestStatus = async (pickupId: string, status: string) => {
  const { error } = await supabase
    .from('pickup_requests')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', pickupId);

  if (error) throw error;
};

// ── React Query Hooks ───────────────────────────────────────────────────────
export const useLeadsQuery = (phoneNumber?: string) =>
  useQuery({
    queryKey: ['leads', phoneNumber],
    enabled: !!phoneNumber,
    queryFn: async () => getLeadsByPhone(phoneNumber as string),
  });

export const usePickupRequestsQuery = (phoneNumber?: string) =>
  useQuery({
    queryKey: ['pickup-requests', phoneNumber],
    enabled: !!phoneNumber,
    queryFn: async () => getPickupRequestsByPhone(phoneNumber as string),
  });

export const useSyncLeadQuoteMutation = () =>
  useMutation({
    mutationFn: postLeadQuoteSync,
  });

// Kept for backward compatibility in places still importing useAuthApi.
export const useAuthApi = () => ({
  requestOtpMutation: useRequestOtpMutation(),
  verifyOtpMutation: useVerifyOtpMutation(),
});
