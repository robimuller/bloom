import React, {
    useState,
    useContext,
    useCallback,
    useRef,
    useEffect,
} from 'react';
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
    useAnimatedStyle,
    withTiming,
    Easing,
    interpolate,
    Extrapolate,
    runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfilesContext } from '../../contexts/ProfilesContext';
import { AuthContext } from '../../contexts/AuthContext';
import ProfileHeader from '../../components/ProfileHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import MenFeedLayout from '../../components/MenFeedLayout';
import ProfileDetailsBottomSheet from '../../components/ProfileDetailsBottomSheet';
import { calculateDistance } from '../../utils/distance';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import ZoomableImage from '../../components/ZoomableImage';



const { width: SCREEN_WIDTH } = Dimensions.get('window');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const REPORT_OPTIONS = [
    'Harassment',
    'Fake Profile',
    'Spam',
    'Inappropriate content',
];

const HEART_COUNT = 6;

export default function MenFeedScreen({ onScroll }) {
    const route = useRoute();
    const navigation = useNavigation();
    const { womenProfiles, loadingWomen } = useContext(ProfilesContext);
    const { userDoc } = useContext(AuthContext); // current logged in user's doc with coordinates
    const { colors } = useTheme();
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [sheetKey, setSheetKey] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [requestedIds, setRequestedIds] = useState([]);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportTargetUser, setReportTargetUser] = useState(null);
    const [reportReasons, setReportReasons] = useState([]);

    // Create a ref for the FlatList
    const flatListRef = useRef(null);

    // Determine the initial index based on the passed initialItemId
    const initialIndex =
        route.params?.initialItemId && womenProfiles.length
            ? womenProfiles.findIndex(profile => profile.id === route.params.initialItemId)
            : 0;


    // When profiles load, scroll to the specified index
    useEffect(() => {
        if (route.params?.initialItemId && womenProfiles.length && flatListRef.current) {
            // Use a timeout to ensure the list has rendered
            setTimeout(() => {
                flatListRef.current.scrollToIndex({ index: initialIndex, animated: true });
            }, 500);
        }
    }, [route.params, womenProfiles, initialIndex]);

    // Fallback in case scrollToIndex fails
    const onScrollToIndexFailed = (info) => {
        setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
        }, 500);
    };

    // A ref that tracks whether the modal is currently visible.
    const modalVisibleRef = useRef(modalVisible);
    useEffect(() => {
        modalVisibleRef.current = modalVisible;
    }, [modalVisible]);

    const handleProfilePress = (profile) => {
        setSheetKey((prev) => prev + 1);
        setSelectedProfile(profile);
        setModalVisible(true);
    };

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }) => {
            if (!modalVisibleRef.current) return;
            if (viewableItems.length > 0) {
                const newProfile = viewableItems[0].item;
                if (!selectedProfile || newProfile.id !== selectedProfile.id) {
                    setSelectedProfile(newProfile);
                }
            }
        },
        [selectedProfile]
    );

    const handleInvitePress = async (userId) => {
        setRequestedIds((prev) => [...prev, userId]);
    };

    const handleCancelInvite = async (userId) => {
        setRequestedIds((prev) => prev.filter((id) => id !== userId));
    };

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

    const handleCloseBottomSheet = () => {
        setModalVisible(false);
        setSelectedProfile(null);
    };

    console.log(userDoc.firstName, userDoc.city);


    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <MenFeedLayout
                headerTitle="Explore"
                onInvitePress={() => Alert.alert('Invite pressed')}
                onRequestPress={() => Alert.alert('Request pressed')}
                onXPress={() => Alert.alert('X pressed')}
                colors={colors}
            >
                {(contentHeight) => (
                    <>
                        {loadingWomen ? (
                            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                                <Text style={{ color: colors.text }}>Loading profiles...</Text>
                            </View>
                        ) : (
                            <AnimatedFlatList
                                ref={flatListRef}
                                initialScrollIndex={initialIndex} // Renders directly at the target index
                                style={{ height: contentHeight, backgroundColor: colors.background }}  // Use flex: 1 and add backgroundColor
                                data={womenProfiles}
                                keyExtractor={(profile) => profile.id}
                                getItemLayout={(data, index) => ({
                                    length: contentHeight,
                                    offset: contentHeight * index,
                                    index,
                                })}
                                renderItem={({ item }) => {
                                    // Your renderItem code here
                                    return (
                                        <View
                                            style={[
                                                styles.cardContainer,
                                                {
                                                    height: contentHeight,
                                                    backgroundColor: colors.background,
                                                    borderBottomColor: colors.cardBackground,
                                                    borderBottomWidth: 1,
                                                },
                                            ]}
                                        >
                                            <ProfileHeader
                                                item={item}
                                                onFlagPress={handleFlagPress}
                                                onPress={handleProfilePress}
                                                colors={colors}
                                            />
                                            <Carousel
                                                contentHeight={contentHeight - 80}
                                                photos={
                                                    item.photos && item.photos.length
                                                        ? item.photos
                                                        : [require('../../../assets/avatar-placeholder.png')]
                                                }
                                                userId={item.uid}
                                                isRequested={requestedIds.includes(item.uid)}
                                                onInvitePress={handleInvitePress}
                                                onCancelInvite={handleCancelInvite}
                                                onPress={() => handleProfilePress(item)}
                                            />
                                        </View>
                                    );
                                }}
                                onViewableItemsChanged={onViewableItemsChanged}
                                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                                pagingEnabled
                                decelerationRate="fast"
                                snapToAlignment="start"
                                contentContainerStyle={{ paddingBottom: 0 }}
                                onScroll={onScroll}
                                scrollEventThrottle={16}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </>
                )}
            </MenFeedLayout>

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
                        style={[
                            styles.modalContainer,
                            { backgroundColor: colors.background },
                        ]}
                        activeOpacity={1}
                        onPress={() => { }}
                    >
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {`Report ${reportTargetUser?.firstName || 'User'}?`}
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: colors.secondary }]}>
                            Choose the reason(s) for your report:
                        </Text>
                        {REPORT_OPTIONS.map((reason) => (
                            <View key={reason} style={styles.checkboxRow}>
                                <Checkbox.Android
                                    status={
                                        reportReasons.includes(reason)
                                            ? 'checked'
                                            : 'unchecked'
                                    }
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

            {selectedProfile && (
                <ProfileDetailsBottomSheet
                    key={sheetKey}
                    selectedProfile={selectedProfile}
                    onClose={handleCloseBottomSheet}
                />
            )}
        </View>
    );
}

function Carousel({
    photos,
    contentHeight, // Passed in as (cardHeight - some offset)
    userId,
    isRequested,
    onInvitePress,
    onCancelInvite,
    onPress, // New onPress prop for tap
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const { colors } = useTheme();

    // Calculate carousel height (contentHeight minus 40)
    const carouselHeight = contentHeight - 40;

    const onScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (SCREEN_WIDTH * 0.9));
        setCurrentIndex(index);
    };

    const validPhotos = (photos || []).filter((photo) => !!photo);

    // Handler for tap gesture
    const onTapHandler = (event) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            // Trigger a light haptic feedback
            Haptics.selectionAsync();
            if (onPress) {
                onPress();
            }
        }
    };

    return (
        <TapGestureHandler
            onHandlerStateChange={onTapHandler}
            maxDeltaX={10}
            maxDeltaY={10}
        >
            <View style={[styles.carouselWrapper, { height: carouselHeight }]}>
                <FlatList
                    data={
                        validPhotos.length > 0
                            ? validPhotos
                            : [require('../../../assets/avatar-placeholder.png')]
                    }
                    keyExtractor={(uri, idx) => `${uri}-${idx}`}
                    ref={flatListRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={onScroll}
                    scrollEnabled={photos.length > 1}
                    renderItem={({ item }) => (
                        <ZoomableImage
                            source={typeof item === 'string' ? { uri: item } : item}
                            style={[styles.carouselImage, { height: carouselHeight }]}
                            transition={0} // if you still need the transition prop from expo-image
                        />
                    )}
                />
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
        </TapGestureHandler>
    );
}

