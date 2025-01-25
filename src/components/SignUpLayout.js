import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';

/**
 * A simplified progress bar that goes from 0..1. 
 * `progress` is a number between 0.0 and 1.0
 */
function SingleProgressBar({ progress, theme }) {
    return (
        <View style={{ marginTop: 8 }}>
            <ProgressBar
                progress={progress}
                color={theme.primary}
                style={{ height: 8, borderRadius: 4 }}
            />
        </View>
    );
}

export default function SignUpLayout({
    title,
    subtitle,
    // We'll receive a "progress" prop or compute it
    progress = 0,
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

                {/* Single linear progress bar */}
                <SingleProgressBar progress={progress} theme={theme} />

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
