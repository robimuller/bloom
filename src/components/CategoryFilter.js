// src/components/CategoryFilter.js
import React, { useState, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../contexts/AuthContext';

// Categories for Men's App (male users see women's profiles)
const categoriesMen = [
    {
        id: 'explore',
        label: 'Explore',
        subtitle: 'Browse women’s profiles by style and vibe',
    },
    {
        id: 'trending',
        label: 'Trending',
        subtitle: 'See profiles that are popular right now',
    },
    {
        id: 'new',
        label: 'New',
        subtitle: 'Discover the latest profiles joining',
    },
    {
        id: 'nearby',
        label: 'Nearby',
        subtitle: 'Find profiles in your vicinity',
    },
    {
        id: 'top',
        label: 'Top',
        subtitle: 'Our recommended selection for you',
    },
    {
        id: 'online',
        label: 'Online',
        subtitle: 'Connect with profiles that are active',
    },
    {
        id: 'featured',
        label: 'Featured',
        subtitle: 'Handpicked profiles for quality connections',
    },
];

// Categories for Women's App (female users see men's dates)
const categoriesWomen = [
    {
        id: 'discover',
        label: 'Discover',
        subtitle: 'Find dates that match your interests',
    },
    {
        id: 'trending',
        label: 'Trending',
        subtitle: 'Check out dates that are popular right now',
    },
    {
        id: 'latest',
        label: 'Latest',
        subtitle: 'See the newest dates posted',
    },
    {
        id: 'nearby',
        label: 'Nearby',
        subtitle: 'Find dates happening in your area',
    },
    {
        id: 'recommend',
        label: 'For You',
        subtitle: 'Personalized date suggestions for you',
    },
    {
        id: 'active',
        label: 'Active',
        subtitle: 'Dates available right now',
    },
    {
        id: 'featured',
        label: 'Featured',
        subtitle: 'Highlighted dates for quality experiences',
    },
];

// Mapping for icons using MaterialCommunityIcons.
const categoryLogos = {
    // For Men's App
    explore: 'compass-outline',
    trending: 'fire',
    new: 'new-box',
    nearby: 'map-marker-radius',
    top: 'star',
    online: 'wifi',
    featured: 'check-decagram',
    // For Women's App
    discover: 'magnify',
    latest: 'new-box',
    recommend: 'thumb-up',
    active: 'clock-outline',
};

const CategoryGridItem = ({ category, isSelected, onPress, theme }) => {
    return (
        <TouchableOpacity onPress={() => onPress(category.id)} activeOpacity={0.8} style={styles.touchable}>
            <View style={styles.gridItem}>
                <View style={[styles.circle, { backgroundColor: theme.colors.cardBackground }]}>
                    <MaterialCommunityIcons
                        name={categoryLogos[category.id]}
                        size={24}
                        color={theme.colors.text}
                        style={styles.icon}
                    />
                </View>
                <Text style={[styles.categoryLabel, { color: theme.colors.secondary }]}>
                    {category.label}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export default function CategoryFilter({ onSelect }) {
    const theme = useTheme();
    const { gender } = useContext(AuthContext); // Get the user's gender

    // Select the appropriate category set based on gender.
    const appType = gender === 'male' ? 'men' : 'women';
    const categories = appType === 'men' ? categoriesMen : categoriesWomen;

    // Set the default selected category.
    const [selected, setSelected] = useState(categories[0].id);

    const handlePress = (categoryId) => {
        setSelected(categoryId);
        if (onSelect) {
            onSelect(categoryId);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                {categories.map((cat) => (
                    <CategoryGridItem
                        key={cat.id}
                        category={cat}
                        isSelected={selected === cat.id}
                        onPress={handlePress}
                        theme={theme}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
    },
    scrollContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    touchable: {
        alignItems: 'center',
        marginRight: 16,
    },
    gridItem: {
        alignItems: 'center',
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        // Optional: Additional styling for the icon can go here.
    },
    categoryLabel: {
        marginTop: 8,
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
});