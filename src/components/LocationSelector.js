// src/components/LocationSelector.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useTheme } from 'react-native-paper';
import { SettingsContext } from '../contexts/SettingsContext';
import { getCurrentLocation } from '../utils/locationServices';

const LocationSelector = () => {
    const theme = useTheme();
    const { settingsState, updateProfileField } = useContext(SettingsContext);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const autocompleteRef = useRef(null);

    // Set the API key from your environment variable.
    useEffect(() => {
        setApiKey(process.env.GOOGLE_PLACES_API_KEY || '');
    }, []);

    // Get current location from settings; default to "City" if not set.
    const currentLocation = settingsState.location || 'City';

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const handleUseCurrentLocation = async () => {
        setLoadingCurrentLocation(true);
        try {
            const location = await getCurrentLocation();
            await updateProfileField('location', location);
        } catch (error) {
            console.error('Failed to get current location:', error);
        } finally {
            setLoadingCurrentLocation(false);
            setDropdownOpen(false);
        }
    };

    const handlePlaceSelect = (data, details = null) => {
        const selectedLocation = data.description;
        updateProfileField('location', selectedLocation);
        setDropdownOpen(false);
    };

    return (
        <View style={styles.container}>
            {/* Closed state: a small button with icon, text, and dropdown arrow */}
            <TouchableOpacity style={[styles.closedButton, { backgroundColor: "transparent" }]} onPress={toggleDropdown}>
                <Ionicons name="location-outline" size={16} color={theme.colors.primary} />
                <Text style={[styles.locationText, { color: theme.colors.text }]}>
                    {currentLocation}
                </Text>
                <Ionicons
                    name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={theme.colors.text}
                />
            </TouchableOpacity>

            {/* Dropdown view: appears when tapped */}
            {isDropdownOpen && (
                <View
                    style={[
                        styles.dropdown,
                        {
                            backgroundColor: theme.colors.cardBackground,
                            borderColor: theme.colors.cardBackground,
                            borderWidth: 1
                        },
                    ]}
                >
                    <TouchableOpacity style={styles.dropdownItem} onPress={handleUseCurrentLocation}>
                        {loadingCurrentLocation ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                            <>
                                <Ionicons
                                    name="locate-outline"
                                    size={16}
                                    color={theme.colors.primary}
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={[styles.dropdownText, { color: theme.colors.text }]}>
                                    Use my current location
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <GooglePlacesAutocomplete
                        ref={autocompleteRef}
                        placeholder="Search location"
                        minLength={2}
                        fetchDetails={true}
                        query={{
                            key: apiKey,
                            language: 'en',
                            type: '(cities)'
                        }}
                        onFail={(error) => console.log('Autocomplete Error:', error)}
                        onNotFound={() => console.log('No results found')}
                        onPress={handlePlaceSelect}
                        textInputProps={{
                            placeholderTextColor: theme.colors.onBackground,
                        }}
                        styles={{
                            textInputContainer: styles.autocompleteContainer,
                            textInput: {
                                color: theme.colors.text, fontSize: 14, backgroundColor: theme.colors.background,
                            },
                            listView: {
                                backgroundColor: theme.colors.cardBackground,
                                zIndex: 1000,
                                elevation: 10,
                                maxHeight: 150,
                                marginTop: 5,
                                borderRadius: 8,
                            },
                            row: {
                                backgroundColor: theme.colors.background,
                                height: 40,
                            },
                            separator: {
                                height: 0,
                            },
                            description: {
                                color: theme.colors.text,
                                fontSize: 14,
                            },
                        }}
                        enablePoweredByContainer={false}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // Remove width: '100%' to prevent the parent from expanding.
        position: 'relative',
        alignSelf: 'center', // Ensures the container only takes up as much space as needed.
    },
    closedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    locationText: {
        marginHorizontal: 4,
        fontSize: 14,
        fontWeight: 'bold',
    },
    dropdown: {
        position: 'absolute',
        top: 40, // Adjust based on your header height.
        width: 300, // The dropdown's width (can be changed as needed).
        padding: 8,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        zIndex: 1000,
        marginLeft: "-55",
        height: 150
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
    },
    dropdownText: {
        fontSize: 14,
    },
    autocompleteContainer: {
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        borderBottomWidth: 0,
        paddingHorizontal: 0,
    },
});

export default LocationSelector;