// src/screens/WomenFeedScreen.jsx
import React, { useContext, useState, useRef, useEffect } from 'react';
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
import { useTheme, Checkbox, Button } from 'react-native-paper';
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
import { AuthContext } from '../../contexts/AuthContext';
import { DatesContext } from '../../contexts/DatesContext';
import { RequestsContext } from '../../contexts/RequestsContext';
import { getDateCategory } from '../../utils/dateCategory';
import { calculateAge } from '../../utils/deduceAge';
import LoadingDates from '../../components/LoadingDates';
import RevealAnimation from '../../components/RevealAnimation';
import ExtraActionButtons from '../../components/ExtraActionButtons';
import { LinearGradient } from 'expo-linear-gradient';



const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Possible reasons for reporting:
const REPORT_OPTIONS = [
    'Harassment',
    'Fake Profile',
    'Spam',
    'Sexually explicit content',
    'Inappropriate date content',
];

// Number of tiny hearts to explode
const HEART_COUNT = 6;

const CARD_HEIGHT = 500; // Adjust as needed.
const CARD_SPACING = 16;

// Create an Animated version of FlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function WomenFeedScreen({ selectedCategory, onScroll }) {
    const { user } = useContext(AuthContext);
    const { dates, loadingDates, fetchDiscoverDates, fetchTrendingDates, fetchLatestDates } = useContext(DatesContext);
    const { sendRequest, cancelRequest, requests } = useContext(RequestsContext);
    const { colors } = useTheme();

    // State for the report modal
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportTargetItem, setReportTargetItem] = useState(null);
    const [reportReasons, setReportReasons] = useState([]);

    // When the selected category changes, re-run the appropriate query.
    useEffect(() => {
        let unsubscribe;
        if (selectedCategory === 'trending') {
            unsubscribe = fetchTrendingDates();
        } else if (selectedCategory === 'latest') {
            unsubscribe = fetchLatestDates();
        } else {
            unsubscribe = fetchDiscoverDates();
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [selectedCategory]);

    // Fired when user taps the heart to create a request
    const handleSendRequest = async (dateId, hostId) => {
        try {
            await sendRequest({ dateId, hostId });
        } catch (error) {
            console.error('Error requesting date:', error);
            Alert.alert('Error', 'Could not send request. Please try again.');
        }
    };

    // Fired when user taps the heart-dislike to cancel an existing request
    const handleCancelRequest = async (requestId) => {
        try {
            await cancelRequest(requestId);
            Alert.alert('Request Canceled', 'Your request has been canceled.');
        } catch (error) {
            console.error('Error canceling request:', error);
            Alert.alert('Error', 'Could not cancel request. Please try again.');
        }
    };

    // Called when the user taps the flag icon
    const handleFlagPress = (item) => {
        setReportTargetItem(item);
        setReportReasons([]); // reset any previously selected reasons
        setReportModalVisible(true);
    };

    // Submits the report to Firestore
    const handleSubmitReport = async () => {
        if (!reportTargetItem) return;
        if (reportReasons.length === 0) {
            Alert.alert('Select a reason', 'Please choose at least one reason.');
            return;
        }

        const { id: dateId, hostId } = reportTargetItem;
        const reporterId = user?.uid; // Use the currently logged-in user’s ID

        if (!reporterId) {
            Alert.alert('Not Logged In', 'You must be logged in to report a date.');
            return;
        }

        try {
            await reportDate({
                dateId,
                hostId,
                reporterId,
                reasons: reportReasons,
            });
            Alert.alert('Report Submitted', 'Thank you for your feedback.');
        } catch (error) {
            Alert.alert('Error', 'Could not submit report. Please try again.');
            console.error('Report error:', error);
        } finally {
            setReportModalVisible(false);
        }
    };

    // Toggles a reason on/off from the selected array
    const toggleReason = (reason) => {
        setReportReasons((prev) => {
            if (prev.includes(reason)) {
                // remove it
                return prev.filter((r) => r !== reason);
            } else {
                // add it
                return [...prev, reason];
            }
        });
    };

    const renderItem = ({ item, index }) => {
        const dateId = item.id;
        const hostId = item.hostId;
        const dateCategory = getDateCategory(item.date || '');
        // Check if there's already a request for this date (and still 'pending')
        const existingRequest = requests.find(
            (r) =>
                r.dateId === dateId &&
                r.hostId === hostId &&
                r.status === 'pending'
        );

        // Calculate the host's age based on the birthday field
        const age = calculateAge(item.host?.birthday);

        return (
            <RevealAnimation index={index}>
                <View style={[styles.cardContainer, { backgroundColor: colors.cardBackground }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Image
                            source={
                                item.host?.photos?.[0]
                                    ? { uri: item.host.photos[0] }
                                    : require('../../../assets/avatar-placeholder.png')
                            }
                            style={styles.profilePic}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.hostName, { color: colors.text }]}>
                                {item.host?.displayName || 'Unknown'}
                                {age !== null ? `, ${age}` : ''}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => handleFlagPress(item)}>
                            <Ionicons
                                name="flag-outline"
                                size={20}
                                color={colors.onSurface ?? '#666'}
                                style={{ marginRight: 8 }}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Carousel */}
                    <Carousel
                        photos={item.photos || []}
                        dateId={dateId}
                        hostId={hostId}
                        onSendRequest={handleSendRequest}
                        onCancelRequest={handleCancelRequest}
                        existingRequest={existingRequest}
                    />

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.dateTitle, { color: colors.text }]}>{item.title}</Text>
                        <View style={styles.footerRow}>
                            <Text style={[styles.location, { color: colors.secondary }]}>{item.location}</Text>
                            <Text style={[styles.dateCategory, { color: colors.onSurface }]}>{dateCategory}</Text>
                        </View>
                    </View>
                </View>
            </RevealAnimation>
        );
    };

    return (
        <View style={{ height: CARD_HEIGHT + CARD_SPACING }}>
            {loadingDates ? (
                <LoadingDates />
            ) : (
                <AnimatedFlatList
                    data={dates}
                    keyExtractor={(date) => date.id}
                    renderItem={renderItem}
                    pagingEnabled               // This makes sure one page (card) is shown at a time
                    decelerationRate="fast"
                    snapToAlignment="start"
                    contentContainerStyle={{ paddingBottom: 20 }}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                />
            )}
            {/* REPORT MODAL */}
            <Modal
                animationType="fade"
                transparent
                visible={reportModalVisible}
                onRequestClose={() => setReportModalVisible(false)}
            >
                {/* Outer touchable: if the user taps here, close the modal */}
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPressOut={() => setReportModalVisible(false)}
                >
                    {/* Inner touchable: tapping inside the modal content does nothing */}
                    <TouchableOpacity
                        style={[styles.modalContainer, { backgroundColor: colors.background }]}
                        activeOpacity={1}
                        onPress={() => { }}
                    >
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {`Report ${reportTargetItem?.host?.displayName || 'User'}?`}
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: colors.secondary }]}>
                            Choose the reason(s) for your report from the list of options provided:
                        </Text>

                        {REPORT_OPTIONS.map((reason) => (
                            <View key={reason} style={styles.checkboxRow}>
                                <Checkbox.Android
                                    status={reportReasons.includes(reason) ? 'checked' : 'unchecked'}
                                    onPress={() => toggleReason(reason)}
                                    color={colors.primary}
                                    uncheckedColor={colors.outline}
                                />
                                <Text style={[styles.checkboxLabel, { color: colors.text }]}>{reason}</Text>
                            </View>
                        ))}

                        <View style={styles.buttonRow}>
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
                                No, back to profile
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

