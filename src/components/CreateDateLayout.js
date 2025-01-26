// CreateDateLayout.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
    Text,
    Button,
    ProgressBar
} from 'react-native-paper';
import HostHeader from './HostHeader';

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
    // We'll assume `theme` has the shape { colors: { background, text, primary, cardBackground } }
    theme,
}) {
    const progress = step / totalSteps;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

            {/* ========== TOP SECTION ========== */}
            <View style={styles.topSection}>
                <View style={styles.headerRow}>
                    <HostHeader
                        photo={hostPhoto}
                        name={hostName}
                        age={hostAge}
                        theme={theme}
                    />
                </View>

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

                {/* Progress Bar */}
                <View style={{ marginTop: 8 }}>
                    <ProgressBar
                        progress={progress}
                        color={theme.colors.primary}
                        style={{ height: 8, borderRadius: 4 }}
                    />
                </View>

                {/* Error messages (if any) */}
                {errorComponent}
            </View>

            {/* ========== MIDDLE SECTION (OUR "CARD") ========== */}
            <View style={styles.cardSection}>
                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.colors.cardBackground,
                        },
                    ]}
                >
                    <View style={styles.cardContent}>
                        {children}
                    </View>
                </View>
            </View>

            {/* ========== BOTTOM NAVIGATION ========== */}
            <View style={styles.bottomNav}>
                {canGoBack ? (
                    <Button
                        mode="outlined"
                        icon="arrow-left"
                        onPress={onBack}
                        style={[styles.navButton, { borderColor: theme.colors.primary }]}
                        textColor={theme.colors.primary}
                        labelStyle={{ fontSize: 16 }}
                    >
                        {backLabel}
                    </Button>
                ) : (
                    /* 
                     * This placeholder exactly matches 
                     * the navButton style: same width & height 
                     * so the layout doesn't shift.
                     */
                    <View style={styles.buttonPlaceholder} />
                )}

                <Button
                    mode="contained"
                    icon="arrow-right"
                    onPress={onNext}
                    style={styles.navButton}
                    buttonColor={theme.colors.primary}
                    labelStyle={{ fontSize: 16, color: '#fff' }}
                >
                    {nextLabel}
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    /* Outer container takes the full screen (or parent space) */
    container: {
        flex: 1,
    },

    /* ===== TOP SECTION ===== */
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

    /* ===== MIDDLE “CARD” SECTION ===== */
    cardSection: {
        // Fill leftover vertical space between top & bottom
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

    /* ===== BOTTOM NAV SECTION ===== */
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    navButton: {
        // Must define both width & height 
        // so we can match it exactly in buttonPlaceholder
        minWidth: 120,
        height: 48,
        justifyContent: 'center',
    },
    buttonPlaceholder: {
        width: 120,
        height: 48,
    },
});
