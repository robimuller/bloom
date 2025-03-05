// App.js
import React, { useEffect, useContext } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
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
import { PromotionsProvider } from './src/contexts/PromotionsContext';
import OfflineNotice from './src/components/OfflineNotice';
import 'react-native-reanimated';
import { UserProfileProvider } from './src/contexts/UserProfileContext';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { LocationProvider } from './src/contexts/LocationContext';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding on app load
export default function App() {
  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => { });
  }, []);

  return (
    <ThemeProvider>
      <AppWithPaper />
    </ThemeProvider>
  );
}

// App.js (updated snippet)
function AppWithPaper() {
  const { theme, themeMode, colors } = useContext(ThemeContext);
  const paperTheme = createPaperTheme(theme, themeMode);
  const barStyle = themeMode === 'light' ? 'dark-content' : 'light-content';

  // Create a navigation theme that uses your dark background
  // and includes the fonts from paperTheme
  const navigationTheme = {
    dark: themeMode === 'dark',
    fonts: paperTheme.fonts, // add fonts here
    colors: {
      ...DefaultTheme.colors,
      background: colors.background, // use your dark theme background
      card: colors.background,       // card background during transitions
      text: colors.text,
      border: colors.background,
      primary: colors.primary,
      notification: colors.primary,
    },
  };

  useEffect(() => {
    async function prepare() {
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  return (
    <BottomSheetModalProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <PaperProvider theme={paperTheme}>
          <StatusBar barStyle={barStyle} backgroundColor={colors.background} />
          <OfflineNotice />
          <AuthProvider>
            <SignUpProvider>
              <SettingsProvider>
                <UserProfileProvider>
                  <ProfilesProvider>
                    <DatesProvider>
                      <LocationProvider>
                        <PromotionsProvider>
                          <RequestsProvider>
                            <ChatProvider>
                              <NotificationsProvider>
                                <NavigationContainer theme={navigationTheme}>
                                  <AppNavigator />
                                </NavigationContainer>
                              </NotificationsProvider>
                            </ChatProvider>
                          </RequestsProvider>
                        </PromotionsProvider>
                      </LocationProvider>
                    </DatesProvider>
                  </ProfilesProvider>
                </UserProfileProvider>
              </SettingsProvider>
            </SignUpProvider>
          </AuthProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </BottomSheetModalProvider>
  );
}