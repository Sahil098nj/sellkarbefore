## SellkarIndia - Complete Setup Guide

### Project Overview
SellkarIndia is a React Native CLI TypeScript application for Android that provides a complete e-commerce platform for product listing, selling, order management, and user profiles.

### Technology Stack
- **Framework**: React Native 0.84.0 with TypeScript
- **Navigation**: React Navigation v6 (Stack + Bottom Tabs)
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Backend**: Supabase
- **Real-time Messaging**: Firebase Cloud Messaging
- **Storage**: AsyncStorage + Keychain
- **Animations**: React Native Reanimated + Gesture Handler
- **Image Loading**: React Native Fast Image

### Folder Structure
```
src/
  api/                          # API integration
    authApi.ts                  # Authentication API
    productsApi.ts              # Products API
    index.ts                    # API exports
  components/                   # Reusable components
  screens/
    SplashScreen.tsx            # Loading screen
    onboarding/
      OnboardingScreen.tsx      # Onboarding flow
    auth/
      LoginScreen.tsx           # Login screen
      RegisterScreen.tsx        # Registration screen
    home/
      HomeScreen.tsx            # Home/Browse screen
    sell/
      SellScreen.tsx            # Sell products screen
    orders/
      OrdersScreen.tsx          # Orders management screen
    profile/
      ProfileScreen.tsx         # User profile screen
  navigation/
    RootNavigator.tsx           # Root stack navigation
    BottomTabsNavigator.tsx    # Bottom tab navigation
    index.ts                    # Navigation exports
  store/
    authStore.ts                # Auth state (Zustand)
    appStore.ts                 # App global state (Zustand)
    index.ts                    # Store exports
  hooks/
    useAuth.ts                  # Custom authentication hook
    index.ts                    # Hooks exports
  utils/
    asyncStorageHelper.ts       # AsyncStorage utilities
    keychainHelper.ts           # Keychain utilities
    supabaseClient.ts           # Supabase client setup
    firebaseConfig.ts           # Firebase configuration
    dotenvLoader.ts             # Environment variable loader
    index.ts                    # Utils exports
  constants/
    index.ts                    # App constants and theme
```

### Installation & Setup

#### 1. Environment Setup
```bash
cd SellkarIndia

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

#### 2. Configure Android
```
SDK Versions:
- minSdkVersion: 23
- targetSdkVersion: 34
- compileSdkVersion: 34

Configured in: android/build.gradle
```

#### 3. Build & Run
```bash
# Start Metro bundler
npm start

# Build and run on Android (in another terminal)
npm run android

# Or use USB debugging with connected device
adb devices
npm run android
```

### Configuration Files

#### .env.example
Template for environment variables:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
FIREBASE_CONFIG={"apiKey":"...","authDomain":"..."}
```

#### Android Manifest Permissions
- INTERNET
- CAMERA
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE

#### Android Styles & Colors
- Configured in: android/app/src/main/res/values/
- Splash screen support for Android 12+
- White background with primary color (#FF6B35)

### Navigation Flow

```
Splash (2 seconds)
    |
    v
Onboarding (if not completed)
    |
    v
Auth Stack (Login/Register)
    |
    v
[ Home | Sell | Orders | Profile ] (Bottom Tabs)
```

### State Management (Zustand)

#### authStore
- user: Current user data
- isLoading: Loading state
- setUser: Set user
- logout: Clear user session

#### appStore
- onboardingComplete: Onboarding flag (persistant)
- isDarkMode: Theme preference
- appLoading: Initial app loading state

### Available Hooks

#### useAuthHook
- login(email, password)
- signup(email, password, name)
- logout()

### API Integration (React Query)

#### useAuthApi
- loginMutation
- signupMutation
- logoutMutation

#### useProductsApi
- productsQuery
- createProductMutation
- updateProductMutation
- deleteProductMutation

### Storage Solutions

#### AsyncStorage (app-wide persistence)
- Onboarding completion flag
- User preferences
- Session data

#### Keychain (secure credentials)
- User credentials
- Auth tokens
- Sensitive data

### Styling & Theme

#### Color Palette
- PRIMARY: #FF6B35
- SECONDARY: #004E89
- BACKGROUND: #F5F5F5
- WHITE: #FFFFFF
- BLACK: #000000
- GRAY_LIGHT: #E0E0E0
- GRAY_DARK: #424242
- SUCCESS: #4CAF50
- ERROR: #F44336
- WARNING: #FFC107

#### Spacing Scale
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px

### Development Scripts

```bash
npm start           # Start Metro bundler
npm run android     # Run on Android emulator/device
npm run ios         # Run on iOS
npm run lint        # Run ESLint
npm test            # Run Jest tests
```

### Troubleshooting

#### Metro Bundler Issues
```bash
# Clear Metro cache
npm start -- --reset-cache

# Or kill and restart
lsof -ti:8081 | xargs kill -9
npm start
```

#### Android Build Issues
```bash
# Clean build
cd android
./gradlew clean
cd ..
npm run android
```

#### Dependency Conflicts
```bash
# Use legacy peer deps
npm install --legacy-peer-deps
```

### Important Notes

1. **Splash Screen**: Displays for 2 seconds during app initialization
2. **Onboarding**: Persisted in AsyncStorage with key 'onboarding_complete'
3. **Navigation Reset**: Auth stack replaces home tabs after login
4. **React Query**: Configured with 5-minute cache window
5. **All Screens**: Placeholder components ready for implementation

### TypeScript Configuration

- Strict mode enabled
- Path aliases support (@/src/*)
- Full type checking throughout
- Jest type definitions included

### Git Configuration

Environment files excluded from version control:
- .env
- .env.local
- .env.*.local

### Additional Resources

- React Native Docs: https://reactnative.dev
- React Navigation v6: https://reactnavigation.org
- Zustand: https://github.com/pmndrs/zustand
- React Query: https://tanstack.com/query
- Supabase Docs: https://supabase.com/docs

### Support

For issues or questions, refer to:
1. Official React Native documentation
2. Component-specific library documentation
3. Project README.md file
