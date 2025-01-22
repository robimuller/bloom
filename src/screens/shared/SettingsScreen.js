import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext'; // Adjust the path as needed

export default function SettingsScreen() {
    const { user, logout } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            await logout();
            alert('You have successfully logged out.');
        } catch (error) {
            alert(`Error logging out: ${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            {user ? (
                <>
                    <Text style={styles.text}>Logged in as:</Text>
                    <Text style={styles.userId}>{user.uid}</Text>
                </>
            ) : (
                <Text style={styles.text}>No user is currently logged in.</Text>
            )}
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
});
