// src/components/CategoryFilter.js
import React, { useState, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaskedView from '@react-native-masked-view/masked-view';
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
        gradientColors: ['#FF6B6B', '#EF4848'],
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
        gradientColors: ['#FF6B6B', '#EF4848'],
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

const CategoryGridItem = ({ category, isSelected, onPress, theme }) => {
    return (
        <TouchableOpacity onPress={() => onPress(category.id)} activeOpacity={0.8} style={styles.touchable}>
            <View style={styles.gridItem}>
                <LinearGradient
                    colors={category.gradientColors}
                    style={styles.gradientBorder}
                >
                    <View style={[styles.innerCircle, { backgroundColor: theme.colors.background }]}>
                        <MaskedView
                            maskElement={
                                <MaterialCommunityIcons
                                    name={categoryLogos[category.id]}
                                    size={20}
                                    color="black"
                                    style={styles.icon}
                                />
                            }
                        >
                            <LinearGradient
                                colors={category.gradientColors}
                                style={styles.iconGradient}
                            />
                        </MaskedView>
                    </View>
                </LinearGradient>
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
        paddingHorizontal: 10,
    },
    touchable: {
        alignItems: 'center',
        marginRight: 16,
    },
    gridItem: {
        alignItems: 'center',
    },
    gradientBorder: {
        width: 60,
        height: 60,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconGradient: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    icon: {
        // This style is used by the mask element; no extra styling needed here.
    },
    categoryLabel: {
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
});