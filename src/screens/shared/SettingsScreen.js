// src/screens/SettingsScreen.js
import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, Switch } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext'; // Adjust the path as needed
import { ThemeContext } from '../../contexts/ThemeContext';
import { useTheme } from 'react-native-paper';

export default function SettingsScreen() {
    const { user, logout } = useContext(AuthContext);
    const { themeMode, toggleTheme } = useContext(ThemeContext);
    const paperTheme = useTheme(); // To access react-native-paper theme for styling

    const handleLogout = async () => {
        try {
            await logout();
            alert('You have successfully logged out.');
        } catch (error) {
            alert(`Error logging out: ${error.message}`);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
            {user ? (
                <>
                    <Text style={[styles.text, { color: paperTheme.colors.text }]}>Logged in as:</Text>
                    <Text style={[styles.userId, { color: paperTheme.colors.text }]}>{user.uid}</Text>
                    <Text style={[styles.userId, { color: paperTheme.colors.text }]}>{user.displayName}</Text>
                </>
            ) : (
                <Text style={[styles.text, { color: paperTheme.colors.text }]}>No user is currently logged in.</Text>
            )}

            <View style={styles.themeToggleContainer}>
                <Text style={[styles.text, { color: paperTheme.colors.text }]}>
                    {themeMode === 'light' ? 'Light Theme' : 'Dark Theme'}
                </Text>
                <Switch
                    value={themeMode === 'dark'}
                    onValueChange={toggleTheme}
                    thumbColor={themeMode === 'dark' ? paperTheme.colors.primary : '#f4f3f4'}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                />
            </View>

            <Button title="Log Out" onPress={handleLogout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    text: {
        fontSize: 18,
        marginBottom: 8,
    },
    userId: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    themeToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
});