function Carousel({
    photos,
    dateId,
    hostId,
    onSendRequest,
    onCancelRequest,
    existingRequest,
}) {
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
            {/* Add the gradient overlay behind the action buttons */}
            <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={styles.gradientOverlay}
                pointerEvents="none"  // Ensure touches pass through to underlying buttons.
            />

            <View style={[styles.overlayTopRight, { backgroundColor: colors.background }]}>
                <Text style={[styles.indexText, { color: colors.onBackground }]}>
                    {currentIndex + 1}/{photos.length}
                </Text>
            </View>

            {/* Vertical stack of extra action buttons and the heart button */}
            <View style={styles.overlayBottomRight}>
                {/* Extra actions (Message, Bookmark, Share) */}
                <ExtraActionButtons />
                {/* Heart Circle Button remains as is */}
                <HeartCircleButton
                    dateId={dateId}
                    hostId={hostId}
                    existingRequest={existingRequest}
                    onSendRequest={onSendRequest}
                    onCancelRequest={onCancelRequest}
                />
            </View>
        </View>
    );
}

/**
 * A circular heart button that toggles between:
 *   - "heart" (not yet requested => send request)
 *   - "heart-dislike" (request pending => can cancel request)
 * With a Reanimated "heart explosion" on send.
 */
function HeartCircleButton({
    dateId,
    hostId,
    existingRequest,
    onSendRequest,
    onCancelRequest,
}) {
    const { colors } = useTheme();
    const [requested, setRequested] = useState(!!existingRequest);
    const [exploding, setExploding] = useState(false);
    const progress = useSharedValue(0);

    React.useEffect(() => {
        setRequested(!!existingRequest);
    }, [existingRequest]);

    const send = async () => {
        try {
            await onSendRequest(dateId, hostId);
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
        } catch (error) {
            console.error('Error sending request:', error);
        }
    };

    const cancel = async (requestId) => {
        try {
            await onCancelRequest(requestId);
        } catch (error) {
            console.error('Error canceling request:', error);
        }
    };

    const handlePress = async () => {
        try {
            if (!requested) {
                await send();
            } else {
                if (existingRequest && existingRequest.id) {
                    await cancel(existingRequest.id);
                } else {
                    console.error('Existing request is missing or invalid:', existingRequest);
                }
            }
        } catch (error) {
            console.error('Error in HeartCircleButton handlePress:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    const iconName = requested ? 'heart-dislike' : 'heart';
    const backgroundColor = requested
        ? (colors.elevation?.level2 ?? '#888')
        : colors.primary;

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

/**
 * A collection of hearts that float away as progress goes from 0 to 1.
 */
function HeartsExplosion({ progress }) {
    // We'll create an array of hearts
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

/**
 * A single heart that floats away based on the shared progress value.
 */
function FloatingHeart({ progress, angle, distance, scale }) {
    const animatedStyle = useAnimatedStyle(() => {
        // Fade in quickly from 0 -> 0.05, then fade out toward 1
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
            transform: [
                { translateX: x },
                { translateY: y },
                { scale: _scale },
            ],
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
        marginTop: CARD_SPACING, // This should match the spacing used in snapToInterval.
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
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 120,          // Adjust this value if needed.
        height: '100%',       // This covers the bottom 40% of the carousel.
        borderTopLeftRadius: 16,  // Match the carousel's top-left radius.
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
    dateTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    location: {
        fontSize: 14,
    },
    dateCategory: {
        fontSize: 14,
    },
    // ----- MODAL STYLES -----
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
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 14,
    },
    buttonRow: {
        marginVertical: 16,
        alignItems: 'center',
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