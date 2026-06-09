# SellkarIndia - Frontend Documentation

## Overview

Complete frontend UI/UX and logic documentation for the SellkarIndia React Native e-commerce application. This document covers all screens, components, navigation flows, state management, styling, and user interactions.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Navigation Flow](#navigation-flow)
3. [Screens & Components](#screens--components)
4. [State Management](#state-management)
5. [UI Patterns & Styling](#ui-patterns--styling)
6. [Form Handling & Validation](#form-handling--validation)
7. [Data Flow & API Integration](#data-flow--api-integration)
8. [Hooks & Custom Logic](#hooks--custom-logic)

---

## Project Structure

```
src/
├── screens/              # Screen components (12 total)
│   ├── SplashScreen.tsx          # Loading/intro screen
│   ├── OnboardingScreen.tsx       # Onboarding flow
│   ├── AuthScreen.tsx            # Login/Register form
│   ├── HomeScreen.tsx            # Main dashboard
│   ├── BrandScreen.tsx           # Brand selection
│   ├── ModelVariantScreen.tsx    # Model & variant picker
│   ├── BasePriceScreen.tsx       # Price display
│   ├── ConditionScreen.tsx       # Device condition form
│   ├── AccessoriesScreen.tsx     # Accessories selection
│   ├── PriceUnlockScreen.tsx     # Auth pricing
│   ├── AddressPickupScreen.tsx   # Address form
│   └── TrackOrderScreen.tsx      # Order tracking
|
├── navigation/           # Navigation setup
│   ├── RootNavigator.tsx         # Main stack navigator
│   └── types.ts                  # Navigation type definitions
│
├── store/               # Zustand state management
│   ├── authStore.ts              # User auth state
│   └── appStore.ts               # Global app state
│
├── hooks/               # Custom React hooks
│   ├── useAuth.ts                # Authentication logic
│   └── index.ts                  # Hook exports
│
├── api/                 # React Query API hooks
│   ├── authApi.ts                # Auth endpoints
│   ├── productsApi.ts            # Product/device endpoints
│   └── index.ts                  # API exports
│
├── constants/           # App configuration
│   └── index.ts                  # Colors, spacing, routes
│
└── utils/               # Helpers & services
    ├── supabaseClient.ts         # Database client
    ├── firebaseConfig.ts         # Messaging setup
    ├── asyncStorageHelper.ts     # Local storage
    └── keychainHelper.ts         # Secure storage
```

---

## Navigation Flow

### App Navigation Structure

```
Splash Screen (2s auto-transition)
    ↓
Onboarding Screen (user can skip)
    ↓
Home Screen (main dashboard)
    ├→ Brand Screen
    │    └→ Model/Variant Screen (3-column grid)
    │         └→ Base Price Screen
    │              └→ Condition Screen
    │                   └→ Accessories Screen
    │                        └→ Auth Screen
    │                             └→ Price Unlock Screen
    │                                  └→ Address Pickup Screen
    │                                       └→ Track Order Screen
    │
    └→ Orders, Profile, etc (bottom tabs)
```

### Navigation Routes

All routes defined in `NAVIGATION_ROUTES` constant:

```typescript
SPLASH: 'Splash'
ONBOARDING: 'Onboarding'
HOME: 'Home'
BRAND: 'Brand'
MODEL_VARIANT: 'ModelVariant'
BASE_PRICE: 'BasePrice'
CONDITION: 'Condition'
ACCESSORIES: 'Accessories'
AUTH: 'Auth'
PRICE_UNLOCK: 'PriceUnlock'
ADDRESS_PICKUP: 'AddressPickup'
TRACK_ORDER: 'TrackOrder'
```

**Navigation Type:**
- Stack Navigator: Full-screen navigation with header control
- Header: Hidden by default (custom headers built in screens)

---

## Screens & Components

### 1. SplashScreen

**Location:** `src/screens/SplashScreen.tsx`

**Purpose:** Initial app loading screen

**UI Elements:**
- Logo (centered)
- App title: "SellkarIndia"
- Subtitle: "Premium Device Buyback"
- Progress bar at bottom
- Decorative blobs (animated background elements)

**Logic:**
- Auto-navigates to Onboarding after **1.6 seconds**
- Uses `useEffect` with `setTimeout` hook
- No user interaction required

**Styling:**
- Background color: `#F8FAFC` (COLORS.BACKGROUND)
- Logo wrap background: White with 36px border radius
- Blobs: Semi-transparent primary/secondary colors

**Code Pattern:**
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    navigation.navigate('Onboarding');
  }, 1600);
  return () => clearTimeout(timer);
}, [navigation]);
```

---

### 2. OnboardingScreen

**Location:** `src/screens/OnboardingScreen.tsx`

**Purpose:** App introduction and feature highlights

**UI Elements:**
- Header with logo and "Skip" button
- Large hero image with glow effect
- Two decorative tags: "Verified" and "₹"
- Title: "Sell your device in 3 easy steps"
- Description text
- Progress indicators (3 dots, first active)
- "Next" button

**Logic:**
- Skip button → navigates to Home
- Next button → navigates to Home
- Static progress (part 1 of 3, non-interactive)

**Styling:**
- Hero image container: Centered with glow background
- Tags: Positioned top-left and top-right
- Progress: Horizontal dot indicators
- Button: Full-width blue with white text

---

### 3. HomeScreen

**Location:** `src/screens/HomeScreen.tsx`

**Purpose:** Main dashboard and action hub

**UI Elements:**

**Header Area:**
- Welcome label: "Welcome back,"
- User name: "Sahil"
- Avatar: 44x44 circular user image

**Hero Section:**
- Title: "Get the best value for your old devices"
- Subtitle: "Instant cash. Doorstep pickup."
- "Sell Now" button (primary blue)
- Decorative icon

**Category Cards:**
1. Sell Phone (Popular tag)
   - Icon background: Light blue
   - Description: "Get instant quote for 1000+ models"

2. Sell Laptop
   - Icon background: Light orange
   - Description: "Laptops, MacBooks & Workstations"

3. Sell iPad
   - Icon background: Light purple
   - Description: "Tablets and graphic pads"

**Why SellkarIndia Section:**
- 2-card grid
- Card 1: "Quick Evaluation" - Light green bg
- Card 2: "Instant Payment" - Light yellow bg

**Bottom Navigation:**
- 5 labels: Home, Orders, Sell, Support, Profile
- Home active (highlighted)
- Custom nav icons/dots

**Logic:**
- "Sell Now" and "Sell Phone" → navigate to Brand screen
- Avatar: Displays user profile image from URL
- Bottom nav: Displays labels only (structure for future tab implementation)

**Styling:**
- Hero section: Primary blue background, white text
- Cards: White background with light gray borders
- Category icons: Color-coded backgrounds
- Spacing: 24px padding, 12px gap between elements

---

### 4. BrandScreen

**Location:** `src/screens/BrandScreen.tsx`

**Purpose:** Brand selection from database

**UI Elements:**
- Header: "Select Brand" title
- Subtitle: "Choose your device brand"
- Scrollable list of brand cards
- Each card contains:
  - Brand logo image (40x40)
  - Brand name text
- "Next" button (disabled until brand selected)

**Logic:**

State:
```typescript
const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
```

Data Fetching:
- Uses `useBrandsQuery()` hook (React Query)
- Fetches brands from Supabase `brands` table
- Category filter: 'phone' (default)

Selection Flow:
1. User presses brand card
2. Card style changes to highlight (blue border, light blue bg)
3. Selected brand stored in state
4. Next button enabled (opacity changes from 0.6 to 1)
5. On next press → navigate to ModelVariant with `brandId`

**Styling:**
- Cards: Row layout with logo + text
- Active card: Blue border (`COLORS.PRIMARY`) + light blue background (#E7F0FF)
- Gap: 12px between cards
- Button: 20px padding, full width

---

### 5. ModelVariantScreen

**Location:** `src/screens/ModelVariantScreen.tsx`

**Purpose:** Select device model and variant (RAM/Storage)

**UI Elements:**

**Header:**
- Title: "Select Model & Variant"
- Subtitle: "Pick your exact device configuration"

**Models Section:**
- **3-Column Grid Layout**
- Each model card contains:
  - Model image (60x60 circular, light blue background)
  - Fallback emoji: 📱 if no image
  - Model name (2 lines max)
- Cards: 31% width (3 per row)
- Active card: Blue border + light blue background

**Variants Section (appears after model selected):**
- Title: "Variants"
- **2-Column Grid Layout**
- Each variant card contains:
  - Storage + RAM display (e.g., "128 GB / 6 GB RAM")
  - Storage only fallback (e.g., "128 GB")
  - Fallback: "Base Variant"
- Cards: 48.5% width (2 per row)
- Active card: Blue border + light blue background

**Next Button:**
- Disabled until variant selected
- Opacity: 0.6 when disabled

**Logic:**

State:
```typescript
const [selectedModel, setSelectedModel] = useState<Device | null>(null);
const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
```

Data Fetching:
- `useModelsQuery(brandId)`: Fetches models from Supabase `devices` table
- `useVariantsQuery(deviceId)`: Fetches variants from `variants` table with RAM join
- Queries conditionally enabled (only run when IDs provided)

Selection Flow:
1. User taps model card
2. Model selected, variant cleared (reset)
3. Variants query triggered with model ID
4. Variant cards render
5. User taps variant card
6. Both states filled → Next button enabled
7. On next → navigate to BasePrice with variant data

**Performance Optimizations:**
- FlatList with memoized renders (not ScrollView for large lists)
- `removeClippedSubviews`: Unmounts off-screen items
- `initialNumToRender`: 9 models, 6 variants
- `windowSize`: Renders 5 cells above/below viewport
- Memoized callbacks: `handleSelectModel`, `renderModelItem`, `renderVariantItem`

**Styling:**
- Main content wrapped in ScrollView for vertical scrolling
- Model cards: `width: '31.5%'`, `minHeight: 120px`
- Variant cards: `width: '48.5%'`
- Gaps: 12px between grid items
- Image container: 60x60 circular with 30px radius

---

### 6. BasePriceScreen

**Location:** `src/screens/BasePriceScreen.tsx`

**Purpose:** Display estimated price based on variant

**UI Elements:**

**Price Card:**
- Background: Primary blue
- Label text: "Estimated Price" (light white text)
- Price value: Large bold number (₹ + formatted amount)
- Note: "Diagnostics will adjust the final offer."

**Quick Diagnostics List:**
- Title: "Quick Diagnostics"
- Items (5 total):
  - Screen condition
  - Touch response
  - Camera & speakers
  - Battery health
  - Network & sensors
- Each item: Green check circle + text

**Logic:**

Route Params:
```typescript
const { variant } = route.params;
```

Price Display:
- Pulls `variant.base_price` from navigation params
- Formats with `toLocaleString('en-IN')` for Indian numbering
- Fallback: '0' if no price

Navigation:
- Next button → navigate to Condition with variant data

**Styling:**
- Price card: Blue background, white text
- Price value: 32px font size, white color
- Diagnostic items: White background with slight padding
- Check circle: Green background (COLORS.SUCCESS)

---

### 7. ConditionScreen

**Location:** `src/screens/ConditionScreen.tsx`

**Purpose:** Assess device physical condition

**UI Elements:**

**Condition Options (3 cards):**
1. Like New - "No scratches or dents"
2. Good - "Minor scratches"
3. Fair - "Visible wear and tear"

Each card contains:
- Condition label (bold)
- Description text
- Active state: Blue border + light blue background

**Logic:**

State:
```typescript
const [selected, setSelected] = useState('good');
```

Conditions Array:
```typescript
const conditions = [
  { id: 'like-new', label: 'Like New', desc: 'No scratches or dents' },
  { id: 'good', label: 'Good', desc: 'Minor scratches' },
  { id: 'fair', label: 'Fair', desc: 'Visible wear and tear' },
];
```

Selection Flow:
1. Default: "Good" selected
2. User taps condition card
3. State updates
4. Card highlight changes
5. On Next → navigate to Accessories

**Styling:**
- Cards: Vertical flex layout
- Active state: Blue border + light blue background
- Title: 16px bold
- Subtitle: 12px gray text

---

### 8. AccessoriesScreen

**Location:** `src/screens/AccessoriesScreen.tsx`

**Purpose:** Select included accessories (charger, box, etc.)

**UI Elements:**
- Similar checkbox list pattern to ConditionScreen
- Multiple selection allowed (multi-select)

**Logic:**
- Tracks selected accessories in state
- On Next → navigate to Auth screen

---

### 9. AuthScreen

**Location:** `src/screens/AuthScreen.tsx`

**Purpose:** User authentication (phone + name)

**UI Elements:**

**Form Fields:**
1. Phone Number
   - Placeholder: "Enter phone number"
   - Keyboard type: phone-pad
   - TextInput with border

2. Full Name
   - Placeholder: "Enter your name"
   - TextInput with border

Both inputs:
- Background: White
- Border: Light gray
- Border radius: 16px
- Padding: 14px horizontal, 12px vertical

**Button:**
- Label: "Verify & Continue"
- Blue background
- Full width

**Logic:**
- TextInput state (not yet implemented)
- On button press → navigate to PriceUnlock

**Styling:**
- Form container: 24px vertical gap
- Labels: 12px bold gray text
- Inputs: White background with light gray borders

---

### 10. PriceUnlockScreen

**Location:** `src/screens/PriceUnlockScreen.tsx`

**Purpose:** Display unlocked price after auth

**UI Elements:**
- Similar structure to BasePriceScreen
- Shows updated price based on condition assessment

---

### 11. AddressPickupScreen

**Location:** `src/screens/AddressPickupScreen.tsx`

**Purpose:** Enter/select pickup address

**UI Elements:**
- Address input fields
- Pin code input
- Address list with selection

---

### 12. TrackOrderScreen

**Location:** `src/screens/TrackOrderScreen.tsx`

**Purpose:** Order status tracking

**UI Elements:**
- Order ID display
- Status timeline (pending → verified → shipped → delivered)
- Pickup details
- Tracking map (optional)

---

## State Management

### Zustand Stores

**Location:** `src/store/`

#### authStore.ts

```typescript
interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  isLoading: boolean;
  setUser: (user: AuthState['user']) => void;
  logout: () => void;
}
```

**Usage:**
```typescript
import { useAuthStore } from '../store';
const { user, setUser, logout } = useAuthStore();
```

**Key Functions:**
- `setUser()`: Update logged-in user data
- `logout()`: Clear user session

#### appStore.ts

```typescript
interface AppState {
  onboardingComplete: boolean;
  isDarkMode: boolean;
  appLoading: boolean;
  setOnboardingComplete: (value: boolean) => void;
  toggleDarkMode: () => void;
  setAppLoading: (value: boolean) => void;
}
```

**Usage:**
```typescript
import { useAppStore } from '../store';
const { onboardingComplete, isDarkMode } = useAppStore();
```

**Persistence:**
- onboardingComplete: Persisted in AsyncStorage
- isDarkMode: Device preference

---

## UI Patterns & Styling

### Color System

```typescript
COLORS = {
  PRIMARY: '#004AAD',           // Main blue
  SECONDARY: '#F97316',         // Orange accent
  BACKGROUND: '#F8FAFC',        // Light background
  WHITE: '#FFFFFF',             // Pure white
  BLACK: '#0F172A',             // True black
  GRAY_LIGHT: '#E2E8F0',        // Light gray borders
  GRAY_DARK: '#475569',         // Dark gray text
  SUCCESS: '#22C55E',           // Green
  ERROR: '#EF4444',             // Red
  WARNING: '#F59E0B',           // Amber
}
```

### Spacing System

```typescript
SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
}
```

### Typography

```typescript
TYPOGRAPHY = {
  H1: { FONT_SIZE: 32, FONT_WEIGHT: '700' },
  H2: { FONT_SIZE: 24, FONT_WEIGHT: '700' },
  BODY: { FONT_SIZE: 14, FONT_WEIGHT: '400' },
}
```

### Card Pattern

Reusable card component styling:

```typescript
card: {
  padding: 16,
  borderRadius: 18,
  backgroundColor: COLORS.WHITE,
  borderWidth: 1,
  borderColor: COLORS.GRAY_LIGHT,
}

cardActive: {
  borderColor: COLORS.PRIMARY,
  backgroundColor: '#E7F0FF',  // Light blue
}
```

### Button Pattern

Primary button styling:

```typescript
button: {
  backgroundColor: COLORS.PRIMARY,
  paddingVertical: 16,
  borderRadius: 18,
  alignItems: 'center',
}

buttonText: {
  color: COLORS.WHITE,
  fontWeight: '700',
  fontSize: 16,
}

buttonDisabled: {
  opacity: 0.6,
}
```

### Grid Layouts

**3-Column Grid (Models):**
- Each item: `width: '31.5%'`
- Gap: 12px
- Flex wrap: Wrapping enabled

**2-Column Grid (Variants/Condition):**
- Each item: `width: '48.5%'` or `flexBasis: '48%'`
- Gap: 12px
- Flex wrap: Wrapping enabled

---

## Form Handling & Validation

### Text Input Pattern

```typescript
<TextInput
  placeholder="Placeholder text"
  placeholderTextColor={COLORS.GRAY_DARK}
  keyboardType="default"  // or: "phone-pad", "email-address"
  style={styles.input}
  value={value}
  onChangeText={setValue}
/>
```

### Input Styling

```typescript
input: {
  backgroundColor: COLORS.WHITE,
  borderRadius: 16,
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderWidth: 1,
  borderColor: COLORS.GRAY_LIGHT,
  color: COLORS.BLACK,
}
```

### Form State Pattern

Currently using React `useState` for form fields. Example:

```typescript
const [phone, setPhone] = useState('');
const [name, setName] = useState('');

const handleSubmit = () => {
  if (!phone || !name) {
    // Show error
    return;
  }
  // Submit form
};
```

### Validation (Not Yet Implemented)

Recommended approach:
- Phone: Regex for 10-digit format
- Name: Min 2 characters, max 50
- Email: Standard email regex
- Display errors below fields or in toast

---

## Data Flow & API Integration

### React Query Setup

**Location:** `src/api/`

#### productsApi.ts - Queries

```typescript
// Fetch brands
export const useBrandsQuery = (category: string = 'phone') => 
  useQuery({
    queryKey: ['brands', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('category', category)
        .order('name');
      if (error) throw error;
      return data as Brand[];
    },
  });

// Fetch models for a brand
export const useModelsQuery = (brandId: string | null) => 
  useQuery({
    queryKey: ['models', brandId],
    queryFn: async () => {
      if (!brandId) return [];
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('brand_id', brandId)
        .order('model_name');
      if (error) throw error;
      return data as Device[];
    },
    enabled: !!brandId,  // Only runs if brandId provided
  });

// Fetch variants for a model
export const useVariantsQuery = (deviceId: string | null) => 
  useQuery({
    queryKey: ['variants', deviceId],
    queryFn: async () => {
      if (!deviceId) return [];
      const { data, error } = await supabase
        .from('variants')
        .select(`
          id, 
          device_id, 
          base_price, 
          storage_gb,
          ram_id,
          ram_options ( size_gb )
        `)
        .eq('device_id', deviceId)
        .order('base_price');
      if (error) throw error;
      return data.map((v: any) => ({
        ...v,
        ram_gb: v.ram_options ? v.ram_options.size_gb : null
      }));
    },
    enabled: !!deviceId,
  });
```

### Data Types

```typescript
interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  category: string;
}

