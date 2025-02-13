// src/screens/men/MenPromotionDetailScreen.js
import React, { useEffect, useRef, useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ShootingLightButton from '../../components/ShootingLightButton';
import { Image as ExpoImage } from 'expo-image'; // for caching

// Use our UserProfileContext to get female users data
import { UserProfileContext } from '../../contexts/UserProfileContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_AVATARS = 3;

export default function MenPromotionDetailScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { promo } = route.params; // Promotion object from Firebase

    // Get femaleUsers from context
    const { femaleUsers } = useContext(UserProfileContext);

    // Filter femaleUsers based on the promotion's interestedWomen array (which holds UIDs)
    const interestedProfiles =
        promo.interestedWomen && femaleUsers
            ? femaleUsers.filter((user) =>
                promo.interestedWomen.some((interested) => interested.userId === user.id)
            )
            : [];

    // Calculate overflow count if there are more interested women than we display
    const overflowCount = Math.max(0, (promo.interestedWomen?.length || 0) - MAX_AVATARS);

    /** Carousel Setup **/
    const scrollViewRef = useRef();
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalPhotos = promo.photos.length;

    useEffect(() => {
        const timer = setInterval(() => {
            const nextIndex = (currentIndex + 1) % totalPhotos;
            scrollViewRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
            setCurrentIndex(nextIndex);
        }, 3000);
        return () => clearInterval(timer);
    }, [currentIndex, totalPhotos]);

    // Format the posted-on date
    const postedOn = new Date(promo.startDate).toLocaleDateString();

    /** CTA handler **/
    const handleUsePromotion = () => {
        navigation.navigate('CreateDate', { selectedPromotion: promo });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={[styles.container, { backgroundColor: colors.background }]}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Carousel Container */}
                <View style={styles.carouselContainer}>
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        style={styles.carousel}
                    >
                        {promo.photos.map((photo, index) => (
                            <View key={index} style={styles.carouselImageContainer}>
                                <Image source={{ uri: photo }} style={styles.image} />
                            </View>
                        ))}
                    </ScrollView>
                    {/* Go Back Button */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
                        <View style={styles.circle}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </View>
                    </TouchableOpacity>
                    {/* Right Vertical Buttons */}
                    <View style={styles.rightButtons}>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}>
                            <Ionicons name="heart-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}>
                            <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}>
                            <Ionicons name="bookmark-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Details Section */}
                <View style={[styles.detailsContainer, { backgroundColor: colors.cardBackground }]}>
                    {/* Top Row */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoSection}>
                            <Text style={[styles.infoLabel, { color: colors.text }]}>Posted on</Text>
                            <Text style={[styles.infoValue, { color: colors.secondary }]}>{postedOn}</Text>
                        </View>
                        <View
                            style={[
                                styles.infoSection,
                                { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.secondary },
                            ]}
                        >
                            <Text style={[styles.infoLabel, { color: colors.text }]}>Type</Text>
                            <Text style={[styles.infoValue, { color: colors.secondary }]}>{promo.promotionType}</Text>
                        </View>
                        <View style={styles.infoSectionRight}>
                            <Ionicons name="heart" size={16} color={colors.primary} />
                            <Text style={[styles.infoValue, { color: colors.secondary, marginLeft: 4 }]}>
                                {promo.likes}
                            </Text>
                        </View>
                    </View>

                    {/* Business Info Row */}
                    <View style={styles.businessRow}>
                        <Image source={{ uri: promo.photos[0] }} style={styles.profileImage} />
                        <View style={styles.businessInfo}>
                            <Text style={[styles.businessName, { color: colors.text }]}>{promo.businessName}</Text>
                            <Text style={[styles.promoTitle, { color: colors.text }]}>{promo.title}</Text>
                        </View>
                    </View>
                </View>

                {/* Interested Partners Section - Combined Stack + View All */}
                <View style={styles.interestedSectionContainer}>
                    <View style={styles.interestedHeader}>
                        <Text style={[styles.interestedLabel, { color: colors.text }]}>Interested Partners</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('PromotionInterestedWomen', { promotion: promo })}
                            style={styles.viewButton}
                        >
                            <Text style={[styles.viewButtonText, { color: colors.primary }]}>Arrange a Date</Text>
                            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.avatarStack}>
                        {interestedProfiles.slice(0, MAX_AVATARS).map((user, index) => (
                            <View
                                key={user.id}
                                style={[styles.avatarWrapper, { marginLeft: index === 0 ? 0 : -15 }]}
                            >
                                <ExpoImage
                                    source={{ uri: user.photos?.[0] }}
                                    style={styles.avatar}
                                    contentFit="cover"
                                    cachePolicy="disk"
                                />
                            </View>
                        ))}
                        {overflowCount > 0 && (
                            <View style={[styles.avatarWrapper, { marginLeft: -15 }, styles.overflowCircle]}>
                                <Text style={styles.overflowText}>+{overflowCount}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Content Card */}
                <View style={styles.card}>
                    <Text style={[styles.description, { color: colors.secondary }]}>{promo.description}</Text>
                    <Text style={[styles.discount, { color: colors.primary }]}>{promo.discountPercentage}% Off</Text>
                    <Text style={[styles.terms, { color: colors.text }]}>Terms: {promo.terms}</Text>
                </View>
            </ScrollView>

            {/* CTA Button fixed to bottom */}
            <View style={styles.ctaContainer}>
                <ShootingLightButton
                    label="Use This Promotion"
                    onPress={handleUsePromotion}
                    style={styles.ctaButton}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    /* CAROUSEL CONTAINER */
    carouselContainer: {
        position: 'relative',
    },
    carousel: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.5,
    },
    carouselImageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.5,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    goBackButton: {
        position: 'absolute',
        top: 60,
        left: 16,
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    rightButtons: {
        position: 'absolute',
        top: 60,
        right: 16,
        flexDirection: 'column',
        alignItems: 'center',
    },
    iconButton: {
        marginBottom: 12,
        padding: 8,
        borderRadius: 20,
    },
    detailsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    infoSection: {
        flex: 1,
        alignItems: 'center',
    },
    infoSectionRight: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 12,
    },
    businessRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    businessInfo: {
        flex: 1,
    },
    businessName: {
        fontSize: 16,
        fontWeight: '600',
    },
    promoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },
    /* INTERESTED SECTION - Combined Design */
    interestedSectionContainer: {
        marginHorizontal: 16,
        marginVertical: 16,
    },
    interestedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    interestedLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 4,
    },
    avatarStack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    overflowCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#999',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    overflowText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    /* CARD */
    card: {
        margin: 16,
    },
    description: {
        fontSize: 16,
        marginBottom: 8,
    },
    discount: {
        fontSize: 20,
        marginBottom: 8,
        fontWeight: '600',
    },
    terms: {
        fontSize: 14,
        marginBottom: 16,
    },
    ctaContainer: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 999,
    },
    ctaButton: {
        height: 60,
        borderRadius: 25,
    },
});