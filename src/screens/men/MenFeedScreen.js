// src/screens/men/MenFeedScreen.js

import React, { useState, useRef, useContext } from 'react';
import {
    View,
    FlatList,
    Alert,
    StyleSheet,
    Text,
    Dimensions,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { useTheme, Button, Checkbox } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import Animated, {
    useSharedValue,
    withTiming,
    Easing,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    runOnJS,
} from 'react-native-reanimated';
import { calculateAge } from '../../utils/deduceAge'; // Adjust the path as necessary

import { ProfilesContext } from '../../contexts/ProfilesContext';
// If you have a context for invites, import it here
// import { InvitesContext } from '../../contexts/InvitesContext'; 

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// If you want report reasons for user profiles
const REPORT_OPTIONS = [
    'Harassment',
    'Fake Profile',
    'Spam',
    'Inappropriate content',
];

// Number of tiny hearts to explode
const HEART_COUNT = 6;

export default function MenFeedScreen({ onScroll }) {
    const { womenProfiles, loadingWomen } = useContext(ProfilesContext);
    const { colors } = useTheme();

    // Optional: If you have a custom “invite” function from context
    // const { sendInvite, cancelInvite, invites } = useContext(InvitesContext);

    // For demonstration, we’ll store a dummy “requested” list
    const [requestedIds, setRequestedIds] = useState([]);

    // Report modal state
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportTargetUser, setReportTargetUser] = useState(null);
    const [reportReasons, setReportReasons] = useState([]);

    const handleInvitePress = async (userId) => {
        // Example: toggling “requested” state for demonstration
        // Real app: use your “invite” context function or similar
        setRequestedIds((prev) => [...prev, userId]);
        // If you have invites logic:
        // await sendInvite(userId);
    };

    const handleCancelInvite = async (userId) => {
        setRequestedIds((prev) => prev.filter((id) => id !== userId));
        // If you have invites logic:
        // await cancelInvite(userId);
    };

    // For the “flag” icon if you want to let men report user
    const handleFlagPress = (profile) => {
        setReportTargetUser(profile);
        setReportReasons([]);
        setReportModalVisible(true);
    };

    const handleSubmitReport = () => {
        if (!reportTargetUser) return;
        if (reportReasons.length === 0) {
            Alert.alert('Select a reason', 'Please choose at least one reason.');
            return;
        }
        // Submit to Firestore or your backend
        // e.g. reportUser({ userId: reportTargetUser.id, reasons: reportReasons });
        Alert.alert('Report Submitted', 'Thank you for your feedback.');
        setReportModalVisible(false);
    };

    const toggleReason = (reason) => {
        setReportReasons((prev) => {
            if (prev.includes(reason)) {
                return prev.filter((r) => r !== reason);
            }
            return [...prev, reason];
        });
    };

    // If still loading, show a loader
    if (loadingWomen) {
        return (
            <Text style={{ textAlign: 'center', marginTop: 20, color: colors.text }}>
                Loading profiles...
            </Text>
        );
    }

    // If no profiles
    if (!womenProfiles || womenProfiles.length === 0) {
        return (
            <Text style={{ textAlign: 'center', marginTop: 20, color: colors.text }}>
                No profiles available at the moment.
            </Text>
        );
    }

    const renderItem = ({ item }) => {
        // Calculate age using the utility function
        const age = calculateAge(item.birthday); // Ensure 'birthday' field exists in your data

        // Check if this user is “requested” by seeing if their ID is in requestedIds
        const isRequested = requestedIds.includes(item.id);

        return (
            <View style={[styles.cardContainer, { backgroundColor: colors.overlay }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Image
                        source={
                            item.photos && item.photos[0]
                                ? { uri: item.photos[0] }
                                : require('../../../assets/avatar-placeholder.png')
                        }
                        style={styles.profilePic}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.hostName, { color: colors.text }]}>
                            {item.displayName || 'Unknown'}
                            {age ? `, ${age}` : ''}
                        </Text>
                    </View>
                    {/* Flag icon to report user (optional) */}
                    <TouchableOpacity onPress={() => handleFlagPress(item)}>
                        <Ionicons
                            name="flag-outline"
                            size={20}
                            color={colors.onSurface ?? '#666'}
                            style={{ marginRight: 8 }}
                        />
                    </TouchableOpacity>
                </View>

                {/* Carousel of user photos */}
                <Carousel
                    photos={item.photos || []}
                    userId={item.id}
                    isRequested={isRequested}
                    onInvitePress={handleInvitePress}
                    onCancelInvite={handleCancelInvite}
                />

                {/* Bio placed below the carousel */}
                {item.bio && (
                    <Text style={{ color: colors.text, fontSize: 13, opacity: 0.7, marginTop: 8 }}>
                        {item.bio}
                    </Text>
                )}

                {/* Footer (example: location or orientation) */}
                <View style={styles.footer}>
                    {/* If your user docs have a location field */}
                    {item.location && (
                        <View style={styles.footerRow}>
                            <Text style={[styles.location, { color: colors.secondary }]}>
                                {item.location}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={womenProfiles}
                keyExtractor={(profile) => profile.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                onScroll={(e) => {
                    if (onScroll) {
                        onScroll(e);
                    }
                }}
                scrollEventThrottle={16}
            />

            {/* REPORT MODAL (optional) */}
            <Modal
                animationType="fade"
                transparent
                visible={reportModalVisible}
                onRequestClose={() => setReportModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPressOut={() => setReportModalVisible(false)}
                >
                    <TouchableOpacity
                        style={[styles.modalContainer, { backgroundColor: colors.background }]}
                        activeOpacity={1}
                        onPress={() => { }}
                    >
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {`Report ${reportTargetUser?.displayName || 'User'}?`}
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: colors.secondary }]}>
                            Choose the reason(s) for your report:
                        </Text>

                        {REPORT_OPTIONS.map((reason) => (
                            <View key={reason} style={styles.checkboxRow}>
                                <Checkbox.Android
                                    status={reportReasons.includes(reason) ? 'checked' : 'unchecked'}
                                    onPress={() => toggleReason(reason)}
                                    color={colors.primary}
                                    uncheckedColor={colors.outline}
                                />
                                <Text style={{ color: colors.text }}>{reason}</Text>
                            </View>
                        ))}

                        <View style={{ alignItems: 'center', marginVertical: 16 }}>
                            <Button
                                mode="contained"
                                onPress={handleSubmitReport}
                                style={styles.reportButton}
                                textColor={colors.onPrimary}
                            >
                                Report
                            </Button>
                        </View>

                        <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                            <Text style={[styles.cancelText, { color: colors.primary }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

/** Carousel component, similar to WomenFeedScreen */
function Carousel({ photos, userId, isRequested, onInvitePress, onCancelInvite }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const { colors } = useTheme();

    const onScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (SCREEN_WIDTH * 0.85));
        setCurrentIndex(index);
    };

    return (
        <View style={styles.carouselWrapper}>
            <FlatList
                data={photos}
                keyExtractor={(uri, idx) => `${uri}-${idx}`}
                ref={flatListRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                renderItem={({ item }) => (
                    <Image
                        source={{ uri: item }}
                        style={styles.carouselImage}
                    />
                )}
            />
            <View style={[styles.overlayTopRight, { backgroundColor: colors.overlay }]}>
                <Text style={[styles.indexText, { color: colors.onBackground }]}>
                    {currentIndex + 1}/{photos.length}
                </Text>
            </View>

            {/* Heart Circle Button + Explosion */}
            <View style={styles.overlayBottomRight}>
                <HeartCircleButton
                    userId={userId}
                    isRequested={isRequested}
                    onInvitePress={onInvitePress}
                    onCancelInvite={onCancelInvite}
                />
            </View>
        </View>
    );
}

/** A heart button with a Reanimated explosion, just like WomenFeedScreen */
function HeartCircleButton({ userId, isRequested, onInvitePress, onCancelInvite }) {
    const { colors } = useTheme();
    const [exploding, setExploding] = useState(false);
    const progress = useSharedValue(0);

    const handlePress = async () => {
        try {
            if (!isRequested) {
                // Invite
                onInvitePress(userId);
                // Trigger explosion
                setExploding(true);
                progress.value = withTiming(
                    1,
                    { duration: 800, easing: Easing.ease },
                    (isFinished) => {
                        if (isFinished) {
                            runOnJS(setExploding)(false);
                            progress.value = 0;
                        }
                    }
                );
            } else {
                // Cancel invite
                onCancelInvite(userId);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
            console.error('HeartCircleButton error:', error);
        }
    };

    const iconName = isRequested ? 'mail-open' : 'mail';

    return (
        <View>
            <TouchableOpacity
                style={[styles.heartButton, { backgroundColor: colors.background }]}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <Ionicons name={iconName} size={24} color={colors.primary} />
            </TouchableOpacity>
            {exploding && <HeartsExplosion progress={progress} />}
        </View>
    );
}

function HeartsExplosion({ progress }) {
    const hearts = Array.from({ length: HEART_COUNT }, (_, i) => ({
        key: i,
        angle: (Math.random() * 2 - 1) * Math.PI * 0.6,
        distance: 60 + Math.random() * 40,
        scale: 0.5 + Math.random() * 0.8,
    }));

    return (
        <View style={styles.heartsContainer}>
            {hearts.map((heart) => (
                <FloatingHeart
                    key={heart.key}
                    progress={progress}
                    angle={heart.angle}
                    distance={heart.distance}
                    scale={heart.scale}
                />
            ))}
        </View>
    );
}

function FloatingHeart({ progress, angle, distance, scale }) {
    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            progress.value,
            [0, 0.05, 1],
            [0, 1, 0],
            Extrapolate.CLAMP
        );
        const x = interpolate(
            progress.value,
            [0, 1],
            [0, distance * Math.cos(angle)]
        );
        const y = interpolate(
            progress.value,
            [0, 1],
            [0, -distance * Math.sin(angle)]
        );
        const _scale = interpolate(progress.value, [0, 1], [scale, scale * 0.8]);

        return {
            transform: [{ translateX: x }, { translateY: y }, { scale: _scale }],
            opacity,
        };
    });

    return (
        <Animated.View style={[styles.floatingHeart, animatedStyle]}>
            <Ionicons name="heart" size={18} color="#ff5c5c" />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    //----------------------------------
    // Card Container
    //----------------------------------
    cardContainer: {
        marginHorizontal: 2,
        borderRadius: 20,
        overflow: 'hidden',
        paddingHorizontal: 25,
        paddingBottom: 12,
        marginTop: 16,
        flex: 1,
    },
    //----------------------------------
    // Header
    //----------------------------------
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
    },
    profilePic: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    hostName: {
        fontWeight: '600',
        fontSize: 16,
    },
    //----------------------------------
    // Carousel
    //----------------------------------
    carouselWrapper: {
        position: 'relative',
        width: SCREEN_WIDTH * 0.85,
        height: SCREEN_WIDTH * 0.85,
        borderRadius: 16,
        alignSelf: 'center',
        overflow: 'hidden',
        marginBottom: 12,
    },
    carouselImage: {
        width: SCREEN_WIDTH * 0.85,
        height: SCREEN_WIDTH * 0.85,
        resizeMode: 'cover',
    },
    overlayTopRight: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 10,
        paddingVertical: 1,
        borderRadius: 12,
    },
    indexText: {
        fontSize: 10,
        fontWeight: '300',
    },
    //----------------------------------
    // Heart Button (bottom-right)
    //----------------------------------
    overlayBottomRight: {
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    heartButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    //----------------------------------
    // Hearts explosion
    //----------------------------------
    heartsContainer: {
        position: 'absolute',
        bottom: 22,
        right: 22,
        width: 0,
        height: 0,
    },
    floatingHeart: {
        position: 'absolute',
    },
    //----------------------------------
    // Footer
    //----------------------------------
    footer: {
        marginTop: 8,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    location: {
        fontSize: 14,
    },
    //----------------------------------
    // Modal
    //----------------------------------
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    reportButton: {
        width: '60%',
        borderRadius: 20,
    },
    cancelText: {
        textAlign: 'center',
        marginTop: 8,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});