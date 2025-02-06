// src/components/CategoryFilter.js
import React, { useState, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../contexts/AuthContext';

// Categories for Men's App (male users see women's profiles)
const categoriesMen = [
    {
        id: 'explore',
        label: 'Explore',
        subtitle: 'Browse women’s profiles by style and vibe',
        gradientColors: ['#D769C5', '#8F4AE7'],
    },
    {
        id: 'trending',
        label: 'Trending',
        subtitle: 'See profiles that are popular right now',
        gradientColors: ['#E1D246', '#ffa10a'],
    },
    {
        id: 'new',
        label: 'New',
        subtitle: 'Discover the latest profiles joining',
        gradientColors: ['#FF6B6B', '#FFD93D'],
    },
    {
        id: 'nearby',
        label: 'Nearby',
        subtitle: 'Find profiles in your vicinity',
        gradientColors: ['#2BC0E4', '#EAECC6'],
    },
    {
        id: 'top',
        label: 'Top',
        subtitle: 'Our recommended selection for you',
        gradientColors: ['#FCE38A', '#F38181'],
    },
    {
        id: 'online',
        label: 'Online',
        subtitle: 'Connect with profiles that are active',
        gradientColors: ['#1D976C', '#93F9B9'],
    },
    {
        id: 'featured',
        label: 'Featured',
        subtitle: 'Handpicked profiles for quality connections',
        gradientColors: ['#A18CD1', '#FBC2EB'],
    },
];

// Categories for Women's App (female users see men's dates)
const categoriesWomen = [
    {
        id: 'discover',
        label: 'Discover',
        subtitle: 'Find dates that match your interests',
        gradientColors: ['#D769C5', '#8F4AE7'],
    },
    {
        id: 'trending',
        label: 'Trending',
        subtitle: 'Check out dates that are popular right now',
        gradientColors: ['#E1D246', '#ffa10a'],
    },
    {
        id: 'latest',
        label: 'Latest',
        subtitle: 'See the newest dates posted',
        gradientColors: ['#FF6B6B', '#FFD93D'],
    },
    {
        id: 'nearby',
        label: 'Nearby',
        subtitle: 'Find dates happening in your area',
        gradientColors: ['#2BC0E4', '#EAECC6'],
    },
    {
        id: 'recommend',
        label: 'For You',
        subtitle: 'Personalized date suggestions for you',
        gradientColors: ['#FCE38A', '#F38181'],
    },
    {
        id: 'active',
        label: 'Active',
        subtitle: 'Dates available right now',
        gradientColors: ['#1D976C', '#93F9B9'],
    },
    {
        id: 'featured',
        label: 'Featured',
        subtitle: 'Highlighted dates for quality experiences',
        gradientColors: ['#A18CD1', '#FBC2EB'],
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

// New grid item component – the entire item is the button.
// The item is split into two sections: left (gradient background with the icon)
// and right (text label).
const CategoryGridItem = ({ category, isSelected, onPress, theme }) => {
    return (
        <TouchableOpacity
            onPress={() => onPress(category.id)}
            activeOpacity={0.8}
            style={[styles.gridItem, { backgroundColor: theme.colors.cardBackground }, isSelected && styles.selectedGridItem]}
        >
            <View style={styles.itemContent}>
                {/* Left section with linear gradient background and centered icon */}
                <LinearGradient
                    colors={category.gradientColors}
                    style={styles.leftSection}
                >
                    <MaterialCommunityIcons
                        name={categoryLogos[category.id]}
                        size={24}
                        color={theme.colors.background}
                    />
                </LinearGradient>
                {/* Right section with the category label */}
                <View style={styles.rightSection}>
                    <Text style={[styles.categoryLabel, { color: theme.colors.text }]}>
                        {category.label}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function CategoryFilter({ onSelect }) {
    const theme = useTheme();
    const { gender } = useContext(AuthContext); // Get the user's gender

    // Use the appropriate category set based on gender.
    const appType = gender === 'male' ? 'men' : 'women';
    const categories = appType === 'men' ? categoriesMen : categoriesWomen;

    // For a grid with 2 columns and 3 rows, display 6 items.
    const NUM_GRID_ITEMS = 6;
    const gridCategories = categories.slice(0, NUM_GRID_ITEMS);

    // Set the default selected category.
    const [selected, setSelected] = useState(gridCategories[0].id);

    const handlePress = (categoryId) => {
        setSelected(categoryId);
        if (onSelect) {
            onSelect(categoryId);
        }
    };

    // Get details of the selected category.
    const currentCategory = categories.find((cat) => cat.id === selected) || {};

    return (
        <View style={{ paddingHorizontal: 10 }}>
            {/* Grid container */}
            <View style={styles.gridContainer}>
                {gridCategories.map((cat) => (
                    <CategoryGridItem
                        key={cat.id}
                        category={cat}
                        isSelected={selected === cat.id}
                        onPress={handlePress}
                        theme={theme}
                    />
                ))}
            </View>

            {/* Selected category details */}
            <View style={styles.categoryDetailsContainer}>
                <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
                    {currentCategory.label}
                </Text>
                <Text style={[styles.categorySubtitle, { color: theme.colors.secondary }]}>
                    {currentCategory.subtitle}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    gridItem: {
        width: '48%', // Two columns
        marginBottom: 4,
        borderRadius: 6,
        // Optional: subtle shadow
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.2,
        // shadowRadius: 2,
        // elevation: 2,
        height: 60
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftSection: {
        flex: 0.4,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        // Only round the left corners to match the grid item's borderRadius
        borderTopLeftRadius: 6,
        borderBottomLeftRadius: 6,
    },
    rightSection: {
        flex: 0.6,
        justifyContent: 'center',
        paddingLeft: 10,
    },
    categoryLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    categoryDetailsContainer: {
        marginTop: 16,
    },
    categoryTitle: {
        fontSize: 22,
        fontWeight: '600',
    },
    categorySubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
});