interface Device {
  id: string;
  brand_id: string;
  model_name: string;
  series: string | null;
  image_url: string | null;
}

interface Variant {
  id: string;
  device_id: string;
  base_price: number;
  storage_gb: string | null;
  ram_id: string | null;
  ram_gb?: number | null;
}
```

### Supabase Client

**Location:** `src/utils/supabaseClient.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';

const SUPABASE_URL = Config.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### API Flow Example

```
BrandScreen Component
  ↓
useBrandsQuery() → React Query
  ↓
supabase.from('brands').select() → Supabase
  ↓
Database returns brand list
  ↓
Query state updates with data
  ↓
Component re-renders with brand options
  ↓
User selects brand
  ↓
Navigate to ModelVariant with brandId
```

---

## Hooks & Custom Logic

### useAuthHook

**Location:** `src/hooks/useAuth.ts`

```typescript
export const useAuthHook = () => {
  const { loginMutation, signupMutation, logoutMutation } = useAuthApi();
  const { setUser } = useAuthStore();

  const login = async (email: string, password: string) => {
    const result = await loginMutation.mutateAsync({ email, password });
    if (result.user) {
      setUser({
        id: result.user.id,
        email: result.user.email || '',
        name: result.user.user_metadata?.name || '',
      });
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    const result = await signupMutation.mutateAsync({ email, password, name });
    if (result.user) {
      setUser({
        id: result.user.id,
        email: result.user.email || '',
        name: name,
      });
    }
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    setUser(null);
  };

  return { login, signup, logout };
};
```

