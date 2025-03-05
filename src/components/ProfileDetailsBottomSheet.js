import React, { useMemo, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    Animated,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { calculateAge } from '../utils/deduceAge';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 60;

// Helper component for fade & slide animations.
const FadeInView = ({ children, delay = 0, style, ...props }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            delay,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim, delay]);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: fadeAnim,
                    transform: [
                        {
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0],
                            }),
                        },
                    ],
                },
            ]}
            {...props}
        >
            {children}
        </Animated.View>
    );
};

// Helper component for scaling animation.
const ScaleInView = ({ children, delay = 0, style, ...props }) => {
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 100,
            delay,
            useNativeDriver: true,
        }).start();
    }, [scaleAnim, delay]);

    return (
        <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]} {...props}>
            {children}
        </Animated.View>
    );
};

const ProfileDetailBottomSheet = ({ selectedProfile, onClose }) => {
    const { colors } = useTheme();
    const sheetRef = useRef(null);
    const snapPoints = useMemo(() => ['100%'], []);

    // Compute the age using the calculateAge function
    const age = useMemo(() => calculateAge(selectedProfile.birthday), [selectedProfile.birthday]);

    return (
        <BottomSheet
            ref={sheetRef}
            index={0}
            snapPoints={snapPoints}
            onClose={onClose}
            enablePanDownToClose={true}
            backgroundStyle={{ backgroundColor: colors.tertiary }}
            handleIndicatorStyle={styles.handleIndicator}
        >
            <BottomSheetScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { minHeight: SCREEN_HEIGHT - HEADER_HEIGHT - 60, backgroundColor: colors.tertiary },
                ]}
            >
                {/* Custom Header */}
                <FadeInView delay={0}>
                    <View style={styles.customHeader}>
                        <TouchableOpacity onPress={onClose} style={styles.headerIcon}>
                            <Ionicons name="chevron-down" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            {/* Scale animation for the header title */}
                            <ScaleInView delay={300}>
                                <Text style={[styles.headerTitle, { color: colors.text }]}>
                                    {selectedProfile.firstName}
                                </Text>
                            </ScaleInView>
                        </View>
                        <View style={styles.headerIcon}>
                            <Text style={styles.flagPlaceholder}>🏳️</Text>
                        </View>
                    </View>
                </FadeInView>

                {/* Profile Image */}
                <FadeInView delay={200}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: selectedProfile.photos[0] }}
                            style={styles.profileImage}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                        />
                    </View>
                </FadeInView>

                {/* About Section */}
                <FadeInView delay={400}>
                    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            About {selectedProfile.firstName}
                        </Text>
                        <Text style={[styles.sectionText, { color: colors.secondary }]}>
                            {selectedProfile.bio}
                        </Text>
                    </View>
                </FadeInView>

                {/* Highlight Image if available */}
                {selectedProfile.photos && selectedProfile.photos.length > 1 && (
                    <FadeInView delay={600}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: selectedProfile.photos[1] }}
                                style={styles.highlightImage}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />
                        </View>
                    </FadeInView>
                )}

                {/* Basic Info Section */}
                <FadeInView delay={800}>
                    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Info</Text>
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: colors.text }]}>Age:</Text>
                            <Text style={[styles.value, { color: colors.secondary }]}>{age}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: colors.text }]}>Location:</Text>
                            <Text style={[styles.value, { color: colors.secondary }]}>
                                {selectedProfile.city}, {selectedProfile.country}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: colors.text }]}>Height:</Text>
                            <Text style={[styles.value, { color: colors.secondary }]}>{selectedProfile.height} cm</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: colors.text }]}>Income:</Text>
                            <Text style={[styles.value, { color: colors.secondary }]}>{selectedProfile.income}</Text>
                        </View>
                    </View>
                </FadeInView>

                {/* Interests as Pills */}
                <FadeInView delay={1000}>
                    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Interests</Text>
                        <View style={styles.pillsContainer}>
                            {selectedProfile.interests?.map((interest, idx) => (
                                <View key={idx} style={[styles.pill, { backgroundColor: colors.primary }]}>
                                    <Text style={[styles.pillText, { color: colors.background }]}>{interest}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </FadeInView>

                {/* Additional Photo if available */}
                {selectedProfile.photos && selectedProfile.photos.length > 2 && (
                    <FadeInView delay={1200}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: selectedProfile.photos[2] }}
                                style={styles.highlightImage}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />
                        </View>
                    </FadeInView>
                )}

                {/* Lifestyle Section */}
                <FadeInView delay={1400}>
                    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Lifestyle</Text>
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: colors.text }]}>Diet:</Text>
                            <Text style={[styles.value, { color: colors.secondary }]}>{selectedProfile.lifestyle?.dietaryPreferences}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: colors.text }]}>Drinking:</Text>
                            <Text style={[styles.value, { color: colors.secondary }]}>{selectedProfile.lifestyle?.drinking}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: colors.text }]}>Exercise:</Text>
                            <Text style={[styles.value, { color: colors.secondary }]}>{selectedProfile.lifestyle?.exercise}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: colors.text }]}>Smoking:</Text>
                            <Text style={[styles.value, { color: colors.secondary }]}>{selectedProfile.lifestyle?.smoking}</Text>
                        </View>
                    </View>
                </FadeInView>

                {/* Personality Section */}
                <FadeInView delay={1600}>
                    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Personality</Text>
                        <View style={styles.pillsContainer}>
                            {selectedProfile.personalityTraits?.map((trait, idx) => (
                                <View key={idx} style={[styles.pill, { backgroundColor: '#4caf50' }]}>
                                    <Text style={[styles.pillText, { color: '#fff' }]}>{trait}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </FadeInView>

                {/* Additional Photo if available */}
                {selectedProfile.photos && selectedProfile.photos.length > 3 && (
                    <FadeInView delay={1800}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: selectedProfile.photos[3] }}
                                style={styles.highlightImage}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />
                        </View>
                    </FadeInView>
                )}

                {/* Languages Section */}
                <FadeInView delay={2000}>
                    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Languages</Text>
                        <View style={styles.pillsContainer}>
                            {selectedProfile.spokenLanguages?.map((lang, idx) => (
                                <View key={idx} style={[styles.pill, { backgroundColor: colors.secondary }]}>
                                    <Text style={[styles.pillText, { color: colors.onSecondary }]}>{lang}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </FadeInView>

                {/* Date Styles Section */}
                <FadeInView delay={2200}>
                    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Date Styles</Text>
                        <View style={styles.pillsContainer}>
                            {selectedProfile.preferredDateStyles?.map((style, idx) => (
                                <View key={idx} style={[styles.pill, { backgroundColor: '#ff9800' }]}>
                                    <Text style={[styles.pillText, { color: colors.background }]}>{style}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </FadeInView>

                {/* Additional Photo if available */}
                {selectedProfile.photos && selectedProfile.photos.length > 4 && (
                    <FadeInView delay={2400}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: selectedProfile.photos[4] }}
                                style={styles.highlightImage}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />
                        </View>
                    </FadeInView>
                )}
            </BottomSheetScrollView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    handleIndicator: {
        backgroundColor: '#ccc',
    },
    customHeader: {
        height: HEADER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    headerIcon: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    flagPlaceholder: {
        fontSize: 24,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 8,
    },
    highlightImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 8,
    },
    section: {
        marginBottom: 20,
        borderRadius: 20,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 16,
        lineHeight: 22,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 6,
    },
    value: {
        fontSize: 16,
    },
    pillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    pillText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ProfileDetailBottomSheet;