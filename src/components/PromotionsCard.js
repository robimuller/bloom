// src/components/PromotionsCard.js
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

const PromotionsCard = ({ promotion, onPress }) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.previewCard, { backgroundColor: colors.background }]}
            onPress={() => onPress(promotion)}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: promotion.photos[0] }}
                    style={styles.previewImage}
                />
                {/* Discount badge overlay */}
                <View style={[styles.discountBadge, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.discountText, { color: colors.primary }]}>
                        {promotion.discountPercentage}% Off
                    </Text>
                </View>
            </View>
            <View style={styles.content}>
                <Text style={[styles.previewName, { color: colors.text }]}>
                    {promotion.title}
                </Text>
                <Text
                    style={[styles.previewLocation, { color: colors.secondary }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {promotion.description}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    previewCard: {
        width: 200,
        marginRight: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: 225,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    discountBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    discountText: {
        fontSize: 10,
        fontWeight: '600',
    },
    content: {
        marginTop: 8,
        paddingHorizontal: 8,
    },
    previewName: {
        fontSize: 18,
        fontWeight: '600',
    },
    previewLocation: {
        fontSize: 14,
        marginTop: 4,
    },
});

export default PromotionsCard;