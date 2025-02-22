import React, { useEffect, useContext } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useThemeContext } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import ShootingLightButton from '../components/ShootingLightButton';
import GradientProgressBar from '../components/GradientProgressBar';

// Custom error toast component.
const CustomErrorToast = ({ text1, hideToast }) => {
    const { colors } = useContext(ThemeContext);
    return (
        <View style={toastStyles.container}>
            <Text style={toastStyles.text}>{text1}</Text>
            <Ionicons
                onPress={() => {
                    Toast.hide();
                    if (hideToast) hideToast();
                }}
                name="close-outline"
                size={24}
                color={colors.background}
                style={{ backgroundColor: colors.primary, borderRadius: 48 }}
            />
        </View>
    );
};

const toastConfig = {
    custom_error: ({ text1, hideToast, ...rest }) => (
        <CustomErrorToast text1={text1} hideToast={hideToast} {...rest} />
    ),
};

export default function SignUpLayout({
    title,
    subtitle,
    progress = 0,
    errorMessage, // expects a string error message
    canGoBack = false,
    onBack,
    onNext,
    nextLabel = 'Next',
    children,
    style,
}) {
    const { colors } = useThemeContext();

    useEffect(() => {
        if (errorMessage) {
            Toast.show({
                type: 'custom_error',
                text1: errorMessage,
                position: 'bottom',
                autoHide: false,
            });
        }
    }, [errorMessage]);

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }, style]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={60} // adjust as needed
        >
            {/* HEADER AREA */}
            <View style={styles.header}>
                {canGoBack && (
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.primary} />
                    </TouchableOpacity>
                )}
                {title && (
                    <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
                        {title}
                    </Text>
                )}
            </View>
            {subtitle && (
                <Text variant="bodySmall" style={[styles.subtitle, { color: colors.secondary }]}>
                    {subtitle}
                </Text>
            )}
            <GradientProgressBar progress={progress} barHeight={8} />

            {/* MIDDLE CONTENT */}
            <View style={styles.contentArea}>{children}</View>

            {/* BOTTOM NAVIGATION */}
            <View style={styles.bottomNav}>
                <ShootingLightButton
                    label={nextLabel}
                    icon="arrow-right"
                    onPress={onNext}
                    style={styles.shootingLightButton}
                />
            </View>
            <Toast config={toastConfig} />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontWeight: '600',
        fontSize: 22,
    },
    subtitle: {
        marginBottom: 16,
        fontSize: 16,
    },
    contentArea: {
        flex: 1,
        justifyContent: 'flex-start',
        marginTop: 16,
    },
    bottomNav: {
        paddingVertical: 16,
    },
    shootingLightButton: {
        width: '100%',
    },
});

const toastStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'black',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
    },
    text: {
        flex: 1,
        color: 'white',
        fontSize: 16,
    },
});