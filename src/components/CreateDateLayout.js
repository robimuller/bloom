import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import GradientProgressBar from './GradientProgressBar';
import ShootingLightButton from './ShootingLightButton';
import PromotionSummaryBanner from './PromotionSummaryBanner';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// ----- Custom Error Toast Component -----
const CustomErrorToast = ({ text1, hideToast }) => {
    const theme = useTheme();
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
                color={theme.colors.background}
                style={{ backgroundColor: theme.colors.primary, borderRadius: 48 }}
            />
        </View>
    );
};

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

const toastConfig = {
    custom_error: ({ text1, hideToast, ...rest }) => (
        <CustomErrorToast text1={text1} hideToast={hideToast} {...rest} />
    ),
};

// ----- CreateDateLayout Component -----
export default function CreateDateLayout({
    step = 1,
    totalSteps = 5,
    hostPhoto,
    hostName,
    hostAge,
    title = 'Create Date',
    subtitle,
    errorMessage, // New prop for error toast message (string)
    errorComponent, // Optional additional error component
    canGoBack = false,
    onBack,
    onNext,
    nextLabel = 'Next',
    backLabel = 'Back',
    children,
    selectedPromotion, // The selected promotion object
    onEditPromotion,   // Callback to edit or remove the promotion
    onPressBanner,     // Callback for when the banner is pressed
}) {
    const navigation = useNavigation();
    const theme = useTheme();
    const handleBack = onBack ? onBack : () => navigation.goBack();
    const progress = step / totalSteps;

    // Track keyboard height so we can offset the toast when needed.
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    useEffect(() => {
        if (errorMessage) {
            // Hide any existing toast first.
            Toast.hide();
            // Then re-show the toast with an updated bottomOffset.
            Toast.show({
                type: 'custom_error',
                text1: errorMessage,
                position: 'bottom',
                bottomOffset: keyboardHeight > 0 ? keyboardHeight + 200 : 200,
                autoHide: false,
            });
        }
    }, [errorMessage, keyboardHeight]);

    return (
        <KeyboardAvoidingView
            style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={{ flex: 1 }}>
                        {/* HEADER */}
                        <View style={styles.headerContainer}>
                            {canGoBack && (
                                <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
                                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                                </TouchableOpacity>
                            )}
                            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{title}</Text>
                        </View>
                        {/* Persistent Promotion Summary Banner */}
                        {selectedPromotion && (
                            <PromotionSummaryBanner
                                promotion={selectedPromotion}
                                onRemove={onEditPromotion}
                                onPressBanner={onPressBanner}
                            />
                        )}
                        {/* TOP SECTION */}
                        <View style={styles.topSection}>
                            {subtitle && (
                                <Text variant="bodySmall" style={[styles.subtitle, { color: theme.colors.secondary }]}>
                                    {subtitle}
                                </Text>
                            )}
                            <View style={{ marginTop: 8 }}>
                                <GradientProgressBar progress={progress} />
                            </View>
                        </View>
                        {/* MIDDLE CARD SECTION */}
                        <View style={styles.cardSection}>
                            <View style={[styles.card, { backgroundColor: theme.colors.background }]}>
                                <View style={styles.cardContent}>
                                    {children}
                                </View>
                            </View>
                        </View>
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
                    </View>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    /* HEADER STYLES */
    headerContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    headerBackButton: {
        padding: 8,
        zIndex: 2,
    },
    headerTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
        zIndex: 1,
    },
    /* TOP SECTION */
    topSection: {
        paddingTop: 16,
        paddingBottom: 12,
    },
    subtitle: {
        marginBottom: 12,
    },
    /* CARD SECTION */
    cardSection: {
        flex: 1,
        marginBottom: 16,
    },
    card: {
        flex: 1,
        borderRadius: 16,
    },
    cardContent: {
        flexGrow: 1,
        paddingVertical: 16,
    },
    /* BOTTOM NAVIGATION */
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
    },
    shootingLightButton: {
        width: '100%',
    },
});