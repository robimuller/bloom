// src/screens/men/PromotionsDetailScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image,
    Animated,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PromotionsDetailScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { promo } = route.params; // Promotion object from Firebase

    /** Carousel Setup **/
    const scrollViewRef = useRef();
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalPhotos = promo.photos.length;

    // Auto-play the carousel every 3 seconds.
    useEffect(() => {
        const timer = setInterval(() => {
            let nextIndex = (currentIndex + 1) % totalPhotos;
            scrollViewRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
            setCurrentIndex(nextIndex);
        }, 3000);
        return () => clearInterval(timer);
    }, [currentIndex, totalPhotos]);

    /** Countdown Bar Setup **/
    // Parse start and end dates from promo (assumed to be in 'yyyy-mm-dd' format)
    const startTime = new Date(promo.startDate);
    const endTime = new Date(promo.endDate);
    const totalDuration = endTime.getTime() - startTime.getTime();
    const now = new Date();
    const remainingTime = Math.max(endTime.getTime() - now.getTime(), 0);
    const initialProgress = totalDuration > 0 ? remainingTime / totalDuration : 0;

    // Animated value for progress (from 1 to 0)
    const progressAnim = useRef(new Animated.Value(initialProgress)).current;

    useEffect(() => {
        // Animate the progress bar from its current value to 0 over the remaining time.
        Animated.timing(progressAnim, {
            toValue: 0,
            duration: remainingTime,
            useNativeDriver: false,
        }).start();
    }, [remainingTime]);

    /** Handler for CTA button **/
    const handleUsePromotion = () => {
        navigation.navigate('CreateDate', { selectedPromotion: promo });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
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
                    {/* Go Back Button over the image */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
                        <View style={[styles.circle]}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </View>
                    </TouchableOpacity>
                    {/* Right Vertical Stack of Placeholder Buttons */}
                    <View style={styles.rightButtons}>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.overlay2 }]}>
                            <Ionicons name="heart-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.overlay2 }]}>
                            <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.overlay2 }]}>
                            <Ionicons name="bookmark-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Animated Hourglass Countdown Bar */}
                <View style={[styles.countdownContainer, { borderColor: colors.primary }]}>
                    <Animated.View
                        style={[
                            styles.countdownBar,
                            {
                                backgroundColor: colors.primary,
                                width: progressAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%'],
                                }),
                            },
                        ]}
                    />
                </View>
                <View style={styles.countdownTextContainer}>
                    <Text style={[styles.countdownText, { color: colors.text }]}>
                        Ends on {promo.endDate}
                    </Text>
                </View>

                {/* Content Card */}
                <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                    <Text style={[styles.title, { color: colors.text }]}>{promo.title}</Text>
                    <Text style={[styles.description, { color: colors.placeholder }]}>{promo.description}</Text>
                    <Text style={[styles.discount, { color: colors.primary }]}>
                        {promo.discountPercentage}% Off at {promo.businessName}
                    </Text>
                    <Text style={[styles.terms, { color: colors.text }]}>Terms: {promo.terms}</Text>
                </View>

                {/* CTA Button */}
                <TouchableOpacity onPress={handleUsePromotion} activeOpacity={0.8}>
                    <LinearGradient
                        colors={[colors.primary, '#f5a623']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.ctaButton}
                    >
                        <Text style={styles.ctaText}>Use This Promotion</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
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
    /* CAROUSEL */
    carousel: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.4, // 30% of screen height
    },
    carouselImageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.4, // 30% of screen height
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    /* GO BACK BUTTON OVER IMAGE */
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
    /* RIGHT VERTICAL BUTTONS OVER IMAGE */
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
    /* COUNTDOWN BAR */
    countdownContainer: {
        height: 8,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 4,
        borderWidth: 1,
        overflow: 'hidden',
    },
    countdownBar: {
        height: '100%',
    },
    countdownTextContainer: {
        marginHorizontal: 16,
        marginTop: 4,
    },
    countdownText: {
        fontSize: 14,
        fontWeight: '500',
    },
    /* CONTENT CARD */
    card: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 8,
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
    /* CTA BUTTON */
    ctaButton: {
        marginHorizontal: 16,
        marginVertical: 20,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 2,
    },
    ctaText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});