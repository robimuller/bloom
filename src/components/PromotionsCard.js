// src/components/PromotionsCard.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AuthContext } from '../contexts/AuthContext';

const PromotionsCard = ({ promotion, onPress }) => {
    const theme = useTheme();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.backgroundColor }]}
            onPress={() => onPress(promotion)}
            activeOpacity={0.9}
        >
            {/* Image container with discount overlay */}
            <View style={styles.imageContainer}>
                <Image source={{ uri: promotion.photos[0] }} style={styles.image} />
                <View style={[styles.discountBadge, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.discountText, { color: theme.colors.primary }]}>
                        {promotion.discountPercentage}% Off
                    </Text>
                </View>
            </View>

            {/* Content area: title and one-line description */}
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{promotion.title}</Text>
                <Text
                    style={[styles.description, { color: theme.colors.secondary }]}
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
    card: {
        borderRadius: 20,
        marginRight: 12,
        width: 250,
        overflow: 'hidden', // Ensures that the discount badge is clipped if necessary
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 150,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        // Adding a subtle shadow for a modern feel
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
    title: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        marginTop: 4,
        maxWidth: '95%', // Limit the description width to 95% of the card
    },
    buttonContainer: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 8,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default PromotionsCard;