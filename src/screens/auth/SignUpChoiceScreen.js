// src/screens/auth/SignUpChoiceScreen.js
import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';

export default function SignUpChoiceScreen({ navigation }) {
    const { theme, toggleTheme, themeMode } = useContext(ThemeContext);

    return (
        <View style={[styles.container, { backgroundColor: theme.background50 }]}>
            <Text style={[styles.title, { color: theme.text900 }]}>
                Gallanty
            </Text>
            <Text style={[styles.subtitle, { color: theme.text700 }]}>
                "Gentlemen Plan, Love Happens"
            </Text>

            <View style={{ marginVertical: 24 }}>
                <Button
                    title="Sign Up with Email"
                    color={theme.primary500}
                    onPress={() => navigation.navigate('EmailSignUpStack')}
                />
            </View>

            <View style={{ marginVertical: 12 }}>
                <Button
                    title="Sign Up with Phone"
                    color={theme.secondary500}
                    onPress={() => navigation.navigate('PhoneSignUpStack')}
                />
            </View>

            <Text
                style={[styles.link, { color: theme.accent400 }]}
                onPress={() => navigation.navigate('Login')}
            >
                Already have an account? Login
            </Text>

            {/* Theme Toggle Button */}
            <TouchableOpacity
                onPress={toggleTheme}
                style={[
                    styles.themeToggle,
                    { backgroundColor: themeMode === 'light' ? theme.background200 : theme.background800 },
                ]}
            >
                <Text style={{ color: theme.text500 }}>
                    {themeMode === 'light' ? 'Switch to Dark' : 'Switch to Light'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 26,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    link: {
        marginTop: 20,
        textDecorationLine: 'underline',
    },
    themeToggle: {
        marginTop: 30,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
});
