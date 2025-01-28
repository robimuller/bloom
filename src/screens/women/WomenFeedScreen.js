// src/screens/WomenFeedScreen.jsx
import React, { useContext, useState, useRef } from 'react';
import {
    View,
    FlatList,
    Alert,
    StyleSheet,
    Text,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import { useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import Animated, {
    useSharedValue,
    withTiming,
    Easing,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    runOnJS
} from 'react-native-reanimated';

import { DatesContext } from '../../contexts/DatesContext';
import { RequestsContext } from '../../contexts/RequestsContext';
import { getDateCategory } from '../../utils/dateCategory';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Number of tiny hearts to explode
const HEART_COUNT = 6;

export default function WomenFeedScreen() {
    const { dates, loadingDates } = useContext(DatesContext);
    const { sendRequest, cancelRequest, requests } = useContext(RequestsContext);
    const { colors } = useTheme();

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

    const renderItem = ({ item }) => {
        const dateId = item.id;
        const hostId = item.hostId;
        const dateCategory = getDateCategory(item.date || '');

        // Check if there's already a request for this date (and still 'pending')
        // Because if user is female => requests = all requests with 'requesterId = user.uid'
        // So we find if there's any matching doc with the same dateId & hostId
        const existingRequest = requests.find(
            (r) => r.dateId === dateId &&
                r.hostId === hostId &&
                r.status === 'pending'
        );

        return (
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
                            {item.host?.age ? `, ${item.host.age}` : ''}
                        </Text>
                    </View>
                    <Ionicons
                        name="flag-outline"
                        size={20}
                        color={colors.onSurface ?? '#666'}
                        style={{ marginRight: 8 }}
                    />
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
                        <Text style={[styles.location, { color: colors.onSurface }]}>{item.location}</Text>
                        <Text style={[styles.dateCategory, { color: colors.onSurface }]}>{dateCategory}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {loadingDates ? (
                <Text style={{ textAlign: 'center', marginTop: 20, color: colors.text }}>
                    Loading Dates…
                </Text>
            ) : (
                <FlatList
                    data={dates}
                    keyExtractor={(date) => date.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
}

function Carousel({
    photos,
    dateId,
    hostId,
    onSendRequest,
    onCancelRequest,
    existingRequest
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const { colors } = useTheme();

    const onScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (SCREEN_WIDTH * 0.8));
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
    onCancelRequest
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
                style={[styles.heartButton, { backgroundColor }]}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <Ionicons name={iconName} size={24} color={colors.onPrimary} />
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
        scale: 0.5 + Math.random() * 0.8
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
        // fade in quickly from 0 -> 0.05
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
                { scale: _scale }
            ],
            opacity
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
        marginTop: 16
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
        fontSize: 14,
        fontWeight: '900'
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
});