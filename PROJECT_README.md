# SellkarIndia

A React Native CLI TypeScript application for Android, featuring a complete e-commerce platform with product listing, selling, order management, and user profiles.

## Features

- **Navigation**: React Navigation v6 with stack navigation and bottom tab navigation
- **State Management**: Zustand for global state management
- **Data Fetching**: React Query (TanStack Query) for API calls
- **Backend**: Supabase integration for authentication and database
- **Real-time Messaging**: Firebase Cloud Messaging setup
- **Secure Storage**: AsyncStorage and Keychain for credential management
- **Animations**: React Native Reanimated and Gesture Handler
- **Images**: Fast Image for optimized image loading
- **Environment Variables**: dotenv and react-native-config

## Project Structure

```
src/
  api/              - API services (Auth, Products)
  components/       - Reusable components
  screens/          - Screen components
    auth/           - Login and Registration screens
    onboarding/     - Onboarding flow
    home/           - Home screen
    sell/           - Sell products screen
    orders/         - Orders list screen
    profile/        - User profile screen
  navigation/       - Navigation configuration
  store/            - Zustand stores (Auth, App)
  hooks/            - Custom React hooks
  utils/            - Helper functions and utilities
  constants/        - Constants and configurations
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd SellkarIndia
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase and Firebase credentials

3. **Android Setup**
   ```bash
   npm run android
   ```

4. **Start Development**
   ```bash
   npm start
   ```

## Configuration

### Android SDK Settings
- Minimum SDK: 23
- Target SDK: 34
- Build Tools: 34.0.0

### Permissions
- INTERNET
- CAMERA
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE

## Dependencies

### Core
- React Native
- React Navigation v6
- TypeScript

### State & Data
- Zustand
- React Query (TanStack Query)

### Backend & Authentication
- Supabase
- Firebase Messaging

### Storage
- AsyncStorage
- React Native Keychain

### UI & Animations
- React Native Reanimated
- React Native Gesture Handler
- React Native Fast Image

### Configuration
- dotenv
- react-native-config

## Scripts

- `npm start` - Start the development server
- `npm run android` - Build and run on Android
- `npm run ios` - Build and run on iOS
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Environment Variables

Create a `.env` file with the following variables:

```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
FIREBASE_CONFIG=your-firebase-config-json
```

## Development Notes

- The app features a splash screen that displays for 2 seconds during initialization
- Onboarding completion is tracked in AsyncStorage
- Navigation flow: Splash -> Onboarding -> Auth -> Main App
- Bottom tab navigation includes Home, Sell, Orders, and Profile tabs
- All screens are placeholder components ready for implementation

## License

MIT
