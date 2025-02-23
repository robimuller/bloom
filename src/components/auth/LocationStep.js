import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Animated,
    TouchableOpacity,
    Alert,
} from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentLocation } from '../../utils/locationServices';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

const RadialWave = ({ size, color, delay = 0, duration = 2000 }) => {
    const waveAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(waveAnim, {
                    toValue: 1,
                    duration: duration,
                    useNativeDriver: true,
                }),
                Animated.timing(waveAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
    }, [waveAnim, delay, duration]);

    const scale = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2.5],
    });
    const opacity = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.7, 0],
    });
    return (
        <Animated.View
            style={{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                transform: [{ scale }],
                opacity,
            }}
        />
    );
};

const CustomSwitch = ({ isOn, colors }) => {
    return (
        <View
            style={[
                switchStyles.switchContainer,
                { backgroundColor: isOn ? "#00ffA0" : '#ccc' },
            ]}
        >
            <Animated.View
                style={[
                    switchStyles.switchCircle,
                    {
                        alignSelf: isOn ? 'flex-end' : 'flex-start',
                        backgroundColor: colors.background,
                    },
                ]}
            />
        </View>
    );
};

const LocationStep = ({
    profileInfo,
    setProfileInfo,     // renamed from updateProfileInfo
    permissions,
    setPermissions,     // renamed from updatePermissions
    colors,
    onNext,
}) => {
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDebouncing, setIsDebouncing] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const requestLocation = async () => {
        setLoadingLocation(true);
        try {
            const locationData = await getCurrentLocation();
            setProfileInfo({
                ...profileInfo,
                city: locationData.city,
                state: locationData.state,
                country: locationData.country,
                coordinates: locationData.coordinates,
            });
            setPermissions({ ...permissions, location: true });
            setErrorMessage('');
            Toast.show({
                type: 'success',
                text1: 'Location Enabled',
                text2: 'We found your location successfully!',
            });
        } catch (error) {
            console.error('Error getting location:', error);
            setPermissions({ ...permissions, location: false });
            setErrorMessage(error.message);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message,
            });
            if (error.message.includes('denied')) {
                Alert.alert(
                    'Location Permission',
                    'Location permission is denied. Please enable it in settings to find nearby matches.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ],
                    { cancelable: true }
                );
            }
            // Debounce further requests for 4 seconds
            setIsDebouncing(true);
            setTimeout(() => setIsDebouncing(false), 4000);
        }
        setLoadingLocation(false);
    };

    const handleAllowPress = () => {
        if (isDebouncing || loadingLocation) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            requestLocation();
        });
    };

    const handleSwitchToggle = () => {
        if (loadingLocation || isDebouncing) return;
        if (permissions.location) {
            // Turn off location
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setPermissions({ ...permissions, location: false });
            Toast.show({
                type: 'info',
                text1: 'Location Disabled',
                text2: 'Location services have been turned off.',
            });
        } else {
            // Turn on location (request it)
            handleAllowPress();
        }
    };

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.panel,
                    { backgroundColor: colors.background, borderColor: colors.border },
                ]}
            >
                <View style={styles.iconWrapper}>
                    {/* Radial wave animation for a searching effect */}
                    <RadialWave size={120} color={colors.primary} delay={0} duration={2000} />
                    <RadialWave size={120} color={colors.primary} delay={1000} duration={2000} />
                    <View
                        style={[
                            styles.circleBackground,
                            { backgroundColor: colors.primary, opacity: 0.7 },
                        ]}
                    />
                    <Animated.View
                        style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}
                    >
                        <Ionicons name="location-sharp" size={80} color={colors.background} />
                    </Animated.View>
                </View>
                <Text
                    style={[styles.headerText, { color: colors.primary }]}
                    accessible
                    accessibilityRole="header"
                >
                    Enable Location
                </Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    Allow access to your location so you can find matches near you. Your location is used solely for finding nearby profiles.
                </Text>
                <TouchableOpacity onPress={handleSwitchToggle} activeOpacity={0.8}>
                    <CustomSwitch isOn={permissions.location} colors={colors} />
                </TouchableOpacity>
                {loadingLocation && (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
                )}
                {errorMessage ? (
                    <Text style={[styles.errorText, { color: colors.error, marginTop: 12, textAlign: 'center' }]}>
                        {errorMessage}
                    </Text>
                ) : null}
            </View>
        </View>
    );
};

const switchStyles = StyleSheet.create({
    switchContainer: {
        width: 50,
        height: 30,
        borderRadius: 15,
        padding: 2,
        marginVertical: 16,
        justifyContent: 'center',
    },
    switchCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        marginTop: 50,
    },
    panel: {
        width: '90%',
        padding: 24,
        alignItems: 'center',
    },
    iconWrapper: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    circleBackground: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 22,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    errorText: {
        fontSize: 14,
        marginTop: 8,
    },
});

export default LocationStep;