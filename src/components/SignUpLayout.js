// src/components/SignUpLayout.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

// A small helper to show the 5-step progress horizontally
function MultiStepBar({ currentStep, theme }) {
    // We’ll define 5 total steps. For clarity, an array of step labels is optional:
    const stepLabels = ['Basic', 'Details', 'Preferences', 'Permissions', 'Finish'];
    // currentStep is 1..5

    return (
        <View style={stylesMSB.container}>
            {stepLabels.map((label, idx) => {
                const stepIndex = idx + 1; // 1..5
                const isActive = stepIndex <= currentStep;

                return (
                    <View key={label} style={stylesMSB.stepItem}>
                        <View
                            style={[
                                stylesMSB.stepBar,
                                {
                                    backgroundColor: isActive ? theme.primary : '#ccc',
                                },
                            ]}
                        />
                        <Text
                            style={[
                                stylesMSB.stepLabel,
                                { color: isActive ? theme.primary : theme.text },
                            ]}
                            numberOfLines={1}
                        >
                            {label}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

export default function SignUpLayout({
    title,
    subtitle,
    currentStep,     // 1..5
    totalSteps = 5,
    errorComponent,
    canGoBack = false,
    onBack,
    onNext,
    nextLabel = 'Next',
    backLabel = 'Back',
    children,
    style,
    theme,
}) {
    return (
        <View style={[styles.container, { backgroundColor: theme.background }, style]}>
            {/* TOP AREA */}
            <View style={styles.topArea}>
                {/* Title & Subtitle */}
                {title ? (
                    <Text variant="headlineMedium" style={[styles.title, { color: theme.text }]}>
                        {title}
                    </Text>
                ) : null}

                {subtitle ? (
                    <Text variant="bodySmall" style={[styles.subtitle, { color: theme.text }]}>
                        {subtitle}
                    </Text>
                ) : null}

                {/* Multi-Step Horizontal Bar */}
                <MultiStepBar currentStep={currentStep} theme={theme} />

                {/* Optionally show "Step X of Y" below the bar */}
                {/* <Text style={[styles.stepText, { color: theme.text }]}>
          Step {currentStep} of {totalSteps}
        </Text> */}

                {/* Error Messages */}
                {errorComponent}
            </View>

            {/* MIDDLE CONTENT */}
            <View style={styles.contentArea}>{children}</View>

            {/* BOTTOM NAV AREA */}
            <View style={styles.bottomNav}>
                {canGoBack ? (
                    <Button
                        mode="outlined"
                        icon="arrow-left"
                        onPress={onBack}
                        style={[styles.navButton, { borderColor: theme.primary }]}
                        textColor={theme.primary}
                        labelStyle={{ fontSize: 16 }}
                    >
                        {backLabel}
                    </Button>
                ) : (
                    <View style={{ width: 120 }} />
                )}

                <Button
                    mode="contained"
                    icon="arrow-right"
                    onPress={onNext}
                    style={styles.navButton}
                    buttonColor={theme.primary}
                    labelStyle={{ fontSize: 16, color: '#fff' }}
                >
                    {nextLabel}
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    topArea: {
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    title: {
        marginBottom: 4,
        fontWeight: '600',
    },
    subtitle: {
        marginBottom: 16,
    },
    stepText: {
        marginTop: 8,
    },
    contentArea: {
        flex: 1,
        paddingHorizontal: 24,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 16,
        paddingTop: 16,
    },
    navButton: {
        minWidth: 120,
    },
});

/** Additional styles for the multi-step bar */
const stylesMSB = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stepItem: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 2,
    },
    stepBar: {
        height: 6,
        borderRadius: 3,
        width: '100%',
        marginBottom: 4,
    },
    stepLabel: {
        fontSize: 10,
        textAlign: 'center',
    },
});
