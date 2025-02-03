// src/components/CategoryFilter.js
import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
    ScrollView,
    Animated,
} from 'react-native';
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

// Mapping for overlay icons using MaterialCommunityIcons.
// Adjust icon names as needed.
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

/**
 * AnimatedCategoryButton
 *
 * This component wraps the category button with an Animated.View. When the button's
 * `isSelected` prop changes, it animates its scale and opacity.
 */
const AnimatedCategoryButton = ({ gradientColors, logoName, isSelected, onPress, theme }) => {
    // Create animated values for scale and opacity.
    const scaleAnim = useRef(new Animated.Value(isSelected ? 1.2 : 1)).current;
    const opacityAnim = useRef(new Animated.Value(isSelected ? 1 : 0.6)).current;

    useEffect(() => {
        // Animate both scale and opacity in parallel.
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: isSelected ? 1.2 : 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: isSelected ? 1 : 0.6,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isSelected, scaleAnim, opacityAnim]);

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.categoryButton}>
                {isSelected ? (
                    <LinearGradient colors={gradientColors} style={styles.linearGradient}>
                        <MaterialCommunityIcons
                            name={logoName}
                            style={[styles.logo, { color: theme.colors.background }]}
                        />
                    </LinearGradient>
                ) : (
                    <LinearGradient colors={gradientColors} style={styles.gradientBorder}>
                        <View style={[styles.innerCircle, { backgroundColor: theme.colors.background }]}>
                            <MaterialCommunityIcons
                                name={logoName}
                                style={[styles.logo, { color: gradientColors[0] }]}
                            />
                        </View>
                    </LinearGradient>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function CategoryFilter({ onSelect }) {
    const theme = useTheme();
    const { gender } = useContext(AuthContext); // Get the user's gender from AuthContext

    // Determine app type based on gender:
    // - If gender === 'male', then use the men's app category set.
    // - Otherwise, use the women's app category set.
    const appType = gender === 'male' ? 'men' : 'women';
    const categories = appType === 'men' ? categoriesMen : categoriesWomen;

    // Set the default selected category to the first category in the list.
    const [selected, setSelected] = useState(categories[0].id);

    // Handler for when a category is pressed.
    const handlePress = (categoryId) => {
        setSelected(categoryId);
        if (onSelect) {
            onSelect(categoryId);
        }
    };

    // Helper to get the data (title and subtitle) for the selected category.
    const currentCategory = categories.find((cat) => cat.id === selected) || {};

    return (
        <View style={{ paddingLeft: 10 }}>
            <View style={styles.container}>
                {/* Categories in a horizontal ScrollView */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                >
                    {categories.map((cat) => (
                        <View key={cat.id} style={styles.categoryItem}>
                            <AnimatedCategoryButton
                                gradientColors={cat.gradientColors}
                                logoName={categoryLogos[cat.id]}
                                isSelected={selected === cat.id}
                                onPress={() => handlePress(cat.id)}
                                theme={theme}
                            />
                            <Text style={[styles.categoryLabel, { color: theme.colors.secondary }]}>
                                {cat.label}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Dynamic title and subtitle based on the selected category */}
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
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 80,
    },
    scrollContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 80,
    },
    categoryItem: {
        alignItems: 'center',
        marginRight: 16,
    },
    // Make the button smaller.
    categoryButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    // Used for the selected state: full gradient background.
    linearGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Used for the unselected state: a gradient border.
    gradientBorder: {
        flex: 1,
        borderRadius: 20,
        padding: 2, // space for the border effect
    },
    // Inner circle that shows the background when unselected.
    innerCircle: {
        flex: 1,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        fontSize: 24, // slightly smaller icon size for the smaller button
    },
    categoryLabel: {
        marginTop: 8,
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