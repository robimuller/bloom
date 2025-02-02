import React, { useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
    ScrollView
} from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

/* 
  ============================
     1) STATIC GRADIENT BAR
  ============================
*/
function GradientProgressBar({ progress, barHeight = 8 }) {
    const theme = useTheme(); // Get theme from react-native-paper

    return (
        <View
            style={{
                height: barHeight,
                borderRadius: barHeight / 2,
                backgroundColor: theme.colors.cardBackground,
                overflow: 'hidden',
            }}
        >
            <View style={{ width: `${progress * 100}%`, height: '100%' }}>
                <LinearGradient
                    colors={['#eeaeca', '#94bbe9']}
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
*/
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

function ShootingLightButton({ label, icon = 'arrow-right', onPress, style }) {
    const lightAnim = useRef(new Animated.Value(-1)).current;

    const theme = useTheme(); // Get theme from react-native-paper


    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(lightAnim, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
                Animated.timing(lightAnim, {
                    toValue: -1,
                    duration: 0,
                    useNativeDriver: false,
                }),
                Animated.delay(5000),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [lightAnim]);

    const baseColors = ['#eeaeca', '#94bbe9'];
    const highlightColors = [
        'rgba(255,255,255,0)',
        'rgba(255, 255, 255, 0.4)',
        'rgba(255,255,255,0)',
    ];
    const startX = lightAnim;
    const endX = Animated.add(lightAnim, 0.4);

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.shootButtonContainer, style]}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={baseColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 25 }]}
            />
            <AnimatedLinearGradient
                colors={highlightColors}
                start={{ x: startX, y: -0.1 }}
                end={{ x: endX, y: 0 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 25 }]}
            />
            <View style={styles.shootButtonContent}>
                <IconButton
                    icon={icon}
                    size={20}
                    iconColor={theme.colors.background}
                    style={{ margin: 0, marginRight: 4 }}
                />
                <Text style={[styles.shootButtonText, { color: theme.colors.background }]}>{label}</Text>
            </View>
        </TouchableOpacity>
    );
}

/*
  ============================
       3) MAIN LAYOUT WITH HEADER
  ============================
*/
export default function CreateDateLayout({
    step = 1,
    totalSteps = 5,
    hostPhoto,
    hostName,
    hostAge,
    title = 'Create Date',
    subtitle,
    errorComponent,
    canGoBack = false,
    onBack,
    onNext,
    nextLabel = 'Next',
    backLabel = 'Back',
    children,
}) {
    const navigation = useNavigation();
    // Get the theme from Paper instead of from props
    const theme = useTheme();
    // Default back action if no custom onBack is provided
    const handleBack = onBack ? onBack : () => navigation.navigate('MenHome');
    const progress = step / totalSteps;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{title}</Text>
            </View>

            {/* TOP SECTION */}
            <View style={styles.topSection}>
                {subtitle && (
                    <Text variant="bodySmall" style={[styles.subtitle, { color: theme.colors.text }]}>
                        {subtitle}
                    </Text>
                )}
                <View style={{ marginTop: 8 }}>
                    <GradientProgressBar progress={progress} />
                </View>
                {errorComponent}
            </View>

            {/* MIDDLE CARD SECTION */}
            <View style={styles.cardSection}>
                <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
                    <ScrollView contentContainerStyle={styles.cardContent}>
                        {children}
                    </ScrollView>
                </View>
            </View>

            {/* BOTTOM NAVIGATION */}
            <View style={styles.bottomNav}>
                {canGoBack ? (
                    <TouchableOpacity
                        onPress={handleBack}
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
    /* HEADER STYLES */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    backText: {
        marginLeft: 4,
        fontSize: 16,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
    },
    headerPlaceholder: {
        width: 80,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    cardContent: {
        flexGrow: 1, // Allow the ScrollView's content container to grow
        padding: 16,
    },
    /* BOTTOM NAVIGATION */
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
    },
    buttonPlaceholder: {
        width: 120,
        height: 48,
    },
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
    /* SHOOTING LIGHT BUTTON */
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