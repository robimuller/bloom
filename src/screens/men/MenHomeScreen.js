// MenHomeScreen.js
import React, { useContext, useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, ScrollView, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

import { RequestsContext } from '../../contexts/RequestsContext';
import { PromotionsContext } from '../../contexts/PromotionsContext';
import { ProfilesContext } from '../../contexts/ProfilesContext';
import { UserProfileContext } from '../../contexts/UserProfileContext';
import PromotionsCard from '../../components/PromotionsCard';
import { getFeaturedDateConcepts } from '../../utils/recommendDateConcepts';
import { getRecommendedProfiles } from '../../utils/recommendProfiles';
import { getNewcomers } from '../../utils/getNewcomers'; // <-- import your new helper
import { calculateAge } from '../../utils/deduceAge';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import NewcomerPreview from '../../components/NewcomerPreview';
import RecommendProfilePreview from '../../components/RecommendProfilePreview';


const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MenHomeScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const theme = useTheme();
    const { requests } = useContext(RequestsContext);
    const { promotions, loading: loadingPromotions } = useContext(PromotionsContext);
    const { womenProfiles, loadingWomen } = useContext(ProfilesContext);
    const { profile: currentUser } = useContext(UserProfileContext);
    const { colors } = useTheme();

    // Count pending requests for the badge.
    const pendingCount = requests.filter((r) => r.status === 'pending').length;

    // State for Featured Date Concepts
    const [featuredDateConcepts, setFeaturedDateConcepts] = useState([]);
    const [loadingDateConcepts, setLoadingDateConcepts] = useState(false);

    useEffect(() => {
        async function fetchDateConcepts() {
            setLoadingDateConcepts(true);
            const location = currentUser?.location || "New York";
            const ideas = await getFeaturedDateConcepts(location);
            setFeaturedDateConcepts(ideas);
            setLoadingDateConcepts(false);
        }
        fetchDateConcepts();
    }, [currentUser]);

    // Prefetch images for performance
    useEffect(() => {
        if (womenProfiles && womenProfiles.length > 0) {
            womenProfiles.forEach(profile => {
                profile.photos?.forEach(photo => {
                    if (typeof photo === 'string') {
                        Image.prefetch(photo);
                    }
                });
            });
        }
    }, [womenProfiles]);

    // Simple preview card
    const MenFeedCardPreview = ({ item }) => {
        const age = calculateAge(item.birthday);
        return (
            <TouchableOpacity
                style={styles.previewCard}
                onPress={() => navigation.navigate('MenFeed', { initialItemId: item.id })}
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

    // "View More" header
    const ViewMoreHeader = ({ title, onPress }) => (
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onPress} style={styles.viewMoreContainer}>
                <Text style={[styles.viewMoreText, { color: theme.colors.secondary }]}>View More</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} style={styles.chevronIcon} />
            </TouchableOpacity>
        </View>
    );

    // Recommended profiles
    const recommendedProfiles = currentUser && womenProfiles.length
        ? getRecommendedProfiles(womenProfiles, currentUser)
        : [];

    // Newcomers (joined within last 2 days)
    const newcomers = getNewcomers(womenProfiles, 30);

    // Reanimated fade in
    const containerOpacity = useSharedValue(0);
    const containerStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
    }));

    useEffect(() => {
        containerOpacity.value = withTiming(1, { duration: 500 });
    }, []);

    // More customized subtext logic based on gender + time of day
    // Time-based greeting with a "Hello Nighownl" case
    function getTimeBasedGreeting() {
        const hour = new Date().getHours();

        if (hour < 6) {
            return 'Hello, Night Owl';
        } else if (hour < 12) {
            return 'Good Morning';
        } else if (hour < 18) {
            return 'Good Afternoon';
        } else {
            return 'Good Evening';
        }
    }
    function getSubText(gender) {
        const hour = new Date().getHours();

        if (hour < 6) {
            // Hello Night Owl
            if (gender === 'male') {
                return "Still awake? Let’s see who's around this late.";
            } else if (gender === 'female') {
                return "Burning the midnight oil? Check out men’s late-night dates.";
            }
            return "Up late? Explore what’s new.";
        } else if (hour < 12) {
            // Morning
            if (gender === 'male') {
                return "Rise and shine! Let's discover new profiles.";
            } else if (gender === 'female') {
                return "Morning vibes. Check out the latest dates men have posted.";
            }
            return "Explore what's new this morning.";
        } else if (hour < 18) {
            // Afternoon
            if (gender === 'male') {
                return "Afternoon calls for exploring who's around.";
            } else if (gender === 'female') {
                return "Afternoon is perfect for browsing upcoming date ideas.";
            }
            return "Explore what's new this afternoon.";
        } else {
            // Evening
            if (gender === 'male') {
                return "Night owl? See who's out there tonight.";
            } else if (gender === 'female') {
                return "Evening chill. Discover fresh date invitations.";
            }
            return "Explore what's new tonight.";
        }
    }
    console.log(currentUser.gender)

    const greeting = getTimeBasedGreeting();
    const subText = getSubText(currentUser?.gender);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Optional header */}
            <View style={styles.header} />

            <Animated.View style={containerStyle}>
                <ScrollView contentContainerStyle={styles.sectionsContainer}>
                    {/* Greeting Section */}
                    <View style={styles.greetingSection}>
                        <Text style={[styles.greetingTitle, { color: colors.text }]} numberOfLines={1}>
                            {greeting}
                            <Text style={[styles.greetingDots, { fontSize: 32, color: colors.primary }]}> ....</Text>
                        </Text>
                        <Text style={[styles.greetingSubtitle, { color: colors.secondary }]}>
                            {subText}
                        </Text>
                    </View>
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

                    {/* Newcomers Section */}
                    {newcomers && newcomers.length > 0 && (
                        <View style={styles.section}>
                            <ViewMoreHeader
                                title="Newcomers"
                                onPress={() => navigation.navigate('MenFeed', { section: 'newcomers' })}

                            />
                            <FlatList
                                data={newcomers.slice(0, 4)} // Show top 4 newcomers
                                horizontal
                                keyExtractor={(item) => item.id}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <NewcomerPreview
                                        item={item}
                                        onPress={() => navigation.navigate('MenFeed', { section: 'newcomers', initialItemId: item.id })}
                                    />
                                )}
                                contentContainerStyle={styles.horizontalScroll}
                            />
                        </View>
                    )}

                    {/* Promotions Section */}
                    {promotions && promotions.length >= 2 && (
                        <View style={styles.section}>
                            <ViewMoreHeader
                                title="Promotions"
                                onPress={() => navigation.navigate('MenPromotionsList')}
                            />
                            {loadingPromotions ? (
                                <Text style={{ color: colors.text }}>Loading promotions...</Text>
                            ) : (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                    {promotions.slice(0, 3).map((promo) => (
                                        <PromotionsCard
                                            key={promo.id}
                                            promotion={promo}
                                            onPress={(promo) =>
                                                navigation.navigate('MenPromotionDetail', { promo })
                                            }
                                        />
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    )}

                    {/* Featured Date Concepts Section */}
                    <View style={styles.section}>
                        <ViewMoreHeader
                            title="Daily Ideas"
                            onPress={() => navigation.navigate('FeaturedDateConceptsScreen')}
                        />
                        {loadingDateConcepts ? (
                            <Text style={{ color: colors.text }}>Loading date ideas...</Text>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                {featuredDateConcepts.map((idea, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.featuredCard, { backgroundColor: colors.cardBackground }]}
                                        onPress={() => {
                                            console.log('Selected date concept:', idea);
                                        }}
                                    >
                                        <LinearGradient
                                            colors={[colors.background, colors.background]}
                                            style={styles.magicIconContainer}
                                        >
                                            <FontAwesome5 name="magic" size={16} color={colors.primary} />
                                        </LinearGradient>
                                        <Text style={[styles.featuredTitle, { color: colors.text }]}>{idea.title}</Text>
                                        <Text style={[styles.featuredDescription, { color: colors.secondary }]}>{idea.description}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    {/* Recommended Section */}
                    <View style={styles.section}>
                        <ViewMoreHeader
                            title="Recommended For You"
                            onPress={() => navigation.navigate('MenFeed', { section: 'recommended' })}
                        />
                        {loadingWomen ? (
                            <Text style={{ color: colors.text }}>Loading profiles...</Text>
                        ) : (
                            <FlatList
                                data={recommendedProfiles.slice(0, 3)}
                                horizontal
                                keyExtractor={(item) => item.id}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <RecommendProfilePreview item={item} navigation={navigation} />
                                )}
                                contentContainerStyle={styles.horizontalScroll}
                            />
                        )}
                    </View>
                </ScrollView>
            </Animated.View>
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
    sectionsContainer: {
        paddingBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    greetingSection: {
        marginBottom: 20,
    },
    greetingTitle: {
        fontSize: 30,
        fontWeight: '200',
        marginBottom: 4,
        fontStyle: "italic"
    },
    greetingDots: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -3
    },
    greetingSubtitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionHeaderText: {
        fontSize: 20,
        fontWeight: '900',
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
        marginRight: 16,
    },
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
    featuredCard: {
        width: SCREEN_WIDTH - 32,
        marginRight: 16,
        borderRadius: 12,
        padding: 10,
        paddingTop: 40,
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