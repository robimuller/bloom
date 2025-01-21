// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { UserProfileProvider } from './src/contexts/UserProfileContext';
import { DatesProvider } from './src/contexts/DatesContext';
import { RequestsProvider } from './src/contexts/RequestsContext';
import { ChatProvider } from './src/contexts/ChatContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { NotificationsProvider } from './src/contexts/NotificationsContext';
import { SignUpProvider } from './src/contexts/SignUpContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <SignUpProvider>
        <SettingsProvider>
          <UserProfileProvider>
            <DatesProvider>
              <RequestsProvider>
                <ChatProvider>
                  <NotificationsProvider>
                    {/* Wrap the top-level navigator in NavigationContainer */}
                    <NavigationContainer>
                      <AppNavigator />
                    </NavigationContainer>
                  </NotificationsProvider>
                </ChatProvider>
              </RequestsProvider>
            </DatesProvider>
          </UserProfileProvider>
        </SettingsProvider>
      </SignUpProvider>
    </AuthProvider>
  );
}
