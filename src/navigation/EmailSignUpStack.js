// navigation/EmailSignUpStack.js
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WizardProvider } from '../contexts/WizardContext';
import EmailSignUpScreen from '../screens/auth/emailWizard/EmailSignUpScreen';


const Stack = createNativeStackNavigator();

export default function EmailSignUpStack({ navigation }) {

    return (
        <WizardProvider navigation={navigation}>

            <Stack.Navigator>
                <Stack.Screen
                    name="EmailSignUpScreen"
                    component={EmailSignUpScreen}
                    options={{ title: 'SignUp', headerShown: false }}
                />

            </Stack.Navigator>
        </WizardProvider>
    );
}