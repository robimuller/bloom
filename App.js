// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';

import AppProvider from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { DefaultTheme } from 'react-native-paper';

// You can customize the Paper theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6c63ff',  // Bloom’s style?
    accent: '#FF4081',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AppProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AppProvider>
    </PaperProvider>
  );
}
