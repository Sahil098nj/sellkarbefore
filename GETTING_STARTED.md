## SellkarIndia - Getting Started Quick Reference

### Quick Start (5 minutes)

1. **Install Dependencies**
   ```bash
   cd SellkarIndia
   npm install
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase and Firebase credentials
   ```

3. **Run on Android**
   ```bash
   npm start
   # In another terminal:
   npm run android
   ```

### Project Features

**Authentication**
- Login/Register screens with form validation
- Supabase integration for backend auth
- Secure credential storage with Keychain
- Session management with Zustand

**Navigation**
- Splash screen with 2-second delay
- Onboarding flow (first-time users)
- Stack navigation for auth screens
- Bottom tab navigation for main app

**API Integration**
- React Query for data fetching and caching
- Supabase client pre-configured
- Product CRUD operations
- User authentication endpoints

**State Management**
- Global auth state with Zustand
- App initialization state
- Onboarding persistence

**Storage**
- AsyncStorage for app state
- Keychain for sensitive credentials
- Environment variables via react-native-config

### Android Configuration

**SDK Settings** (android/build.gradle)
```
minSdkVersion = 23
targetSdkVersion = 34
```

**Permissions** (AndroidManifest.xml)
- INTERNET (network communication)
- CAMERA (take photos)
- READ_EXTERNAL_STORAGE (select images)
- WRITE_EXTERNAL_STORAGE (save files)

**Splash Screen**
- White background (#FFFFFF)
- Primary accent color (#FF6B35)
- Android 12+ support with material theme

### File Organization

**Screens** - Each screen in its own directory:
- auth/LoginScreen.tsx
- auth/RegisterScreen.tsx
- onboarding/OnboardingScreen.tsx
- home/HomeScreen.tsx
- sell/SellScreen.tsx
- orders/OrdersScreen.tsx
- profile/ProfileScreen.tsx

**Navigation** - Modular navigation setup:
- RootNavigator: Main navigation flow
- BottomTabsNavigator: Tab-based navigation with stack nesting

**API** - React Query hooks:
- useAuthApi: Authentication endpoints
- useProductsApi: Product management endpoints

**Store** - Zustand stores:
- useAuthStore: Auth state and user data
- useAppStore: Global app state

**Utilities** - Helper functions:
- asyncStorageHelper: Persistent storage operations
- keychainHelper: Secure credential storage
- supabaseClient: Pre-configured Supabase client
- firebaseConfig: Firebase messaging setup

### Common Development Tasks

**Add a New Screen**
1. Create screen component in src/screens/
2. Add to appropriate navigation stack
3. Import and add route in navigator

**Add API Endpoint**
1. Create query/mutation in src/api/
2. Export from src/api/index.ts
3. Use in components with React Query hooks

**Add Global State**
1. Create new store in src/store/
2. Export from src/store/index.ts
3. Use useStore() hook in components

**Update Styling**
1. Modify constants in src/constants/index.ts
2. All colors and spacing centralized
3. Apply constants throughout app

### TypeScript Best Practices

```typescript
// Every component should have type definition
interface ScreenProps {
  navigation: any;
}

const MyScreen: React.FC<ScreenProps> = ({ navigation }) => {
  return <View />;
};
```

### Environment Variables

Required .env variables:
```
SUPABASE_URL        - Your Supabase project URL
SUPABASE_ANON_KEY   - Your Supabase anonymous key
FIREBASE_CONFIG     - Firebase configuration JSON
```

### Useful Commands

```bash
npm start                    # Start Metro bundler
npm run android             # Build and run on Android
npm run android -- --reset  # Clean build
npm run lint                # Check TypeScript and ESLint
npm test                    # Run Jest tests
```

### Module Imports

**Import from specific modules:**
```typescript
import { useAuthStore } from '../store';
import { COLORS } from '../constants';
import { supabase } from '../utils';
```

### Next Steps

1. Update .env with real credentials
2. Implement login/register logic
3. Create product listing screens
4. Add image upload functionality
5. Implement order management
6. Configure Firebase messaging

### Debugging

**Debug in React Native**
```bash
npm start
# Press 'd' in terminal to open debugger
```

**Check Network Requests**
```bash
# React Query DevTools available
# Add @tanstack/react-query-devtools for debugging
```

**View Stored Data**
```bash
adb shell
run-as com.sellkarindia
cat /data/data/com.sellkarindia/databases/...
```

### Performance Tips

- Use React.memo for components
- Implement FlatList pagination for lists
- Optimize images with react-native-fast-image
- Use React Query for smart caching
- Enable Hermes engine in production

### Resources

- Configuration: SETUP_GUIDE.md
- Main README: PROJECT_README.md
- React Navigation Docs: https://reactnavigation.org
- Supabase Docs: https://supabase.com/docs
- React Query Docs: https://tanstack.com/query

---

**Version**: 1.0.0
**React Native**: 0.84.0
**TypeScript**: Latest
**Created**: February 2026
