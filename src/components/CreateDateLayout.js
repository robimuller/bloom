// CreateDateLayout.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient'; // or 'react-native-linear-gradient'
import HostHeader from './HostHeader';

/* 
 * 1) Custom gradient progress bar. 
 *    “progress” is a number 0..1. 
 *    “barHeight” is optional style.
 */
function GradientProgressBar({ progress, barHeight = 8 }) {
    return (
        <View
            style={{
                height: barHeight,
                borderRadius: barHeight / 2,
                backgroundColor: '#ccc', // the unfilled portion
                overflow: 'hidden',
            }}
        >
            <View style={{ width: `${progress * 100}%`, height: '100%' }}>
                <LinearGradient
                    colors={['#e60000', '#e6ab00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: '100%' }}
                />
            </View>
        </View>
    );
}

/* 
 * 2) Custom gradient button. 
 *    We replicate the arrow-right + label. 
 */
function GradientButton({ label, icon = 'arrow-right', onPress, style }) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.gradientButtonContainer, style]}>
            {/* The gradient background */}
            <LinearGradient
                colors={['#e60000', '#e6ab00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 25 }]}
            />
            {/* The button content: icon + text */}
            <View style={styles.gradientButtonContent}>
                {/* Icon */}
                <IconButton
                    icon={icon}
                    size={20}
                    iconColor="#fff"
                    style={{ margin: 0, marginRight: 4 }}
                />
                <Text style={styles.gradientButtonText}>{label}</Text>
            </View>
        </TouchableOpacity>
    );
}

/* ============================= */
/*         MAIN LAYOUT          */
/* ============================= */
export default function CreateDateLayout({
    step = 1,
    totalSteps = 5,
    hostPhoto,
    hostName,
    hostAge,
    title,
    subtitle,
    errorComponent,
    canGoBack = false,
    onBack,
    onNext,
    nextLabel = 'Next',
    backLabel = 'Back',
    children,
    theme,
}) {
    const progress = step / totalSteps;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* ========== TOP SECTION ========== */}
            <View style={styles.topSection}>
                {/* If you want to show host header here, uncomment:
        <View style={styles.headerRow}>
          <HostHeader
            photo={hostPhoto}
            name={hostName}
            age={hostAge}
            theme={theme}
          />
        </View>
        */}

                {/* Title & Subtitle */}
                {title ? (
                    <Text
                        variant="headlineMedium"
                        style={[styles.mainTitle, { color: theme.colors.text }]}
                    >
                        {title}
                    </Text>
                ) : null}
                {subtitle ? (
                    <Text
                        variant="bodySmall"
                        style={[styles.subtitle, { color: theme.colors.text }]}
                    >
                        {subtitle}
                    </Text>
                ) : null}

                {/* Gradient Progress Bar */}
                <View style={{ marginTop: 8 }}>
                    <GradientProgressBar progress={progress} />
                </View>

                {/* Error messages (if any) */}
                {errorComponent}
            </View>

            {/* ========== MIDDLE SECTION (OUR "CARD") ========== */}
            <View style={styles.cardSection}>
                <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
                    <View style={styles.cardContent}>{children}</View>
                </View>
            </View>

            {/* ========== BOTTOM NAVIGATION ========== */}
            <View style={styles.bottomNav}>
                {canGoBack ? (
                    <TouchableOpacity
                        onPress={onBack}
                        style={[styles.outlinedBtn, { borderColor: theme.colors.primary }]}
                    >
                        {/* Left arrow icon + text */}
                        <IconButton
                            icon="arrow-left"
                            size={20}
                            iconColor={theme.colors.primary}
                            style={{ margin: 0, marginRight: 4 }}
                        />
                        <Text style={[styles.outlinedBtnText, { color: theme.colors.primary }]}>
                            {backLabel}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.buttonPlaceholder} />
                )}

                {/* Next button (gradient) */}
                <GradientButton label={nextLabel} icon="arrow-right" onPress={onNext} />
            </View>
        </View>
    );
}

/* ============================= */
/*           STYLES             */
/* ============================= */
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    // ======= TOP SECTION =======
    topSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    mainTitle: {
        marginBottom: 4,
        fontWeight: '600',
    },
    subtitle: {
        marginBottom: 12,
    },

    // ======= MIDDLE “CARD” SECTION =======
    cardSection: {
        flex: 1,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    card: {
        flex: 1,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    cardContent: {
        flex: 1,
        padding: 16,
    },

    // ======= BOTTOM NAV SECTION =======
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    buttonPlaceholder: {
        width: 120,
        height: 48,
    },

    // Outline "Back" button
    outlinedBtn: {
        minWidth: 120,
        height: 48,
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    outlinedBtnText: {
        fontSize: 16,
    },

    // ======= GRADIENT BUTTON =======
    gradientButtonContainer: {
        minWidth: 120,
        height: 48,
        borderRadius: 25,
        overflow: 'hidden',
    },
    gradientButtonContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
});
