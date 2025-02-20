import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';

import TiltedCarousel from '../../components/TiltedCarousel'; // wherever you placed it

export default function GalleoLoginScreen({ navigation }) {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: "#1A1B25" }]}>
            {/* Top half or partial for the carousel */}
            <View style={styles.carouselContainer}>
                <TiltedCarousel />
            </View>

            {/* Bottom half for login/register UI */}
            <View style={styles.bottomContainer}>
                <Text style={[styles.appName, { color: colors.text }]}>GALLEO</Text>
                <Text style={[styles.termsText, { color: colors.secondary }]}>
                    By logging in you accept our{' '}
                    <Text
                        style={[styles.linkText, { color: colors.primary }]}
                        onPress={() => {/* handle terms link */ }}
                    >
                        Terms & Conditions
                    </Text>
                </Text>

                {/* Log In Button */}
                <TouchableOpacity
                    style={styles.loginButtonWrapper}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#7C49C6', '#C867E3']}
                        style={styles.loginButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={[styles.loginButtonText, { color: colors.text }]}>Log In</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Register */}
                <Text style={[styles.registerPrompt, { color: colors.secondary }]}>
                    Don’t have an account? Register below
                </Text>
                <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => navigation.navigate('EmailSignUpStack')}
                >
                    <Text style={styles.registerButtonText}>Register</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    carouselContainer: {
        // Decide how much vertical space you want for the carousel
        height: 300,
    },
    bottomContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    appName: {
        fontSize: 32,
        fontWeight: '900',
        marginTop: 24,
        marginBottom: 24,
    },
    termsText: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    linkText: {
        textDecorationLine: 'underline',
    },
    loginButtonWrapper: {
        width: '80%',
        marginBottom: 24,
    },
    loginButton: {
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    registerPrompt: {
        fontSize: 14,
        marginBottom: 16,
    },
    registerButton: {
        width: '80%',
        borderWidth: 1,
        borderColor: '#C867E3',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
    },
    registerButtonText: {
        color: '#C867E3',
        fontSize: 16,
        fontWeight: '600',
    },
});