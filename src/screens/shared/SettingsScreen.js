// src/screens/SettingsScreen.js
import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image
} from 'react-native';
import { useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwitchSelector from 'react-native-switch-selector';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';  // <-- NEW
// If uploading to Firebase Storage, you might import firebase storage methods here

import { AuthContext } from '../../contexts/AuthContext';
import { DatesContext } from '../../contexts/DatesContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { SettingsContext } from '../../contexts/SettingsContext';

import GradientText from '../../components/GradientText';
import CustomAccordion from '../../components/CustomAccordion';
import EditFieldBottomSheet from '../../components/EditFieldBottomSheet';

export default function SettingsScreen() {
    const { userDoc, logout } = useContext(AuthContext);
    const { dates } = useContext(DatesContext);
    const { settingsState, updateProfileField, updatePhotoAtIndex } = useContext(SettingsContext);
    const { themeMode, toggleTheme } = useContext(ThemeContext);

    const navigation = useNavigation();
    const paperTheme = useTheme();

    const [isModalVisible, setModalVisible] = useState(false);
    const [editField, setEditField] = useState(null);

    // For real uploads, you might have your own function:
    async function uploadImageAsync(localUri) {
        // Example placeholder function:
        // Here you'd typically upload 'localUri' to your Firestore storage or S3,
        // returning a downloadable URL. We'll just pretend the local URI is final.
        // In production, do something like:
        // const response = await fetch(localUri);
        // const blob = await response.blob();
        // const storageRef = ref(firebaseStorage, `photos/${Date.now()}.jpg`);
        // await uploadBytes(storageRef, blob);
        // const downloadUrl = await getDownloadURL(storageRef);
        // return downloadUrl;
        return localUri; // dummy
    }

    // (1) Trigger the ImagePicker from expo when a photo slot is tapped
    async function handleChangePhoto(index) {
        // Request media library permissions at runtime
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        // Launch the image library
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, // user can crop
            aspect: [4, 4],      // or whichever aspect
            quality: 1,
        });

        if (!result.canceled) {
            try {
                // Since result might contain multiple picks, let's pick the first
                const picked = result.assets[0]; // expo-image-picker v13 format

                // Optionally upload to storage
                const uploadedUrl = await uploadImageAsync(picked.uri);

                // Update Firestore doc with the new URL
                await updatePhotoAtIndex(index, uploadedUrl);
            } catch (error) {
                alert('Error uploading photo: ' + error.message);
            }
        }
    }

    // (2) For deletion: set that slot to null
    async function handleRemovePhoto(index) {
        try {
            await updatePhotoAtIndex(index, null);
        } catch (error) {
            alert('Error removing photo: ' + error.message);
        }
    }

    // function for editing text fields
    function handleEdit(fieldName) {
        setEditField(fieldName);
        setModalVisible(true);
    }

    async function onSaveField(fieldName, newValue) {
        await updateProfileField(fieldName, newValue);
    }

    // SwitchSelector for theme
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

    const {
        bio,
        height,
        orientation,
        interests,
        education,
        ageRange,
        photos,
    } = settingsState;

    // Logout & delete account
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

    // gradient
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

                    <Text style={[styles.headerTitle, { color: paperTheme.colors.text }]}>
                        Account
                    </Text>

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
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Greeting Section */}
                    <View style={styles.greetingSection}>
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
                        {/* Settings */}
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

                        {/* Photos */}
                        <CustomAccordion
                            title={`Photos (${photos.filter(p => p).length}/6)`}
                            subtitle="Manage or add your profile photos"
                            icon="image"
                            backgroundColor={paperTheme.colors.cardBackground}
                            textColor={paperTheme.colors.text}
                            subtitleColor={paperTheme.colors.secondary}
                        >
                            <View style={styles.photosContainer}>
                                {photos.map((photoUri, index) => (
                                    <View key={`photo_${index}`} style={styles.photoWrapper}>
                                        <TouchableOpacity
                                            style={styles.photoSlot}
                                            onPress={() => handleChangePhoto(index)}
                                        >
                                            {photoUri ? (
                                                <Image
                                                    source={{ uri: photoUri }}
                                                    style={styles.photoImage}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <Icon name="plus" size={30} color="#999" />
                                            )}
                                        </TouchableOpacity>

                                        {/* X icon for deletion if photo exists */}
                                        {photoUri && (
                                            <TouchableOpacity
                                                style={styles.deleteIcon}
                                                onPress={() => handleRemovePhoto(index)}
                                            >
                                                <Icon name="close-circle" size={24} color="red" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </CustomAccordion>

                        {/* My Dates (only if male) */}
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
                                        <Text
                                            key={d.id}
                                            style={[styles.value, { color: paperTheme.colors.text }]}
                                        >
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

                        {/* Membership */}
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
                            <Text style={[styles.value, { color: paperTheme.colors.text }]}>
                                • Free
                            </Text>
                            <Text style={[styles.value, { color: paperTheme.colors.text }]}>
                                • Premium
                            </Text>
                            <Text style={[styles.value, { color: paperTheme.colors.text }]}>
                                • Diamond
                            </Text>
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

                {/* Edit Field Bottom Sheet */}
                <EditFieldBottomSheet
                    isVisible={isModalVisible}
                    onClose={() => setModalVisible(false)}
                    fieldName={editField}
                    initialValue={settingsState[editField] ? String(settingsState[editField]) : ''}
                    onSave={onSaveField}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1 },

    // Header
    header: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
        zIndex: 2,
    },
    headerTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        zIndex: 1,
    },
    themeToggle: {
        width: 70,
        marginLeft: 'auto',
        zIndex: 2,
    },

    // Scroll
    scrollView: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    // Greeting
    greetingSection: { marginBottom: 24 },
    headerText: { fontSize: 22, fontWeight: '600' },
    subText: { fontSize: 14, marginTop: 4 },

    // Accordion
    accordionSection: {},

    // Fields
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        width: 100,
        fontWeight: 'bold',
    },
    value: {
        flex: 1,
        marginRight: 6,
    },
    divider: {
        marginVertical: 4,
    },

    // Photos
    photosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    photoWrapper: {
        position: 'relative',
        margin: '2%',
    },
    photoSlot: {
        width: 100,
        height: 100,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    photoImage: {
        width: '100%',
        height: '100%',
    },
    deleteIcon: {
        position: 'absolute',
        top: -5,
        right: -5,
    },

    // Bottom
    bottomButtons: {
        height: 100,
        paddingHorizontal: 16,
        paddingTop: 10,
        borderTopWidth: 1,
    },
    touchableButton: {
        paddingVertical: 6,
        alignItems: 'center',
        borderRadius: 6,
    },
    buttonText: {
        fontSize: 12,
        color: '#3C7AD6',
        fontWeight: '300',
    },
});