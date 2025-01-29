// src/screens/SettingsScreen.js
import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { useTheme, Divider } from 'react-native-paper';
import SwitchSelector from 'react-native-switch-selector';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { AuthContext } from '../../contexts/AuthContext';
import { DatesContext } from '../../contexts/DatesContext';
import { ThemeContext } from '../../contexts/ThemeContext';

import GradientText from '../../components/GradientText';
import CustomAccordion from '../../components/CustomAccordion';

export default function SettingsScreen() {
    const { userDoc, logout } = useContext(AuthContext);
    const { dates } = useContext(DatesContext);
    const { themeMode, toggleTheme } = useContext(ThemeContext);

    const paperTheme = useTheme();
    const navigation = useNavigation();

    // Example placeholders for user’s data
    const email = userDoc?.email || 'test@test.ioo';
    const bio = userDoc?.bio || '';
    const gender = userDoc?.gender || 'Male';
    const orientation = userDoc?.sexualOrientation || 'Straight';
    const education = userDoc?.education || 'University';
    const interests = userDoc?.interests || [];

    const handleLogout = async () => {
        try {
            await logout();
            alert('You have successfully logged out.');
        } catch (error) {
            alert(`Error logging out: ${error.message}`);
        }
    };

    const handleDeleteAccount = async () => {
        alert('Account deletion is not yet implemented.');
    };

    // SwitchSelector options for theme toggle
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

    // Determine gradient colors based on current theme
    const gradientColors =
        themeMode === 'light'
            ? [paperTheme.colors.primary, paperTheme.colors.accent]
            : [paperTheme.colors.primary, paperTheme.colors.accent];

    return (
        <SafeAreaView
            style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}
            edges={['top']}
        >
            <View style={styles.container}>

                {/* Custom Header */}
                <View style={styles.header}>
                    {/* Back Button */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={24} color={paperTheme.colors.text} />
                    </TouchableOpacity>

                    {/* Centered Title */}
                    <Text style={[styles.headerTitle, { color: paperTheme.colors.text }]}>
                        Account
                    </Text>

                    {/* Theme Toggle on the Right */}
                    <SwitchSelector
                        options={themeOptions}
                        initial={themeMode === 'light' ? 0 : 1}
                        onPress={(value) => {
                            if (value !== themeMode) {
                                toggleTheme();
                            }
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
                        {/* SETTINGS Accordion */}
                        <CustomAccordion
                            title="Settings"
                            subtitle="Edit your preferences and details"
                            icon="cog"
                            backgroundColor={paperTheme.colors.cardBackground}
                            textColor={paperTheme.colors.text}
                            subtitleColor={paperTheme.colors.secondary}
                        >
                            <Text style={[styles.label, { color: paperTheme.colors.text }]}>
                                Email:
                            </Text>
                            <Text style={[styles.value, { color: paperTheme.colors.text }]}>
                                {email}
                            </Text>
                            <Divider style={styles.divider} />

                            <Text style={[styles.label, { color: paperTheme.colors.text }]}>
                                Bio:
                            </Text>
                            <Text style={[styles.value, { color: paperTheme.colors.text }]}>
                                {bio}
                            </Text>
                            <Divider style={styles.divider} />

                            <Text style={[styles.label, { color: paperTheme.colors.text }]}>
                                Gender:
                            </Text>
                            <Text style={[styles.value, { color: paperTheme.colors.text }]}>
                                {gender}
                            </Text>
                            <Divider style={styles.divider} />

                            <Text style={[styles.label, { color: paperTheme.colors.text }]}>
                                Sexual Orientation:
                            </Text>
                            <Text style={[styles.value, { color: paperTheme.colors.text }]}>
                                {orientation}
                            </Text>
                            <Divider style={styles.divider} />

                            <Text style={[styles.label, { color: paperTheme.colors.text }]}>
                                Education:
                            </Text>
                            <Text style={[styles.value, { color: paperTheme.colors.text }]}>
                                {education}
                            </Text>
                            <Divider style={styles.divider} />

                            <Text style={[styles.label, { color: paperTheme.colors.text }]}>
                                Interests:
                            </Text>
                            <Text style={[styles.value, { color: paperTheme.colors.text }]}>
                                {Array.isArray(interests) ? interests.join(', ') : interests}
                            </Text>
                        </CustomAccordion>

                        {/* PHOTOS Accordion */}
                        <CustomAccordion
                            title="Photos (0/6)"
                            subtitle="Manage or add your profile photos"
                            icon="image"
                            backgroundColor={paperTheme.colors.cardBackground}
                            textColor={paperTheme.colors.text}
                            subtitleColor={paperTheme.colors.secondary}
                        >
                            <Text style={[styles.value, { color: paperTheme.colors.text }]}>
                                Here you would render the user’s photos or an “Add Photo” button.
                            </Text>
                        </CustomAccordion>

                        {/* MY DATES (Only if user is male) */}
                        {gender.toLowerCase() === 'male' && (
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

                        {/* MEMBERSHIP Accordion */}
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

                {/* Fixed Bottom Buttons */}
                <View
                    style={[
                        styles.bottomButtons,
                        {
                            borderTopColor: paperTheme.colors.onSecondary
                        }
                    ]}
                >
                    {/* Log Out */}
                    <TouchableOpacity onPress={handleLogout} style={styles.touchableButton}>
                        <Text style={[styles.buttonText]}>
                            Log Out
                        </Text>
                    </TouchableOpacity>

                    <View style={{ height: 10 }} />

                    {/* Delete My Account */}
                    <TouchableOpacity onPress={handleDeleteAccount} style={styles.touchableButton}>
                        <Text style={[styles.buttonText, { color: paperTheme.colors.secondary }]}>
                            Delete my account
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    greetingSection: {
        marginBottom: 24,
    },
    headerText: {
        fontSize: 22,
        fontWeight: '600',
    },
    subText: {
        fontSize: 10,
        marginTop: 4,
    },
    accordionSection: {
        // styling for accordions area
    },
    label: {
        fontWeight: 'bold',
        marginTop: 8,
    },
    value: {
        marginBottom: 8,
    },
    divider: {
        marginVertical: 4,
    },
    bottomButtons: {
        height: 100,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    touchableButton: {
        paddingVertical: 6,
        alignItems: 'center',
        borderRadius: 6,
    },
    buttonText: {
        fontSize: 12,
        color: "#3C7AD6",
        fontWeight: "300",
    },
});