**Usage:**
```typescript
const { login, signup, logout } = useAuthHook();
await login('user@example.com', 'password123');
```

### Navigation Hook

```typescript
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '../navigation/types';

const navigation = useNavigation<RootStackNavigationProp>();
navigation.navigate('Brand');
```

### Route Params Hook

```typescript
import { useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';

type ScreenRouteProp = RouteProp<RootStackParamList, 'ScreenName'>;
const route = useRoute<ScreenRouteProp>();
const { paramName } = route.params;
```

---

## Performance Optimizations

### Current Implementations

1. **FlatList Usage:**
   - ModelVariantScreen uses FlatList instead of ScrollView.map()
   - Settings: `removeClippedSubviews`, `initialNumToRender`, `windowSize`

2. **Memoized Callbacks:**
   - `useCallback` wraps event handlers
   - Prevents unnecessary re-renders of child components

3. **Conditional Query Enabling:**
   - React Query: `enabled` parameter prevents queries until data ready
   - Example: Models query only runs if `brandId` provided

4. **Image Optimization:**
   - `resizeMode="contain"` for proper aspect ratios
   - Fixed image sizes (60x60, 40x40)
   - Circular images with borderRadius

### Recommended Future Improvements

1. **React.memo for Cards:**
   ```typescript
   const ModelCard = React.memo(({ model, isActive, onPress }) => {
     // Component code
   });
   ```

