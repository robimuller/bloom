import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    Animated,
    Easing,
    Modal,
    ScrollView,
    TouchableWithoutFeedback
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import DraggableModal from '../DraggableModal'; // adjust the path as needed

const MAX_PHOTOS = 6;

const PhotosStep = React.memo(({ profileInfo, setProfileInfo, colors }) => {
    const [isProfilePicModalVisible, setIsProfilePicModalVisible] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePickPhoto = async (index = null) => {
        try {
            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
            });
            if (!pickerResult.canceled && pickerResult.assets?.[0]) {
                const uri = pickerResult.assets[0].uri;
                let newPhotos = profileInfo.photos ? [...profileInfo.photos] : [];
                if (index === null) {
                    if (newPhotos.length >= MAX_PHOTOS) {
                        Alert.alert("Limit Reached", "You can only upload up to 6 photos.");
                        return;
                    }
                    newPhotos.push(uri);
                } else {
                    newPhotos[index] = uri;
                }
                // If no profile picture is set, set it automatically.
                setProfileInfo({
                    ...profileInfo,
                    photos: newPhotos,
                    profilePicture: profileInfo.profilePicture || uri,
                });
            }
        } catch (error) {
            console.error("Error picking photo:", error);
        }
    };

    const animatePress = (onComplete) => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        ]).start(onComplete);
    };

    const handlePhotoPress = (index) => {
        animatePress(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handlePickPhoto(index);
        });
    };

    const handleAddPhoto = () => {
        if ((profileInfo.photos || []).length >= MAX_PHOTOS) {
            Alert.alert("Limit Reached", "You can only upload up to 6 photos.");
            return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        handlePickPhoto();
    };

    const handleSetProfilePic = () => {
        if (!profileInfo.photos || profileInfo.photos.length === 0) {
            Alert.alert("No Photos", "Please add at least one photo first.");
            return;
        }
        setIsProfilePicModalVisible(true);
    };

    // Render one spot in the grid.
    const renderPhotoSpot = (index) => {
        const photos = profileInfo.photos || [];
        const uri = photos[index];
        return (
            <TouchableOpacity
                key={index}
                onPress={() => (uri ? handlePhotoPress(index) : handleAddPhoto())}
                activeOpacity={0.8}
                style={[styles.photoContainer, { backgroundColor: colors.background }]}
            >
                {uri ? (
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <Image source={{ uri }} style={styles.photo} />
                    </Animated.View>
                ) : (
                    <View style={[styles.emptyPhoto, { borderColor: colors.primary }]}>
                        <Text style={{ color: colors.secondary, fontSize: 28 }}>+</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // Render the draggable modal for selecting profile picture.
    const renderProfilePicModal = () => (
        <Modal
            visible={isProfilePicModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setIsProfilePicModalVisible(false)}
        >
            <View style={[modalStyles.container]}>
                <TouchableWithoutFeedback onPress={() => setIsProfilePicModalVisible(false)}>
                    <View style={modalStyles.background} />
                </TouchableWithoutFeedback>
                <DraggableModal onClose={() => setIsProfilePicModalVisible(false)} sheetHeight={300}>
                    <Text style={[modalStyles.title, { color: colors.text }]}>
                        Select Profile Picture
                    </Text>
                    <ScrollView contentContainerStyle={modalStyles.photosGrid}>
                        {(profileInfo.photos || []).map((uri, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    setProfileInfo({ ...profileInfo, profilePicture: uri });
                                    setIsProfilePicModalVisible(false);
                                }}
                                style={modalStyles.photoItem}
                            >
                                <Image source={{ uri }} style={modalStyles.photo} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity onPress={() => setIsProfilePicModalVisible(false)} style={modalStyles.closeButton}>
                        <Text style={[modalStyles.closeButtonText, { color: colors.primary }]}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </DraggableModal>
            </View>
        </Modal>
    );

    return (
        <View style={[styles.panel, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Upload Photos</Text>
            <TouchableOpacity
                onPress={handleSetProfilePic}
                style={[styles.profilePicButton, { backgroundColor: colors.primary }]}
            >
                <Text style={styles.profilePicButtonText}>Set Profile Picture</Text>
            </TouchableOpacity>
            <View style={[styles.grid]}>
                {Array.from({ length: MAX_PHOTOS }).map((_, index) => renderPhotoSpot(index))}
            </View>
            <TouchableOpacity onPress={handleAddPhoto} style={[styles.addButton, { backgroundColor: colors.primary }]}>
                <Text style={styles.addButtonText}>Add Photo</Text>
            </TouchableOpacity>
            {renderProfilePicModal()}
        </View>
    );
});

const styles = StyleSheet.create({
    panel: {
        marginVertical: 8,
        paddingVertical: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '500',
        marginBottom: 10,
    },
    profilePicButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    profilePicButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    photoContainer: {
        width: '30%',
        aspectRatio: 1,
        marginBottom: 10,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    photo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    emptyPhoto: {
        flex: 1,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        backgroundColor: '#FCABFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

const modalStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sheetContent: {
        flex: 1,
    },
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    photoItem: {
        width: '30%',
        aspectRatio: 1,
        marginBottom: 10,
        borderRadius: 8,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    closeButton: {
        marginTop: 10,
        alignSelf: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PhotosStep;