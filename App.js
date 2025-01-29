import React, { useContext } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { DatesProvider } from './src/contexts/DatesContext';
import { RequestsProvider } from './src/contexts/RequestsContext';
import { ChatProvider } from './src/contexts/ChatContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { NotificationsProvider } from './src/contexts/NotificationsContext';
import { SignUpProvider } from './src/contexts/SignUpContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeContext, ThemeProvider } from './src/contexts/ThemeContext';
import { createPaperTheme } from './src/themes/paper';
import { Provider as PaperProvider } from 'react-native-paper';
import { ProfilesProvider } from './src/contexts/ProfilesContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated'; // Add this line

export default function App() {
  return (
    <ThemeProvider>
      <AppWithPaper />
    </ThemeProvider>
  );
}

function AppWithPaper() {
  const { theme, themeMode } = useContext(ThemeContext);
  const paperTheme = createPaperTheme(theme, themeMode);
  const barStyle = themeMode === 'light' ? 'dark-content' : 'light-content';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <StatusBar barStyle={barStyle} backgroundColor={theme.background} />
        <AuthProvider>
          <SignUpProvider>
            <SettingsProvider>
              <ProfilesProvider>
                <DatesProvider>
                  <RequestsProvider>
                    <ChatProvider>
                      <NotificationsProvider>
                        <NavigationContainer>
                          <AppNavigator />
                        </NavigationContainer>
                      </NotificationsProvider>
                    </ChatProvider>
                  </RequestsProvider>
                </DatesProvider>
              </ProfilesProvider>
            </SettingsProvider>
          </SignUpProvider>
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}