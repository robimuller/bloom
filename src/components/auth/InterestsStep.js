import React, { useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Animated
} from 'react-native';
import * as Haptics from 'expo-haptics';

const InterestCard = ({ item, selected, onPress, colors }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        // Animate scale for tactile feedback.
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
        });
    };

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={styles.cardContainer}>
            <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }], borderColor: selected ? colors.primary : 'transparent' }]}>
                <ImageBackground
                    source={item.asset}
                    style={styles.image}
                    imageStyle={{ borderRadius: 12 }}
                >
                    <View style={[styles.overlay, selected && { backgroundColor: `${colors.primary}60` }]} />
                    <Text style={[styles.label, { color: selected ? colors.background : colors.text }]}>
                        {item.label}
                    </Text>
                </ImageBackground>
            </Animated.View>
        </TouchableOpacity>
    );
};

const interestsData = [
    { label: 'Art & Culture', key: 'art', asset: require('../../../assets/art.png') },
    { label: 'Food & Drinks', key: 'food', asset: require('../../../assets/food.png') },
    { label: 'Entertainment', key: 'entertainment', asset: require('../../../assets/entertainment.png') },
    { label: 'Outdoor Activities', key: 'outdoor', asset: require('../../../assets/outdoor.png') },
    { label: 'Travel & Wellness', key: 'travel', asset: require('../../../assets/travel.png') },
    { label: 'Party & Concerts', key: 'party', asset: require('../../../assets/party.png') },
];

export default function InterestsStep({ profileInfo, setProfileInfo, colors }) {
    // Toggle the interest selection
    const toggleInterest = (key) => {
        const current = profileInfo.interests || [];
        if (current.includes(key)) {
            setProfileInfo({ ...profileInfo, interests: current.filter(item => item !== key) });
        } else {
            setProfileInfo({ ...profileInfo, interests: [...current, key] });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>Select your interests</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
                Imagine a creative date where you visit an art exhibit followed by a gourmet dinner, or perhaps a lively concert followed by a night out dancing. Pick as many interests as you like so we can suggest date ideas that fit your style.
            </Text>
            <View style={styles.gridContainer}>
                {interestsData.map(item => {
                    const selected = profileInfo.interests && profileInfo.interests.includes(item.key);
                    return (
                        <InterestCard
                            key={item.key}
                            item={item}
                            selected={selected}
                            onPress={() => toggleInterest(item.key)}
                            colors={colors}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 16,
        marginBottom: 20,
        lineHeight: 22,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cardContainer: {
        width: '48%', // Two columns in a row
        marginBottom: 15,
    },
    card: {
        borderRadius: 12,
        borderWidth: 2,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 120,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        margin: 8,
    },
});