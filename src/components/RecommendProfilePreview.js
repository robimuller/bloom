// RecommendProfilePreview.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from 'react-native-paper';
import { calculateAge } from '../utils/deduceAge';

const RecommendProfilePreview = ({ item, navigation }) => {
    const { colors } = useTheme();
    const age = calculateAge(item.birthday);

    return (
        <TouchableOpacity
            style={styles.previewCard}
            onPress={() => navigation.navigate('MenFeed', { section: 'recommended', initialItemId: item.id })}
            activeOpacity={0.8}
        >
            <Image
                source={
                    typeof item.photos[0] === 'string'
                        ? { uri: item.photos[0] }
                        : item.photos[0]
                }
                style={styles.previewImage}
            />
            <Text style={[styles.previewName, { color: colors.text }]} numberOfLines={1}>
                {item.firstName}{age ? `, ${age}` : ''}
            </Text>
            {item.location && (
                <Text style={[styles.previewLocation, { color: colors.secondary }]} numberOfLines={1}>
                    {item.location}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default RecommendProfilePreview;

const styles = StyleSheet.create({
    previewCard: {
        width: 200,
        marginRight: 16,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: 225,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    previewName: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
    },
    previewLocation: {
        fontSize: 14,
        marginTop: 4,
    },
});