2. **Image Caching:**
   - Use `react-native-fast-image` instead of Image
   - Already in dependencies

3. **Virtualization for Long Lists:**
   - Already implemented for Models/Variants
   - Can extend to other list screens

4. **Code Splitting:**
   - Lazy load screens if bundle size grows

---

## Common UI Patterns Reference

### Selection Card Pattern

```typescript
// Array of options
const options = [
  { id: 'option1', label: 'Option 1', desc: 'Description' },
  { id: 'option2', label: 'Option 2', desc: 'Description' },
];

// State
const [selected, setSelected] = useState(options[0].id);

// Render
{options.map((item) => (
  <Pressable
    key={item.id}
    style={[
      styles.card,
      selected === item.id && styles.cardActive
    ]}
    onPress={() => setSelected(item.id)}
  >
    <Text style={styles.title}>{item.label}</Text>
    <Text style={styles.subtitle}>{item.desc}</Text>
  </Pressable>
))}
```

### List with Next Button Pattern

```typescript
<SafeAreaView style={styles.container}>
  <ScrollView contentContainerStyle={styles.scrollContent}>
    {/* Content */}
  </ScrollView>
  
  <Pressable
    style={[styles.button, !isValid && { opacity: 0.6 }]}
    disabled={!isValid}
    onPress={handleNext}
  >
    <Text style={styles.buttonText}>Next</Text>
  </Pressable>
</SafeAreaView>
```

