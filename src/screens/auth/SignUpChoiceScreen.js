// src/screens/auth/SignUpChoiceScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function SignUpChoiceScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Choose Sign Up Method</Text>

            <Button
                title="Sign Up with Email"
                onPress={() => navigation.navigate('EmailSignUpStack')}
            />
            <Button
                title="Sign Up with Phone"
                onPress={() => navigation.navigate('PhoneSignUpStack')}
            />

            <Text
                style={styles.link}
                onPress={() => navigation.navigate('Login')}
            >
                Already have an account? Login
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 22, marginBottom: 20 },
    link: {
        marginTop: 20,
        color: 'blue',
        textDecorationLine: 'underline',
    },
});
