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
import { LinearGradient } from 'expo-linear-gradient';
import { calculateAge } from '../../utils/deduceAge';
import { ProfilesContext } from '../../contexts/ProfilesContext';
import CarouselItem from '../../components/CarouselItem';
import { useUserStatus } from '../../hooks/useUserStatus'; // Import your hook
import ProfileHeader from '../../components/ProfileHeader'

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Define fixed dimensions for each card to match the women feed.
const CARD_HEIGHT = 550;
const CARD_SPACING = 16;

// Create an animated version of FlatList for vertical scrolling
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Report options (if you want to allow men to report profiles)
const REPORT_OPTIONS = [
    'Harassment',
    'Fake Profile',
    'Spam',
    'Inappropriate content',
];

// Number of hearts to show when a heart explosion is triggered
const HEART_COUNT = 6;

export default function MenFeedScreen({ onScroll }) {
    const { womenProfiles, loadingWomen } = useContext(ProfilesContext);
    const { colors } = useTheme();

    // For demonstration purposes we track “requested” profiles by ID.
    const [requestedIds, setRequestedIds] = useState([]);

    // State for report modal
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportTargetUser, setReportTargetUser] = useState(null);
    const [reportReasons, setReportReasons] = useState([]);

    const handleInvitePress = async (userId) => {
        // Example: add the userId to the requested list.
        setRequestedIds((prev) => [...prev, userId]);
    };

    const handleCancelInvite = async (userId) => {
        setRequestedIds((prev) => prev.filter((id) => id !== userId));
    };

    // When the flag icon is pressed, open the report modal.
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
        // Submit the report (for demo, simply show an alert)
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

    // If still loading or no profiles are available, show a message.
    if (loadingWomen) {
        return (
            <View style={{ height: CARD_HEIGHT + CARD_SPACING, justifyContent: 'center' }}>
                <Text style={{ textAlign: 'center', color: colors.text }}>Loading profiles...</Text>
            </View>
        );
    }

    if (!womenProfiles || womenProfiles.length === 0) {
        return (
            <View style={{ height: CARD_HEIGHT + CARD_SPACING, justifyContent: 'center' }}>
                <Text style={{ textAlign: 'center', color: colors.text }}>
                    No profiles available at the moment.
                </Text>
            </View>
        );
    }

    // Each card is rendered with a fixed height and similar structure to the women feed.
    const renderItem = ({ item }) => {
        const isRequested = requestedIds.includes(item.id);

        return (
            <View style={[styles.cardContainer, { backgroundColor: colors.cardBackground }]}>
                {/* Header with online indicator */}
                <ProfileHeader item={item} onFlagPress={handleFlagPress} colors={colors} />
                {/* Carousel of user photos */}
                <Carousel
                    photos={item.photos || []}
                    userId={item.id}
                    isRequested={isRequested}
                    onInvitePress={handleInvitePress}
                    onCancelInvite={handleCancelInvite}
                />

                {/* Bio */}
                {item.bio && (
                    <Text style={{ color: colors.text, fontSize: 13, opacity: 0.7, marginTop: 8 }}>
                        {item.bio}
                    </Text>
                )}

                {/* Footer (e.g. location) */}
                <View style={styles.footer}>
                    {item.location && (
                        <View style={styles.footerRow}>
                            <Text style={[styles.location, { color: colors.secondary }]}>{item.location}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={{ height: CARD_HEIGHT + CARD_SPACING }}>
            <AnimatedFlatList
                data={womenProfiles}
                keyExtractor={(profile) => profile.id}
                renderItem={renderItem}
                pagingEnabled
                decelerationRate="fast"
                snapToAlignment="start"
                contentContainerStyle={{ paddingBottom: 20 }}
                onScroll={onScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            />

            {/* Report Modal */}
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
                            <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

/** Carousel component (for user photos) **/
function Carousel({ photos, userId, isRequested, onInvitePress, onCancelInvite }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const { colors } = useTheme();

    const onScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (SCREEN_WIDTH * 0.85));
        setCurrentIndex(index);
    };

    // Ensure you only pass valid photo URLs to the carousel.
    const validPhotos = (photos || []).filter(photo => !!photo);

    return (
        <View style={styles.carouselWrapper}>
            <FlatList
                data={validPhotos.length > 0 ? validPhotos : [require('../../../assets/avatar-placeholder.png')]}
                keyExtractor={(uri, idx) => `${uri}-${idx}`}
                ref={flatListRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEnabled={photos.length > 1}
                renderItem={({ item }) => (
                    <Image source={typeof item === 'string' ? { uri: item } : item} style={styles.carouselImage} />
                )}
            />
            {/* Gradient on the right */}
            <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0)']}
                start={{ x: 1, y: 0.5 }}
                end={{ x: 0, y: 0.5 }}
                style={styles.gradientBar}
                pointerEvents="none"
            />
            <View style={[styles.overlayTopRight, { backgroundColor: colors.overlay }]}>
                <Text style={[styles.indexText, { color: colors.onBackground }]}>
                    {currentIndex + 1}/{validPhotos.length}
                </Text>
            </View>
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

/** Heart button with an explosion animation **/
function HeartCircleButton({ userId, isRequested, onInvitePress, onCancelInvite }) {
    const { colors } = useTheme();
    const [exploding, setExploding] = useState(false);
    const progress = useSharedValue(0);

    const handlePress = async () => {
        try {
            if (!isRequested) {
                // Invite the user and trigger the explosion
                onInvitePress(userId);
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
                // Cancel the invite
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

/** Hearts explosion animation **/
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

/** A single floating heart **/
function FloatingHeart({ progress, angle, distance, scale }) {
    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            progress.value,
            [0, 0.05, 1],
            [0, 1, 0],
            Extrapolate.CLAMP
        );
        const x = interpolate(progress.value, [0, 1], [0, distance * Math.cos(angle)]);
        const y = interpolate(progress.value, [0, 1], [0, -distance * Math.sin(angle)]);
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
        height: CARD_HEIGHT,
        marginHorizontal: 2,
        borderRadius: 20,
        overflow: 'hidden',
        paddingHorizontal: 25,
        paddingBottom: 12,
        marginTop: CARD_SPACING,
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
    onlineIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'green',
        borderWidth: 2,
        borderColor: '#fff',
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
    gradientBar: {
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        width: 65,
        zIndex: 1,
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
        paddingHorizontal: 10,
        paddingVertical: 1,
        borderRadius: 12,
        zIndex: 2,
    },
    indexText: {
        fontSize: 10,
        fontWeight: '300',
    },
    overlayBottomRight: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        zIndex: 2,
    },
    //----------------------------------
    // Heart Button and Explosion
    //----------------------------------
    heartButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heartsContainer: {
        position: 'absolute',
        bottom: 22,
        right: 22,
        width: 0,
        height: 0,
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
    // Modal Styles
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