### Loading State Pattern

```typescript
if (query.isLoading) {
  return (
    <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color={COLORS.PRIMARY} />
    </SafeAreaView>
  );
}
```

### Error Handling (Not Yet Implemented)

```typescript
if (query.isError) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.errorText}>Failed to load data</Text>
      <Pressable onPress={() => query.refetch()}>
        <Text>Retry</Text>
      </Pressable>
    </SafeAreaView>
  );
}
```

---

## Environment & Configuration

### Environment Variables

**File:** `.env`

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
FIREBASE_CONFIG={"apiKey":"...","projectId":"..."}
```

### Safe Area Context

All screens wrapped in:
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';
<SafeAreaView style={styles.container}>
  {/* Content */}
</SafeAreaView>
```

---

## Testing & Debugging

### React Navigation DevTools

Enable during development:
```typescript
// In App.tsx or index.js
import { enableScreens } from 'react-native-screens';
enableScreens();
```

### React Query DevTools

Add to dependencies for debugging:
```bash
npm install @tanstack/react-query-devtools
```

### Console Logging

Examples in codebase:
```typescript
console.log('Brands Query Data:', brandsQuery.data);
console.log('Brands Query Error:', brandsQuery.error);
```

### TypeScript Type Safety

All navigation typed:
```typescript
type RootStackNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  keyof RootStackParamList
>;

type ScreenRouteProp = RouteProp<RootStackParamList, 'ScreenName'>;
```

