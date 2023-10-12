/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import './src/config/TextConfig'

LogBox.ignoreLogs(['Require cycle:', 'Warning: componentWillReceiveProps is deprecated', 'Warning: componentWillReceiveProps is deprecated','Warning: componentWillReceiveProps has been renamed'])


AppRegistry.registerComponent(appName, () => App);
