import React, { useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient'; // or react-native-linear-gradient

/* 
  ============================
     1) STATIC GRADIENT BAR
  ============================
  A normal progress bar:
  - Gray background (unfilled).
  - Filled portion is a left→right gradient (red→gold).
*/
function GradientProgressBar({ progress, barHeight = 8 }) {
    return (
        <View
            style={{
                height: barHeight,
                borderRadius: barHeight / 2,
                backgroundColor: '#ccc',
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
  ============================
    2) SHOOTING LIGHT BUTTON
  ============================
  - Base layer: static gradient (#e60000 → #e6ab00).
  - Animated highlight layer: 
    a translucent white band that sweeps from left to right.
*/
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

function ShootingLightButton({ label, icon = 'arrow-right', onPress, style }) {
    // The anim value that goes from -1 → +1
    // We'll shift the highlight from far left to far right
    const lightAnim = useRef(new Animated.Value(-1)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(lightAnim, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
                // Reset instantly to -1 (so the band snaps back to left)
                Animated.timing(lightAnim, {
                    toValue: -1,
                    duration: 0,
                    useNativeDriver: false,
                }),
                // Optional: add a small delay here if you want a pause
                Animated.delay(5000),
            ])
        );
        loop.start();

        return () => loop.stop();
    }, [lightAnim]);

    // We'll use the base gradient as the background
    // Then layer a narrow highlight on top
    const baseColors = ['#e60000', '#e6ab00'];

    // The highlight band is basically transparent → white → transparent
    // to create that "light beam" effect
    const highlightColors = [
        'rgba(255,255,255,0)', // transparent
        'rgba(255,255,255,0.6)', // bright center
        'rgba(255,255,255,0)', // transparent
    ];

    // Interpolate the "start" and "end" positions
    // so the highlight crosses from left (-1) to right (~ +1).
    const startX = lightAnim;
    // We'll make the band about 0.3 wide
    const endX = Animated.add(lightAnim, 0.4);

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.shootButtonContainer, style]}
            activeOpacity={0.8}
        >
            {/* ======= BASE (STATIC) GRADIENT ======= */}
            <LinearGradient
                colors={baseColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 25 }]}
            />

            {/* ======= ANIMATED HIGHLIGHT LAYER ======= */}
            <AnimatedLinearGradient
                colors={highlightColors}
                start={{ x: startX, y: 0 }}
                end={{ x: endX, y: 0 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 25 }]}
            />

            {/* FOREGROUND CONTENT: icon + label */}
            <View style={styles.shootButtonContent}>
                <IconButton
                    icon={icon}
                    size={20}
                    iconColor="#fff"
                    style={{ margin: 0, marginRight: 4 }}
                />
                <Text style={styles.shootButtonText}>{label}</Text>
            </View>
        </TouchableOpacity>
    );
}

/*
  ============================
       3) MAIN LAYOUT
  ============================
*/
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
            {/* TOP SECTION */}
            <View style={styles.topSection}>
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

                {/* Gradient ProgressBar (static) */}
                <View style={{ marginTop: 8 }}>
                    <GradientProgressBar progress={progress} />
                </View>

                {/* Error messages (if any) */}
                {errorComponent}
            </View>

            {/* MIDDLE CARD SECTION */}
            <View style={styles.cardSection}>
                <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
                    <View style={styles.cardContent}>{children}</View>
                </View>
            </View>

            {/* BOTTOM NAVIGATION */}
            <View style={styles.bottomNav}>
                {canGoBack ? (
                    <TouchableOpacity
                        onPress={onBack}
                        style={[styles.outlinedBtn, { borderColor: theme.colors.primary }]}
                    >
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

                {/* Shooting Light Button */}
                <ShootingLightButton label={nextLabel} icon="arrow-right" onPress={onNext} />
            </View>
        </View>
    );
}

/* =============================
       STYLES
============================= */
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // ====== TOP SECTION ======
    topSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    mainTitle: {
        marginBottom: 4,
        fontWeight: '600',
    },
    subtitle: {
        marginBottom: 12,
    },

    // ====== CARD SECTION ======
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

    // ====== BOTTOM NAV ======
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

    // Outlined “Back” button
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

    // ====== SHOOTING LIGHT NEXT BUTTON ======
    shootButtonContainer: {
        minWidth: 120,
        height: 48,
        borderRadius: 25,
        overflow: 'hidden',
    },
    shootButtonContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shootButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
});
