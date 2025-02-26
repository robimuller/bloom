import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    Dimensions,
    Animated,
} from 'react-native';
import { DraggableGrid } from 'react-native-draggable-grid';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MAX_PHOTOS = 6;

const PhotosStep = React.memo(({ profileInfo, setProfileInfo, colors }) => {
    // State to track if we are in "selecting profile pic" mode
    const [isSelectingProfilePic, setIsSelectingProfilePic] = useState(false);

    // We want a 2×3 grid (6 slots total).
    const margin = 30;
    const columns = 2;
    const rows = 3;

    // Calculate tile size
    const windowWidth = Dimensions.get('window').width;
    const totalHorizontalMargins = margin * (columns + 1);
    const tileWidth = (windowWidth - totalHorizontalMargins) / columns;

    // Container height for 3 rows
    const totalVerticalMargins = margin * (rows + 1);
    const containerHeight = tileWidth * rows + totalVerticalMargins;

    // Animated value for the "shaking" effect
    const shakeAnim = useRef(new Animated.Value(0)).current;
    // Ref to store the looping animation so we can stop it
    const shakingAnimationRef = useRef(null);

    // When in selection mode, start shaking; else, stop and reset to 0.
    useEffect(() => {
        if (isSelectingProfilePic) {
            const loopAnim = Animated.loop(
                Animated.sequence([
                    Animated.timing(shakeAnim, {
                        toValue: 1,
                        duration: 75,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shakeAnim, {
                        toValue: -1,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shakeAnim, {
                        toValue: 0,
                        duration: 75,
                        useNativeDriver: true,
                    }),
                ])
            );
            shakingAnimationRef.current = loopAnim;
            loopAnim.start();
        } else {
            if (shakingAnimationRef.current) {
                shakingAnimationRef.current.stop();
                shakingAnimationRef.current = null;
            }
            // Reset immediately to 0
            shakeAnim.setValue(0);
        }
    }, [isSelectingProfilePic, shakeAnim]);

    // Interpolate the shake value to a rotation angle (-2deg to 2deg)
    const shakeRotation = shakeAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-2deg', '2deg'],
    });

    // Update photos in profileInfo
    const updatePhotos = (newPhotos) => {
        setProfileInfo({
            ...profileInfo,
            photos: newPhotos,
            profilePicture:
                profileInfo.profilePicture && newPhotos.includes(profileInfo.profilePicture)
                    ? profileInfo.profilePicture
                    : newPhotos[0] || null,
        });
    };

    // Build grid data: always create 6 slots (photo items then "add" items)
    const getGridData = () => {
        const photos = profileInfo.photos || [];
        const data = [];
        for (let i = 0; i < MAX_PHOTOS; i++) {
            if (i < photos.length) {
                data.push({
                    key: `photo-${i}`,
                    type: 'photo',
                    uri: photos[i],
                });
            } else {
                data.push({
                    key: `add-${i}`,
                    type: 'add',
                    disabledDrag: true,
                });
            }
        }
        return data;
    };

    // Launch image picker to add a photo
    const handlePickPhoto = async () => {
        try {
            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
            });
            if (!pickerResult.canceled && pickerResult.assets?.[0]) {
                const uri = pickerResult.assets[0].uri;
                const photos = profileInfo.photos ? [...profileInfo.photos] : [];
                if (photos.length >= MAX_PHOTOS) {
                    Alert.alert("Limit Reached", "You can only upload up to 6 photos.");
                    return;
                }
                photos.push(uri);
                updatePhotos(photos);
            }
        } catch (error) {
            console.error("Error picking photo:", error);
        }
    };

    // Remove photo by key
    const handleRemovePhoto = (key) => {
        const index = parseInt(key.split('-')[1], 10);
        const photos = profileInfo.photos ? [...profileInfo.photos] : [];
        photos.splice(index, 1);
        updatePhotos(photos);
    };

    // Toggle selection mode for profile pic
    const hasProfilePicture = !!profileInfo.profilePicture;
    const handleProfilePicButton = () => {
        if (!hasProfilePicture && (!profileInfo.photos || profileInfo.photos.length === 0)) {
            Alert.alert("No Photos", "Please add at least one photo first.");
            return;
        }
        setIsSelectingProfilePic(!isSelectingProfilePic);
    };

    // Render each grid item
    const renderItem = (item) => {
        const tileStyle = {
            width: tileWidth,
            height: tileWidth,
            margin,
            borderRadius: 10,
            overflow: 'hidden',
        };

        if (item.type === 'photo') {
            const animatedStyle = isSelectingProfilePic
                ? { transform: [{ rotate: shakeRotation }] }
                : {};
            return (
                <Animated.View style={[styles.itemContainer, tileStyle, animatedStyle]} key={item.key}>
                    {isSelectingProfilePic ? (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={StyleSheet.absoluteFill}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                if (shakingAnimationRef.current) {
                                    shakingAnimationRef.current.stop();
                                    shakingAnimationRef.current = null;
                                }
                                setProfileInfo({ ...profileInfo, profilePicture: item.uri });
                                setIsSelectingProfilePic(false);
                                // Force reset the shake value instantly
                                shakeAnim.setValue(0);
                            }}
                        >
                            <Image source={{ uri: item.uri }} style={styles.photo} />
                        </TouchableOpacity>
                    ) : (
                        <Image source={{ uri: item.uri }} style={styles.photo} />
                    )}
                    {profileInfo.profilePicture === item.uri && (
                        <View style={styles.userIconWrapper}>
                            <Ionicons name="star" size={20} color={colors.accent} />
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={() => handleRemovePhoto(item.key)}
                        style={styles.removeButton}
                        disabled={isSelectingProfilePic}
                    >
                        <Ionicons name="close" size={20} color={colors.text} />
                    </TouchableOpacity>
                </Animated.View>
            );
        }
        // "Add" tile
        return (
            <View style={[tileStyle]} key={item.key}>
                <TouchableOpacity
                    style={[styles.addTile, { backgroundColor: "#121212" }]}
                    onPress={handlePickPhoto}
                    disabled={isSelectingProfilePic}
                >
                    <Text style={styles.addTileText}>+</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const gridData = getGridData();

    // Render the profile picture section (button or instruction text)
    const renderProfilePicSection = () => {
        if (isSelectingProfilePic) {
            return (
                <Text style={[styles.profilePicInstruction, { color: colors.text }]}>
                    Tap a photo to set it as a profile picture
                </Text>
            );
        }
        return (
            <TouchableOpacity onPress={handleProfilePicButton} style={[styles.profilePicButton]}>
                <Text style={[styles.profilePicButtonText, { color: colors.text }]}>
                    {hasProfilePicture ? "Set Different Profile Photo" : "Set Profile Picture"}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.panel}>
            <Text style={[styles.title, { color: colors.text }]}>Upload Photos</Text>
            <View style={[styles.gridWrapper, { height: containerHeight }]}>
                <DraggableGrid
                    numColumns={2}
                    data={gridData}
                    renderItem={renderItem}
                    onDragRelease={(data) => {
                        const newPhotos = data.filter((item) => item.type === 'photo').map((item) => item.uri);
                        updatePhotos(newPhotos);
                    }}
                />
            </View>
            {renderProfilePicSection()}
        </View>
    );
});

const styles = StyleSheet.create({
    panel: {
        paddingVertical: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '500',
        marginBottom: 10,
    },
    profilePicInstruction: {
        fontSize: 16,
        fontStyle: 'italic',
        marginBottom: 10,
    },
    profilePicButton: {
        alignSelf: 'center',
    },
    profilePicButtonText: {
        fontSize: 16,
    },
    gridWrapper: {
        width: '100%',
        justifyContent: "center",
    },
    itemContainer: {
        position: 'relative',
    },
    photo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    userIconWrapper: {
        position: 'absolute',
        top: 5,
        left: 5,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    userIcon: {
        color: '#fff',
        fontSize: 14,
    },
    removeButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 18,
        lineHeight: 18,
    },
    addTile: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addTileText: {
        color: '#fff',
        fontSize: 40,
    },
});

export default PhotosStep;