---

## Future Enhancements

### 1. Form Validation Library
- Add `react-hook-form` or similar
- Validate phone, email, passwords
- Display inline errors

### 2. Bottom Tab Navigation
- Convert nav labels to actual tabs
- Add screen icons
- Link to actual screens

### 3. Search & Filter
- Add search in brand list
- Filter models by series
- Price range slider

### 4. Image Handling
- Optimize with react-native-fast-image
- Add image compression
- Cache management

### 5. Error Boundaries
- Catch component errors
- Show fallback UI
- Log errors

### 6. Animations
- Entrance animations for screens
- Card flip for selection
- Progress bar animations

### 7. Accessibility
- Add `testID` props
- Screen reader labels
- Touch target sizes (min 44x44)

---

## File Size Reference

- Each screen: 200-400 lines
- Constants: 50 lines
- Store files: 30-50 lines each
- API hooks: 80-120 lines
- Navigation: 100 lines
- Utils: 20-60 lines each

---

## Quick Start for Frontend Development

1. **Add New Screen:**
   - Create in `src/screens/NewScreen.tsx`
   - Add to `RootNavigator.tsx`
   - Add route to `NAVIGATION_ROUTES`
   - Add to type `RootStackParamList`

2. **Add New API Query:**
   - Create in `src/api/productsApi.ts`
   - Use `useQuery` from React Query
   - Export from `src/api/index.ts`
   - Use with `useQuery()` hook

