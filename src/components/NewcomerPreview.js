import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Image } from 'expo-image';

function NewcomerPreview({ item, onPress }) {
    const { colors } = useTheme();

    return (
        <TouchableOpacity style={styles.newcomerPreviewCard} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.imageWrapper}>
                {/* Clipped circular image */}
                <View style={styles.newcomerImageContainer}>
                    <Image
                        source={
                            typeof item.photos[0] === 'string'
                                ? { uri: item.photos[0] }
                                : item.photos[0]
                        }
                        style={styles.newcomerImage}
                    />
                </View>
                {/* Badge positioned over the image */}
                <View style={[styles.badgeContainer, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.badgeText, { color: colors.black }]}>New!</Text>
                </View>
            </View>
            <Text style={[styles.newcomerName, { color: colors.text }]} numberOfLines={1}>
                {item.firstName}
            </Text>
        </TouchableOpacity>
    );
}

export default NewcomerPreview;

const styles = StyleSheet.create({
    newcomerPreviewCard: {
        width: 80,
        alignItems: 'center',
        marginRight: 16,
    },
    imageWrapper: {
        position: 'relative',
        width: 60,
        height: 60,
    },
    newcomerImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
    },
    newcomerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    badgeContainer: {
        position: 'absolute',
        bottom: 0, // Adjust to position above the circle
        right: -8, // Adjust to position to the right of the circle
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
    },
    newcomerName: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
});