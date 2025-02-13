// src/components/PromotionSummaryBanner.js
import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const PromotionSummaryBanner = ({ promotion, onRemove, onPressBanner }) => {
    const { colors } = useTheme();

    // Animated values for opacity and scale.
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Animate both opacity (fade in) and scale (grow) in parallel.
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, scaleAnim]);

    if (!promotion) return null;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPressBanner}
            style={styles.wrapper}
        >
            <Animated.View
                style={[
                    styles.container,
                    {
                        backgroundColor: colors.primary,
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Image source={{ uri: promotion.photos[0] }} style={styles.thumbnail} />
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.background }]} numberOfLines={1}>
                        {promotion.title}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.onSurface }]}>
                        {promotion.discountPercentage}% Off
                    </Text>
                </View>
                {/* Remove icon */}
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation(); // Prevent banner onPress from firing
                        onRemove && onRemove();
                    }}
                    style={styles.removeButton}
                >
                    <Ionicons name="close-circle-outline" size={24} color={colors.background} />
                </TouchableOpacity>
                {/* Promo sticker positioned at bottom center */}
                <View style={[styles.stickerContainer, { borderColor: colors.primary, backgroundColor: colors.background }]}>
                    <Ionicons name="attach-outline" size={20} color={colors.primary} />
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        // This wrapper captures the overall onPress event for the banner.
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12,
        paddingRight: 8,
        marginVertical: 8,
        elevation: 4,
        height: 70,
        position: 'relative', // Enables absolute positioning for the sticker
    },
    thumbnail: {
        width: 70,
        height: 70,
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    removeButton: {
        padding: 6,
    },
    stickerContainer: {
        position: 'absolute',
        bottom: -20,
        left: '47%',
        alignSelf: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff', // Sticker background for contrast
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000', // Adjust as needed for your design
    },
});

export default PromotionSummaryBanner;