3. **Add Global State:**
   - Create store in `src/store/newStore.ts`
   - Export from `src/store/index.ts`
   - Use with `useNewStore()` hook
   - Optionally persist to storage

4. **Update Styling:**
   - Modify `src/constants/index.ts`
   - Use `COLORS`, `SPACING`, `TYPOGRAPHY`
   - Apply across screens for consistency

---

## Database Schema (Supabase/PostgreSQL)

### Overview

Leads are stored in Supabase (PostgreSQL) across two main tables. There is **no automatic linking** between tables — both exist independently and are connected only via the `converted_to_pickup` boolean flag on the leads table.

### 1. public.leads — Primary Lead Storage

Created when user completes OTP verification. Enriched during sell flow (brand/model/condition).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| customer_name | TEXT | Customer's full name |
| phone_number | TEXT | Phone number |
| verified_phone | TEXT | Verified phone number |
| is_phone_verified | BOOLEAN | Whether phone is verified |
| brand_name | TEXT | For quick leads without full device selection |
| device_id | UUID | FK to devices table |
| variant_id | UUID | FK to variants table |
| city_id | UUID | FK to cities table |
| lead_status | TEXT | Status: 'rnr' (default), 'not-interested', 'scheduled', 'reschedule' |
| lead_notes | TEXT | Plain text notes (NOT JSON) |
| final_price | NUMERIC | Final price after condition assessment |
| converted_to_pickup | BOOLEAN | Flag indicating pickup request created |
| has_bill | BOOLEAN | Has original bill |
| has_box | BOOLEAN | Has original box |
| has_charger | BOOLEAN | Has charger |
| device_powers_on | BOOLEAN | Device powers on |
| display_condition | TEXT | Display condition |
| body_condition | TEXT | Body condition |
| can_make_calls | BOOLEAN | Can make/receive calls |
| is_touch_working | BOOLEAN | Touch screen working |
| is_screen_original | BOOLEAN | Original screen |
| is_battery_healthy | BOOLEAN | Battery healthy |
| overall_condition | TEXT | Overall condition assessment |
| age_group | TEXT | Device age group |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Important Notes:**
- `lead_notes` is TEXT (plain text), NOT JSONB
- No `customer_id` field (no customer_profiles table linkage)
- No `source_channel` field
- No `pickup_request_id` field

