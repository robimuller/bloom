import React, { useContext, useState, useRef } from 'react';
import {
    View,
    FlatList,
    Alert,
    StyleSheet,
    Text,
    Dimensions,
} from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';

import { DatesContext } from '../../contexts/DatesContext';
import { RequestsContext } from '../../contexts/RequestsContext';
import { getDateCategory } from '../../utils/dateCategory';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WomenFeedScreen() {
    const { dates, loadingDates } = useContext(DatesContext);
    const { sendRequest } = useContext(RequestsContext);

    // Get Paper’s theme (already merged from your createPaperTheme)
    const { colors } = useTheme();

    const handleRequest = async (dateId, hostId) => {
        try {
            await sendRequest({ dateId, hostId });
            Alert.alert('Request Sent', 'Your request to join this date has been sent!');
        } catch (error) {
            console.error('Error requesting date:', error);
            Alert.alert('Error', 'Could not send request. Please try again.');
        }
    };

    const renderItem = ({ item }) => {
        const dateCategory = getDateCategory(item.date || '');

        return (
            <View
                // The card container uses theme’s “cardBackground” color
                style={[styles.cardContainer, { backgroundColor: colors.cardBackground }]}
            >
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
                        {/* Host name in theme’s text color */}
                        <Text style={[styles.hostName, { color: colors.text }]}>
                            {item.host?.displayName || 'Unknown'}
                            {item.host?.age ? `, ${item.host.age}` : ''}
                        </Text>
                    </View>
                    <Ionicons
                        name="flag-outline"
                        size={20}
                        color={colors.onSurface ?? '#666'} // fallback
                        style={{ marginRight: 8 }}
                    />
                </View>

                {/* Carousel */}
                <Carousel
                    photos={item.photos || []}
                    onRequest={() => handleRequest(item.id, item.hostId)}
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

function Carousel({ photos, onRequest }) {
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
            <View style={[
                styles.overlayTopRight,
                { backgroundColor: colors.overlay } // theme-based overlay
            ]}>
                <Text style={[styles.indexText, { color: colors.onBackground }]}>
                    {currentIndex + 1}/{photos.length}
                </Text>
            </View>
            <View style={styles.overlayBottomRight}>
                <Button
                    icon={() => <Ionicons name="paper-plane" size={18} color={colors.onPrimary} />}
                    mode="contained"
                    onPress={onRequest}
                    // Use the theme’s primary color
                    buttonColor={colors.primary}
                    style={styles.requestButton}
                    labelStyle={[styles.requestButtonText, { color: colors.onPrimary }]}
                >
                    Request
                </Button>
            </View>
        </View>
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
    overlayBottomRight: {
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    requestButton: {
        borderRadius: 20,
    },
    requestButtonText: {
        fontSize: 14,
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