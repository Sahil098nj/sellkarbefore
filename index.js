import 'react-native-url-polyfill/auto';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { loadConfig } from './src/utils/dotenvLoader';

loadConfig();

const appName = 'SellkarIndia';
AppRegistry.registerComponent(appName, () => App);
