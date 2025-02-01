// src/screens/SettingsScreen.js
import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Button,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwitchSelector from 'react-native-switch-selector';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { AuthContext } from '../../contexts/AuthContext';
import { DatesContext } from '../../contexts/DatesContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { SettingsContext } from '../../contexts/SettingsContext';

import GradientText from '../../components/GradientText';
import CustomAccordion from '../../components/CustomAccordion';
import CustomDraggableBottomSheet from '../../components/CustomDraggableBottomSheet';
import uploadImageAsync from '../../utils/uploadImage';
import { Image } from 'expo-image'
import {
    BioEditor,
    HeightEditor,
    OrientationEditor,
    AgeRangeEditor,
    EducationEditor,
    InterestsEditor
} from '../../components/ProfileEditors';

export default function SettingsScreen() {
    const { userDoc, logout } = useContext(AuthContext);
    const { dates } = useContext(DatesContext);
    const { settingsState, updateProfileField, updatePhotoAtIndex } = useContext(SettingsContext);
    const { themeMode, toggleTheme } = useContext(ThemeContext);
    const [isUploadingProfile, setIsUploadingProfile] = useState(false);
    // For individual photo slots, you could store an object mapping indexes to booleans:
    const [uploadingIndexes, setUploadingIndexes] = useState({});

    const navigation = useNavigation();
    const paperTheme = useTheme();
    const { height: screenHeight } = Dimensions.get('window');

    const sheetHeight = screenHeight * 0.8;


    // States for managing the custom bottom sheet modal.
    const [isModalVisible, setModalVisible] = useState(false);
    const [editField, setEditField] = useState(null);
    const [fieldValue, setFieldValue] = useState('');

    // Open the modal to edit a field.
    function handleEdit(fieldName) {
        console.log("handleEdit called with:", fieldName);
        setEditField(fieldName);
        const initialVal = settingsState[fieldName] ? String(settingsState[fieldName]) : '';
        setFieldValue(initialVal);
        setModalVisible(true);
    }

    // Save the edited field.
    async function onSaveField() {
        await updateProfileField(editField, fieldValue);
        setModalVisible(false);
    }

    // Handler for setting the profile picture (first photo slot)
    async function handleSetProfilePicture() {
        console.log("handleSetProfilePicture called");
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log("Media Library Permission status:", status);
        if (status !== "granted") {
            alert("Sorry, we need camera roll permissions to make this work!");
            return;
        }
        try {
            setIsUploadingProfile(true); // start uploading indicator
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images', // using the new API string
                allowsEditing: true,
                aspect: [1, 1], // square crop for profile picture
                quality: 1,
            });
            console.log("ImagePicker result:", result);
            if (result.canceled) {
                console.log("User canceled image picker");
                setIsUploadingProfile(false);
                return;
            }
            const picked = result.assets ? result.assets[0] : result;
            const uploadedUrl = await uploadImageAsync(picked.uri);
            await updatePhotoAtIndex(0, uploadedUrl);
        } catch (error) {
            console.error("Error launching image picker:", error);
            alert("Error launching image picker: " + error.message);
        } finally {
            setIsUploadingProfile(false); // stop uploading indicator
        }
    }

    // Handler for updating one of the photo slots
    async function handleChangePhoto(index) {
        console.log("handleChangePhoto called for index:", index);
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log("Media Library Permission status:", status);
        if (status !== "granted") {
            alert("Sorry, we need camera roll permissions to make this work!");
            return;
        }
        try {
            // Mark this index as uploading.
            setUploadingIndexes((prev) => ({ ...prev, [index]: true }));
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images', // using the new API string
                allowsEditing: true,
                aspect: [4, 4],
                quality: 1,
            });
            console.log("ImagePicker result:", result);
            if (result.canceled) {
                console.log("User canceled image picker");
                setUploadingIndexes((prev) => ({ ...prev, [index]: false }));
                return;
            }
            const picked = result.assets ? result.assets[0] : result;
            const uploadedUrl = await uploadImageAsync(picked.uri);
            await updatePhotoAtIndex(index, uploadedUrl);
        } catch (error) {
            console.error("Error launching image picker:", error);
            alert("Error launching image picker: " + error.message);
        } finally {
            // Remove the uploading indicator for this slot.
            setUploadingIndexes((prev) => ({ ...prev, [index]: false }));
        }
    }

    // For removing a photo.
    async function handleRemovePhoto(index) {
        try {
            await updatePhotoAtIndex(index, null);
        } catch (error) {
            alert('Error removing photo: ' + error.message);
        }
    }

    // Theme switcher options.
    const themeOptions = [
        {
            label: '',
            value: 'light',
            customIcon: <Icon name="white-balance-sunny" size={18} color="#fff" />,
        },
        {
            label: '',
            value: 'dark',
            customIcon: <Icon name="weather-night" size={18} color="#fff" />,
        },
    ];

    const { bio, height, orientation, interests, education, ageRange, photos } = settingsState;

    const handleLogout = async () => {
        try {
            await logout();
            alert('You have successfully logged out.');
        } catch (error) {
            alert(`Error logging out: ${error.message}`);
        }
    };

    const handleDeleteAccount = () => {
        alert('Account deletion not yet implemented.');
    };

    const gradientColors =
        themeMode === 'light'
            ? [paperTheme.colors.primary, paperTheme.colors.accent]
            : [paperTheme.colors.primary, paperTheme.colors.accent];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={24} color={paperTheme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: paperTheme.colors.text }]}>Account</Text>
                    <SwitchSelector
                        options={themeOptions}
                        initial={themeMode === 'light' ? 0 : 1}
                        onPress={(value) => {
                            if (value !== themeMode) toggleTheme();
                        }}
                        textColor={paperTheme.colors.background}
                        selectedColor={paperTheme.colors.background}
                        buttonColor={paperTheme.colors.primary}
                        backgroundColor={paperTheme.colors.secondary}
                        borderRadius={25}
                        style={styles.themeToggle}
                        height={32}
                    />
                </View>

                {/* Scrollable Content */}
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {/* Greeting Section with Profile Picture */}
                    <View style={styles.greetingSection}>
                        <TouchableOpacity onPress={handleSetProfilePicture} style={styles.profilePictureContainer}>
                            {photos[0] ? (
                                <Image
                                    source={{ uri: photos[0] }}
                                    style={styles.profilePicture}
                                    resizeMode="cover"
                                    // Caching props:
                                    cachePolicy="memory-disk"
                                    cacheKey={`profile-${photos[0]}`}
                                    transition={false}
                                />
                            ) : (
                                <Icon name="account" size={100} color="#ccc" />
                            )}
                            {isUploadingProfile && (
                                <View style={[styles.profilePictureOverlay, paperTheme.colors.overlay]}>
                                    <ActivityIndicator size="large" color={paperTheme.colors.accent} />
                                </View>
                            )}
                        </TouchableOpacity>
                        <GradientText
                            text={`Hello, ${userDoc?.displayName || 'user_name'}`}
                            gradientColors={gradientColors}
                            style={styles.headerText}
                        />
                        <Text style={[styles.subText, { color: paperTheme.colors.text }]}>
                            {userDoc?.location || 'San Francisco, US'}
                        </Text>
                    </View>

                    {/* Accordion Section */}
                    <View style={styles.accordionSection}>
                        {/* Settings Accordion */}
                        <CustomAccordion
                            title="Settings"
                            subtitle="Edit your preferences and details"
                            icon="cog"
                            backgroundColor={paperTheme.colors.cardBackground}
                            textColor={paperTheme.colors.text}
                            subtitleColor={paperTheme.colors.secondary}
                        >
                            {/* Bio */}
                            <View style={styles.fieldRow}>
                                <Text style={[styles.label, { color: paperTheme.colors.text }]}>Bio:</Text>
                                <Text style={[styles.value, { color: paperTheme.colors.text }]}>{bio}</Text>
                                <TouchableOpacity onPress={() => handleEdit('bio')}>
                                    <Icon name="pencil" size={20} color={paperTheme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                            <Divider style={styles.divider} />

                            {/* Height */}
                            <View style={styles.fieldRow}>
                                <Text style={[styles.label, { color: paperTheme.colors.text }]}>Height:</Text>
                                <Text style={[styles.value, { color: paperTheme.colors.text }]}>{height}</Text>
                                <TouchableOpacity onPress={() => handleEdit('height')}>
                                    <Icon name="pencil" size={20} color={paperTheme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                            <Divider style={styles.divider} />

                            {/* Orientation */}
                            <View style={styles.fieldRow}>
                                <Text style={[styles.label, { color: paperTheme.colors.text }]}>Orientation:</Text>
                                <Text style={[styles.value, { color: paperTheme.colors.text }]}>{orientation}</Text>
                                <TouchableOpacity onPress={() => handleEdit('orientation')}>
                                    <Icon name="pencil" size={20} color={paperTheme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                            <Divider style={styles.divider} />

                            {/* Interests */}
                            <View style={styles.fieldRow}>
                                <Text style={[styles.label, { color: paperTheme.colors.text }]}>Interests:</Text>
                                <Text style={[styles.value, { color: paperTheme.colors.text }]}>
                                    {Array.isArray(interests) ? interests.join(', ') : interests}
                                </Text>
                                <TouchableOpacity onPress={() => handleEdit('interests')}>
                                    <Icon name="pencil" size={20} color={paperTheme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                            <Divider style={styles.divider} />

                            {/* Education */}
                            <View style={styles.fieldRow}>
                                <Text style={[styles.label, { color: paperTheme.colors.text }]}>Education:</Text>
                                <Text style={[styles.value, { color: paperTheme.colors.text }]}>{education}</Text>
                                <TouchableOpacity onPress={() => handleEdit('education')}>
                                    <Icon name="pencil" size={20} color={paperTheme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                            <Divider style={styles.divider} />

                            {/* Age Range */}
                            <View style={styles.fieldRow}>
                                <Text style={[styles.label, { color: paperTheme.colors.text }]}>Age Range:</Text>
                                <Text style={[styles.value, { color: paperTheme.colors.text }]}>
                                    {Array.isArray(ageRange) ? `${ageRange[0]} - ${ageRange[1]}` : ageRange}
                                </Text>
                                <TouchableOpacity onPress={() => handleEdit('ageRange')}>
                                    <Icon name="pencil" size={20} color={paperTheme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </CustomAccordion>

                        {/* Photos Accordion */}
                        <CustomAccordion
                            title={`Photos (${photos.filter((p) => p).length}/6)`}
                            subtitle="Manage or add your profile photos"
                            icon="image"
                            backgroundColor={paperTheme.colors.cardBackground}
                            textColor={paperTheme.colors.text}
                            subtitleColor={paperTheme.colors.secondary}
                        >
                            <Text style={[styles.hintText, { color: paperTheme.colors.text }]}>
                                Tip: Tap the profile picture above to update your main profile photo.
                            </Text>
                            <View style={styles.photosContainer}>
                                {[...Array(6)].map((_, index) => {
                                    const photoUri = photos[index];
                                    const isUploading = uploadingIndexes[index];
                                    const cacheKey = `photo-${index}-${photoUri || 'placeholder'}`;
                                    return (
                                        <View key={`photo_${index}`} style={styles.photoWrapper}>
                                            <TouchableOpacity style={styles.photoSlot} onPress={() => handleChangePhoto(index)}>
                                                {photoUri ? (
                                                    <Image
                                                        source={{ uri: photoUri }}
                                                        style={styles.photoImage}
                                                        resizeMode="cover"
                                                        cachePolicy="memory-disk"
                                                        cacheKey={cacheKey}
                                                        transition={false}
                                                    />
                                                ) : (
                                                    <Icon name="plus" size={30} color="#999" />
                                                )}
                                                {isUploading && (
                                                    <View style={styles.overlay}>
                                                        <ActivityIndicator size="small" color={paperTheme.colors.accent} />
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                            {photoUri && (
                                                <TouchableOpacity style={styles.deleteIcon} onPress={() => handleRemovePhoto(index)}>
                                                    <View style={[styles.deleteIconWrapper, { backgroundColor: paperTheme.colors.cardBackground }]}>
                                                        <Icon name="close-circle" size={24} color={paperTheme.colors.error} />
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </CustomAccordion>

                        {/* My Dates Accordion (if applicable) */}
                        {userDoc?.gender?.toLowerCase() === 'male' && (
                            <CustomAccordion
                                title="My Dates"
                                subtitle="View or edit the dates you created"
                                icon="calendar"
                                backgroundColor={paperTheme.colors.cardBackground}
                                textColor={paperTheme.colors.text}
                                subtitleColor={paperTheme.colors.secondary}
                            >
                                {dates?.length > 0 ? (
                                    dates.map((d) => (
                                        <Text key={d.id} style={[styles.value, { color: paperTheme.colors.text }]}>
                                            • {d.title || '(untitled date)'}
                                        </Text>
                                    ))
                                ) : (
                                    <Text style={[styles.value, { color: paperTheme.colors.text }]}>
                                        You have no dates created yet.
                                    </Text>
                                )}
                            </CustomAccordion>
                        )}

                        {/* Membership Accordion */}
                        <CustomAccordion
                            title="Membership"
                            subtitle="Choose or upgrade your plan"
                            icon="star-outline"
                            backgroundColor={paperTheme.colors.cardBackground}
                            textColor={paperTheme.colors.text}
                            subtitleColor={paperTheme.colors.secondary}
                        >
                            <Text style={[styles.value, { color: paperTheme.colors.text }]}>
                                Packages available:
                            </Text>
                            <Text style={[styles.value, { color: paperTheme.colors.text }]}>• Free</Text>
                            <Text style={[styles.value, { color: paperTheme.colors.text }]}>• Premium</Text>
                            <Text style={[styles.value, { color: paperTheme.colors.text }]}>• Diamond</Text>
                        </CustomAccordion>
                    </View>
                </ScrollView>

                {/* Bottom Buttons */}
                <View style={[styles.bottomButtons, { borderTopColor: paperTheme.colors.onSecondary }]}>
                    <TouchableOpacity onPress={handleLogout} style={styles.touchableButton}>
                        <Text style={styles.buttonText}>Log Out</Text>
                    </TouchableOpacity>
                    <View style={{ height: 10 }} />
                    <TouchableOpacity onPress={handleDeleteAccount} style={styles.touchableButton}>
                        <Text style={[styles.buttonText, { color: paperTheme.colors.secondary }]}>
                            Delete my account
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Custom Draggable Bottom Sheet for Editing Fields */}
                {/* Bottom Sheet for Editing Fields */}
                <CustomDraggableBottomSheet
                    isVisible={isModalVisible}
                    onClose={() => setModalVisible(false)}
                    sheetHeight={sheetHeight}
                >
                    <View style={[styles.sheetContainer, { backgroundColor: paperTheme.colors.background }]}>
                        {/* Header */}
                        <View style={styles.sheetHeader}>
                            <Text style={[styles.sheetHeading, { color: paperTheme.colors.text }]}>
                                Edit {editField}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} color={paperTheme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        {/* Conditionally render editor based on field */}
                        {editField === 'interests' ? (
                            <InterestsEditor
                                initialInterests={
                                    Array.isArray(settingsState.interests)
                                        ? settingsState.interests
                                        : settingsState.interests?.split(',').map((i) => i.trim()) || []
                                }
                                onChange={(newInterests) => {
                                    setFieldValue(newInterests.join(', '));
                                }}
                            />
                        ) : editField === 'bio' ? (
                            <BioEditor
                                initialBio={settingsState.bio}
                                onChange={(newBio) => setFieldValue(newBio)}
                            />
                        ) : editField === 'height' ? (
                            <HeightEditor
                                initialHeight={settingsState.height}
                                onChange={(newHeight) => setFieldValue(newHeight)}
                            />
                        ) : editField === 'orientation' ? (
                            <OrientationEditor
                                initialOrientation={settingsState.orientation}
                                onChange={(newOrientation) => setFieldValue(newOrientation)}
                            />
                        ) : editField === 'ageRange' ? (
                            <AgeRangeEditor
                                initialAgeRange={settingsState.ageRange || { min: '', max: '' }}
                                onChange={(newAgeRange) =>
                                    setFieldValue(`${newAgeRange.min} - ${newAgeRange.max}`)
                                }
                            />
                        ) : editField === 'education' ? (
                            <EducationEditor
                                initialEducation={settingsState.education}
                                onChange={(newEducation) => setFieldValue(newEducation)}
                            />
                        ) : (
                            <TextInput
                                style={[
                                    styles.textInput,
                                    {
                                        color: paperTheme.colors.text,
                                        backgroundColor: paperTheme.colors.background,
                                        borderColor: paperTheme.colors.placeholder,
                                    },
                                ]}
                                value={fieldValue}
                                onChangeText={setFieldValue}
                                placeholder={`Enter ${editField}...`}
                                placeholderTextColor={paperTheme.colors.placeholder}
                            />
                        )}
                        {/* Button Row */}
                        <View style={styles.sheetButtonRow}>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={[styles.sheetButton, { backgroundColor: paperTheme.colors.primary }]}
                            >
                                <Text style={styles.sheetButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onSaveField}
                                style={[styles.sheetButton, { backgroundColor: paperTheme.colors.primary, marginLeft: 8 }]}
                            >
                                <Text style={styles.sheetButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </CustomDraggableBottomSheet>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1 },
    header: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: { padding: 8, zIndex: 2 },
    headerTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        zIndex: 1,
    },
    themeToggle: { width: 70, marginLeft: 'auto', zIndex: 2 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
    greetingSection: {
        marginBottom: 24,
        alignItems: 'center',
    },
    profilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50, // circular profile picture
        borderWidth: 2,
        borderColor: '#ccc',
        marginBottom: 12,
    },
    headerText: { fontSize: 22, fontWeight: '600' },
    subText: { fontSize: 14, marginTop: 4 },
    accordionSection: {},
    fieldRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    label: { width: 100, fontWeight: 'bold' },
    value: { flex: 1, marginRight: 6 },
    divider: { marginVertical: 4 },
    // Updated grid for photos: 2 rows x 3 columns.
    photosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginHorizontal: 0,
        marginTop: 8,
    },
    hintText: {
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 8,
    },
    photoWrapper: {
        width: '30%', // roughly 3 per row
        aspectRatio: 1, // square
        marginBottom: 16,
        position: 'relative',
    },
    photoSlot: {
        width: '100%',
        height: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    photoImage: { width: '100%', height: '100%' },
    profilePictureContainer: {
        width: 100,
        height: 100,
        borderRadius: 50, // Circular container
        overflow: 'hidden', // Clips the overlay and image to a circle
        position: 'relative',
    },
    profilePicture: {
        width: '100%',
        height: '100%',
    },
    profilePictureOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        // The backgroundColor will come from paperTheme.overlay via the style prop.
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteIcon: {
        position: 'absolute',
        top: -5,
        right: -5
    },
    deleteIconWrapper: {
        padding: 2, // adjust padding as needed
        borderRadius: 12, // half of the icon size (24/2)
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomButtons: {
        height: 100,
        paddingHorizontal: 16,
        paddingTop: 10,
        borderTopWidth: 1,
    },
    touchableButton: { paddingVertical: 6, alignItems: 'center', borderRadius: 6 },
    buttonText: { fontSize: 12, color: '#3C7AD6', fontWeight: '300' },
    // Bottom sheet container for editing fields
    sheetContainer: {
        padding: 16,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sheetHeading: {
        fontSize: 20,
        fontWeight: '600',
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 6,
        padding: 12,
        marginBottom: 16,
    },
    sheetButtonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    sheetButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 4,
    },
    sheetButtonText: {
        color: '#fff', // or use paperTheme.colors.onPrimary if available
        fontSize: 16,
        textAlign: 'center',
    },

    sheetHeading: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    textInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        marginBottom: 16,
    },
});