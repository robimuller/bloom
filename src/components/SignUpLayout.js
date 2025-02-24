import React, { useEffect, useContext } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useThemeContext } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import ShootingLightButton from '../components/ShootingLightButton';
import GradientProgressBar from '../components/GradientProgressBar';
import AnimatedHeaderTitle from '../components/AnimatedHeaderTitle'; // Import our new component

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
    nextDisabled = false, // new prop with default value
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            keyboardVerticalOffset={0}
        >
            {/* HEADER AREA */}
            <View style={styles.header}>
                {canGoBack && (
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.primary} />
                    </TouchableOpacity>
                )}
                {title && (
                    <AnimatedHeaderTitle
                        title={title}
                        style={[styles.title, { color: colors.text }]}
                    />
                )}
            </View>
            {subtitle && (
                <Text variant="bodySmall" style={[styles.subtitle, { color: colors.secondary }]}>
                    {subtitle}
                </Text>
            )}
            <GradientProgressBar progress={progress} barHeight={8} />

            {/* MIDDLE CONTENT */}
            <ScrollView style={styles.contentArea} contentContainerStyle={{ justifyContent: "flex-start" }} showsVerticalScrollIndicator={false}>{children}</ScrollView>

            {/* BOTTOM NAVIGATION */}
            <View style={styles.bottomNav}>
                <ShootingLightButton
                    label={nextLabel}
                    icon="arrow-right"
                    onPress={nextDisabled ? null : onNext}  // Prevent press if disabled
                    disabled={nextDisabled} // Pass disabled flag if your button supports it
                    style={[
                        styles.shootingLightButton,
                        nextDisabled && { backgroundColor: colors.secondary } // Change background when disabled
                    ]}
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
        paddingBottom: 16,
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
        marginTop: 16,
    },
    bottomNav: {
        paddingBottom: 16,
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