/** Heart button with explosion animation **/
function HeartCircleButton({ userId, isRequested, onInvitePress, onCancelInvite }) {
    const { colors } = useTheme();
    const [exploding, setExploding] = useState(false);
    const progress = useSharedValue(0);

    const handlePress = async () => {
        try {
            if (!isRequested) {
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
                onCancelInvite(userId);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
            console.error('HeartCircleButton error:', error);
        }
    };

    const iconName = isRequested ? 'mail-open' : 'mail';

    return (
        <TapGestureHandler
            onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.ACTIVE) {
                    // This inner handler will prevent the outer tap from firing.
                    handlePress();
                }
            }}
        >
            <View>
                <TouchableOpacity
                    style={[styles.heartButton, { backgroundColor: colors.background }]}
                    activeOpacity={0.8}
                >
                    <Ionicons name={iconName} size={24} color={colors.primary} />
                </TouchableOpacity>
                {exploding && <HeartsExplosion progress={progress} />}
            </View>
        </TapGestureHandler>
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
        const _scale = interpolate(
            progress.value,
            [0, 1],
            [scale, scale * 0.8]
        );

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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        overflow: 'hidden',
        paddingHorizontal: 15,
    },
    // footer: {
    //     height: SCREEN_HEIGHT * 0.2,
    //     padding: 20,
    //     borderRadius: 16,
    // },
    // footerRow: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    // },
    location: {
        fontSize: 14,
    },
    carouselWrapper: {
        position: 'relative',
        width: SCREEN_WIDTH * 0.9,
        borderRadius: 16,
        alignSelf: 'center',
        overflow: 'hidden',
    },
    gradientBar: {
        position: 'absolute',
        top: 0,
        right: -1,
        height: '100%',
        width: 65,
        zIndex: 1,
    },
    carouselImage: {
        width: SCREEN_WIDTH * 0.9,
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
    floatingHeart: {
        position: 'absolute',
    },
});