### 2. public.pickup_requests — Created When Pickup is Scheduled

Created separately when customer schedules a pickup. Not linked to leads table via foreign key.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_phone | TEXT | Phone number |
| customer_name | TEXT | Customer's full name |
| device_id | UUID | FK to devices table |
| variant_id | UUID | FK to variants table |
| city_id | UUID | FK to cities table |
| address | TEXT | Pickup address |
| pincode | TEXT | Pin code |
| pickup_date | DATE | Scheduled pickup date |
| pickup_time | TEXT | Scheduled pickup time slot |
| status | TEXT | Pickup status |
| final_price | NUMERIC | Final price |
| All condition fields | BOOLEAN/TEXT | Same condition fields as leads |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Important Notes:**
- No `order_id` field
- No `lead_id` field
- No `customer_id` field
- No `lead_status` field (pickup_requests use `status`, not `lead_status`)
- No `source_channel` field

### 3. Data Flow

```
OTP Verification → Lead Created in public.leads
       ↓
Sell Flow → Brand/Model/Condition Selected → Lead Enriched
       ↓
Manual Action → converted_to_pickup = true
       ↓
Separate Pickup Request Created in public.pickup_requests
       ↓
Both tables exist independently (no FK linkage)
```

### 4. Related Tables (Lookup/Reference)

| Table | Purpose |
|-------|---------|
| brands | Device brand information |
| devices | Device models |
| variants | Device variants (RAM/Storage) |
| cities | City information for pickup |

### 5. Index Recommendations

For `public.leads`:
```sql
-- Phone number lookups
CREATE INDEX idx_leads_phone ON public.leads (phone_number);

-- Status filtering
CREATE INDEX idx_leads_status ON public.leads (lead_status);

-- Converted leads
CREATE INDEX idx_leads_converted ON public.leads (converted_to_pickup);

-- Time-based queries
CREATE INDEX idx_leads_created ON public.leads (created_at DESC);
```

For `public.pickup_requests`:
```sql
-- Status filtering
CREATE INDEX idx_pickup_status ON public.pickup_requests (status);

-- Time-based queries
CREATE INDEX idx_pickup_created ON public.pickup_requests (created_at DESC);

-- Phone lookups
CREATE INDEX idx_pickup_phone ON public.pickup_requests (user_phone);
```

---

**Last Updated:** May 15, 2026  
**Version:** 1.1.0  
**React Native:** 0.84.0  
**TypeScript:** Latest  
