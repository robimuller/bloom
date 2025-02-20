// src/screens/men/MenHomeScreen.js
import React, { useContext, useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, ScrollView, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

import { RequestsContext } from '../../contexts/RequestsContext';
import { PromotionsContext } from '../../contexts/PromotionsContext';
import { ProfilesContext } from '../../contexts/ProfilesContext';
import { UserProfileContext } from '../../contexts/UserProfileContext'; // To access user's location
import CategoryFilter from '../../components/CategoryFilter';
import LocationSelector from '../../components/LocationSelector';
import CreateDateScreen from './CreateDateScreen';
import PromotionsCard from '../../components/PromotionsCard';
import { getFeaturedDateConcepts } from '../../utils/recommendDateConcepts';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MenHomeScreen() {
    const navigation = useNavigation();
    const theme = useTheme();
    const { requests } = useContext(RequestsContext);
    const { promotions, loading: loadingPromotions } = useContext(PromotionsContext);
    const { womenProfiles, loadingWomen } = useContext(ProfilesContext);
    const { profile } = useContext(UserProfileContext);
    const { colors } = useTheme();

    // Count pending requests for the badge.
    const pendingCount = requests.filter((r) => r.status === 'pending').length;

    // State for Create Date modal (if needed)
    const [isCreateDateModalVisible, setIsCreateDateModalVisible] = useState(false);

    // State for Featured Date Concepts
    const [featuredDateConcepts, setFeaturedDateConcepts] = useState([]);
    const [loadingDateConcepts, setLoadingDateConcepts] = useState(false);

    useEffect(() => {
        async function fetchDateConcepts() {
            setLoadingDateConcepts(true);
            // Use user's location from profile if available; otherwise, use a default value.
            const location = profile?.location || "New York";
            const ideas = await getFeaturedDateConcepts(location);
            setFeaturedDateConcepts(ideas);
            setLoadingDateConcepts(false);
        }
        fetchDateConcepts();
    }, [profile]);

    const handleCategorySelect = (categoryId) => {
        navigation.navigate('MenFeed', { selectedCategory: categoryId });
    };

    // A simple preview card reusing data from MenFeedScreen.
    const MenFeedCardPreview = ({ item }) => {
        return (
            <TouchableOpacity
                style={[styles.previewCard, { backgroundColor: colors.cardBackground }]}
                onPress={() => navigation.navigate('MenFeed')}
                activeOpacity={0.8}
            >
                <Image
                    source={typeof item.photos[0] === 'string' ? { uri: item.photos[0] } : item.photos[0]}
                    style={styles.previewImage}
                />
                <Text style={[styles.previewName, { color: colors.text }]} numberOfLines={1}>
                    {item.displayName}
                </Text>
                {item.location && (
                    <Text style={[styles.previewLocation, { color: colors.secondary }]} numberOfLines={1}>
                        {item.location}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    // A reusable component for "View More" header with chevron icon.
    const ViewMoreHeader = ({ title, onPress }) => (
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onPress} style={styles.viewMoreContainer}>
                <Text style={[styles.viewMoreText, { color: theme.colors.secondary }]}>View More</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.secondary} style={styles.chevronIcon} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.topRow}>
                    <TouchableOpacity
                        style={[styles.iconCircle, { marginRight: 16, backgroundColor: colors.cardBackground }]}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <LocationSelector />
                    <TouchableOpacity
                        style={[styles.iconCircle, { backgroundColor: colors.cardBackground }]}
                        onPress={() => navigation.navigate('MenNotifications')}
                    >
                        <View style={{ position: 'relative' }}>
                            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
                            {pendingCount > 0 && (
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>{pendingCount}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.filterContainer}>
                    <CategoryFilter onSelect={handleCategorySelect} />
                </View>
            </View>

            {/* Sections Container */}
            <ScrollView contentContainerStyle={styles.sectionsContainer}>
                {/* Explore Section */}
                <View style={styles.section}>
                    <ViewMoreHeader title="Explore" onPress={() => navigation.navigate('MenFeed')} />
                    {loadingWomen ? (
                        <Text style={{ color: colors.text }}>Loading profiles...</Text>
                    ) : (
                        <FlatList
                            data={womenProfiles.slice(0, 3)}
                            horizontal
                            keyExtractor={(item) => item.id}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => <MenFeedCardPreview item={item} />}
                            contentContainerStyle={styles.horizontalScroll}
                        />
                    )}
                </View>

                {/* Promotions Section */}
                <View style={styles.section}>
                    <ViewMoreHeader title="Promotions" onPress={() => navigation.navigate('MenPromotionsList')} />
                    {loadingPromotions ? (
                        <Text style={{ color: colors.text }}>Loading promotions...</Text>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {promotions.slice(0, 3).map((promo) => (
                                <PromotionsCard
                                    key={promo.id}
                                    promotion={promo}
                                    onPress={(promo) => navigation.navigate('MenPromotionDetail', { promo })}
                                    onAttach={(promo) => console.log('Attach promotion:', promo)}
                                    onMarkInterest={(promo) => console.log("I'm interested in:", promo)}
                                />
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Featured Date Concepts Section */}
                <View style={styles.section}>
                    <ViewMoreHeader title="Daily Ideas" onPress={() => navigation.navigate('FeaturedDateConceptsScreen')} />
                    {loadingDateConcepts ? (
                        <Text style={{ color: colors.text }}>Loading date ideas...</Text>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {featuredDateConcepts.map((idea, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.featuredCard, { backgroundColor: colors.primary }]}
                                    onPress={() => {
                                        console.log('Selected date concept:', idea);
                                    }}
                                >
                                    {/* Magic Wand Icon with Linear Gradient */}
                                    <LinearGradient
                                        colors={[colors.cardBackground, colors.background]}
                                        style={styles.magicIconContainer}
                                    >
                                        <FontAwesome5 name="magic" size={16} color={colors.primary} />
                                    </LinearGradient>
                                    <Text style={[styles.featuredTitle, { color: colors.black }]}>{idea.title}</Text>
                                    <Text style={[styles.featuredDescription, { color: colors.secondary }]} numberOfLines={3}>
                                        {idea.description}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Recommended Section */}
                <View style={styles.section}>
                    <ViewMoreHeader title="Recommended" onPress={() => navigation.navigate('MenFeed')} />
                    {loadingWomen ? (
                        <Text style={{ color: colors.text }}>Loading profiles...</Text>
                    ) : (
                        <FlatList
                            data={womenProfiles.slice(0, 3)}
                            horizontal
                            keyExtractor={(item) => item.id}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => <MenFeedCardPreview item={item} />}
                            contentContainerStyle={styles.horizontalScroll}
                        />
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button for Creating Dates */}
            {/* <TouchableOpacity
          style={styles.fabContainer}
          onPress={() => navigation.navigate('CreateDate')}
          activeOpacity={0.8}
      >
          <LinearGradient
              colors={[colors.primary, colors.primary]}
              start={{ x: 1.5, y: 0.3 }}
              end={{ x: 0.1, y: 0.3 }}
              style={styles.fabGradient}
          >
              <Ionicons name="add" size={24} color={theme.colors.background} />
          </LinearGradient>
      </TouchableOpacity> */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingLeft: 16,
    },
    header: {
        width: '100%',
        marginBottom: 16,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        height: 90,
    },
    filterContainer: {
        // Additional styling for the filter container if needed
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionsContainer: {
        paddingBottom: 80, // Ensures space at the bottom for the FAB
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionHeaderText: {
        fontSize: 25,
        fontWeight: '600',
    },
    viewMoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewMoreText: {
        fontSize: 12,
        fontWeight: '500',
    },
    chevronIcon: {
        marginLeft: 4,
        marginRight: 16
    },
    horizontalScroll: {},
    fabContainer: {
        position: 'absolute',
        bottom: 16,
        alignSelf: 'center',
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    badgeContainer: {
        position: 'absolute',
        right: -6,
        top: -4,
        backgroundColor: 'red',
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 1,
        minWidth: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    // Preview card styles for Explore section
    previewCard: {
        width: 250,
        marginRight: 16,
        borderRadius: 12,
        overflow: 'hidden',
        padding: 10,
    },
    previewImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    previewName: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 8,
    },
    previewLocation: {
        fontSize: 14,
        marginTop: 4,
    },
    // Featured Date Concepts styles
    featuredCard: {
        width: SCREEN_WIDTH - 32, // Adjust width as needed
        marginRight: 16,
        borderRadius: 12,
        padding: 10,
        paddingTop: 40, // Extra top padding to leave room for the magic wand icon
        justifyContent: 'flex-start',
        height: 200,
        position: 'relative',
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
        marginTop: 8,
    },
    featuredDescription: {
        fontSize: 14,
    },
    magicIconContainer: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});