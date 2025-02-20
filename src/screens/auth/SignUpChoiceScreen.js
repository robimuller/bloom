import React, { useEffect, useRef } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';

import TiltedCarousel from '../../components/TiltedCarousel';

export default function GalleoLoginScreen({ navigation }) {
    const { colors } = useTheme();

    // Animated values for the carousel and bottom container
    const carouselOpacity = useRef(new Animated.Value(0)).current;
    const bottomTranslateY = useRef(new Animated.Value(50)).current;
    const bottomOpacity = useRef(new Animated.Value(0)).current;

    // Separate animated values for individual bottom elements
    const appNameOpacity = useRef(new Animated.Value(0)).current;
    const appNameTranslateY = useRef(new Animated.Value(20)).current;

    const termsOpacity = useRef(new Animated.Value(0)).current;
    const termsTranslateY = useRef(new Animated.Value(20)).current;

    // For the buttons, we wrap the inner content in Animated.View
    const loginButtonOpacity = useRef(new Animated.Value(0)).current;
    const loginButtonTranslateY = useRef(new Animated.Value(20)).current;

    const registerPromptOpacity = useRef(new Animated.Value(0)).current;
    const registerPromptTranslateY = useRef(new Animated.Value(20)).current;

    const registerButtonOpacity = useRef(new Animated.Value(0)).current;
    const registerButtonTranslateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Animate carousel fade-in and bottom container slide/fade simultaneously
        Animated.parallel([
            Animated.timing(carouselOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.delay(300),
                Animated.parallel([
                    Animated.timing(bottomTranslateY, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(bottomOpacity, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ]).start();
    }, [carouselOpacity, bottomOpacity, bottomTranslateY]);

    // Stagger reveal for individual bottom elements
    useEffect(() => {
        const timeout = setTimeout(() => {
            Animated.stagger(100, [
                Animated.parallel([
                    Animated.timing(appNameOpacity, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(appNameTranslateY, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(termsOpacity, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(termsTranslateY, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(loginButtonOpacity, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(loginButtonTranslateY, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(registerPromptOpacity, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(registerPromptTranslateY, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(registerButtonOpacity, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(registerButtonTranslateY, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }, 800);
        return () => clearTimeout(timeout);
    }, [
        appNameOpacity,
        appNameTranslateY,
        termsOpacity,
        termsTranslateY,
        loginButtonOpacity,
        loginButtonTranslateY,
        registerPromptOpacity,
        registerPromptTranslateY,
        registerButtonOpacity,
        registerButtonTranslateY,
    ]);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: "#1A1B25" }]}>
            {/* Animated carousel container */}
            <Animated.View style={[styles.carouselContainer, { opacity: carouselOpacity }]}>
                <TiltedCarousel />
            </Animated.View>

            {/* Animated bottom container */}
            <Animated.View
                style={[
                    styles.bottomContainer,
                    { transform: [{ translateY: bottomTranslateY }], opacity: bottomOpacity },
                ]}
            >
                <Animated.View
                    style={{
                        opacity: appNameOpacity,
                        transform: [{ translateY: appNameTranslateY }],
                    }}
                >
                    <Text style={[styles.appName, { color: "#fff" }]}>GALLEO</Text>
                </Animated.View>

                <Animated.View
                    style={{
                        opacity: termsOpacity,
                        transform: [{ translateY: termsTranslateY }],
                    }}
                >
                    <Text style={[styles.termsText, { color: "#fff" }]}>
                        By logging in you accept our{' '}
                        <Text
                            style={[styles.linkText, { color: colors.primary }]}
                            onPress={() => {
                                /* handle terms link */
                            }}
                        >
                            Terms & Conditions
                        </Text>
                    </Text>
                </Animated.View>

                {/* Log In Button */}
                <TouchableOpacity
                    style={styles.loginButtonWrapper}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.8}
                >
                    <Animated.View
                        style={{
                            opacity: loginButtonOpacity,
                            transform: [{ translateY: loginButtonTranslateY }],
                        }}
                    >
                        <LinearGradient
                            colors={['#7C49C6', '#C867E3']}
                            style={styles.loginButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={[styles.loginButtonText, { color: colors.text }]}>Log In</Text>
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>

                {/* Register Prompt */}
                <Animated.View
                    style={{
                        opacity: registerPromptOpacity,
                        transform: [{ translateY: registerPromptTranslateY }],
                    }}
                >
                    <Text style={[styles.registerPrompt, { color: "#fff" }]}>
                        Don’t have an account? Register below
                    </Text>
                </Animated.View>

                {/* Register Button */}
                <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => navigation.navigate('EmailSignUpStack')}
                >
                    <Animated.View
                        style={{
                            opacity: registerButtonOpacity,
                            transform: [{ translateY: registerButtonTranslateY }],
                        }}
                    >
                        <Text style={styles.registerButtonText}>Register</Text>
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    carouselContainer: {
        height: 300,
    },
    bottomContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    appName: {
        fontSize: 60,
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