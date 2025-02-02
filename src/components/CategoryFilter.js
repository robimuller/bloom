// src/components/CategoryFilter.js
import React, { useState, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, ScrollView } from 'react-native';
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
        gradientColors: ['#FF7E5F', '#FD3A69'],
    },
    {
        id: 'trending',
        label: 'Trending',
        subtitle: 'See profiles that are popular right now',
        gradientColors: ['#4ECDC4', '#556270'],
    },
    {
        id: 'new',
        label: 'New Arrivals',
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
        label: 'Top Picks',
        subtitle: 'Our recommended selection for you',
        gradientColors: ['#FCE38A', '#F38181'],
    },
    {
        id: 'online',
        label: 'Online Now',
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
        gradientColors: ['#FFC371', '#FF5F6D'],
    },
    {
        id: 'trending',
        label: 'Trending',
        subtitle: 'Check out dates that are popular right now',
        gradientColors: ['#4ECDC4', '#556270'],
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
        label: 'Recommendations',
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

// Mapping for overlay icons using MaterialCommunityIcons.
// Adjust icon names as needed.
const categoryLogos = {
    all: 'apps',
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

export default function CategoryFilter({ onSelect }) {
    const theme = useTheme();
    const { gender } = useContext(AuthContext); // Get the user's gender from AuthContext

    // Determine app type based on gender:
    // - If gender === 'male', then use the men's app category set.
    // - Otherwise, use the women's app category set.
    const appType = gender === 'male' ? 'men' : 'women';
    const categories = appType === 'men' ? categoriesMen : categoriesWomen;

    // Default selected category is "all"
    const [selected, setSelected] = useState('all');

    // Handler for when a category is pressed.
    const handlePress = (categoryId) => {
        setSelected(categoryId);
        if (onSelect) {
            onSelect(categoryId);
        }
    };

    // Helper to get the data (title and subtitle) for the selected category.
    // For "all", we provide default text.
    const getCategoryData = (categoryId) => {
        if (categoryId === 'all') {
            return { label: 'All', subtitle: 'Browse all available profiles' };
        }
        return categories.find((cat) => cat.id === categoryId) || {};
    };

    // Render a category button with a LinearGradient background and an overlaid icon.
    const renderCategoryButton = (gradientColors, logoName, isSelected, onPress) => (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.categoryButton,
                isSelected ? styles.selectedButton(theme) : styles.unselectedButton,
            ]}
            activeOpacity={0.8}
        >
            <LinearGradient colors={gradientColors} style={styles.linearGradient}>
                <MaterialCommunityIcons name={logoName} style={[styles.logo, { color: theme.colors.background }]} />
            </LinearGradient>
        </TouchableOpacity>
    );

    // Retrieve the currently selected category data.
    const currentCategory = getCategoryData(selected);

    return (
        <View style={{ paddingLeft: 10 }}>
            {/* The static header is removed */}
            <View style={styles.container}>
                {/* Fixed "All" category on the left */}
                <View style={styles.fixedCategory}>
                    {renderCategoryButton(
                        ['#CCCCCC', '#AAAAAA'], // Default gradient for "All"
                        categoryLogos.all,
                        selected === 'all',
                        () => handlePress('all')
                    )}
                    <Text style={[styles.categoryLabel, { color: theme.colors.text }]}>All</Text>
                </View>

                {/* Other categories in a horizontal ScrollView */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                >
                    {categories.map((cat) => (
                        <View key={cat.id} style={styles.categoryItem}>
                            {renderCategoryButton(
                                cat.gradientColors,
                                categoryLogos[cat.id],
                                selected === cat.id,
                                () => handlePress(cat.id)
                            )}
                            <View>
                                <Text style={[styles.categoryLabel, { color: theme.colors.secondary }]}>
                                    {cat.label}
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Dynamic title and subtitle based on the selected category (if not "all") */}
            {selected !== 'all' && (
                <View style={styles.categoryDetailsContainer}>
                    <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
                        {currentCategory.label}
                    </Text>
                    <Text style={[styles.categorySubtitle, { color: theme.colors.secondary }]}>
                        {currentCategory.subtitle}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fixedCategory: {
        alignItems: 'center',
        marginRight: 8,
    },
    scrollContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryItem: {
        alignItems: 'center',
        marginRight: 16,
    },
    categoryButton: {
        width: 80,
        height: 80,
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    selectedButton: (theme) => ({
        borderColor: theme.colors.primary || '#6200ee',
        backgroundColor: theme.colors.accent || '#e0e0e0',
    }),

    linearGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        fontSize: 30,
        color: '#fff',
    },
    categoryLabel: {
        marginTop: 4,
        fontSize: 12,
        textAlign: 'center',
    },
    categoryDetailsContainer: {
        marginTop: 16,
        paddingHorizontal: 10,
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