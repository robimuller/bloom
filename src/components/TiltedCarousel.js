import React, { useRef, useEffect } from 'react';
import {
    View,
    ScrollView,
    Image,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Layout constants
const ROW_HEIGHT = 160;
const ROW_SPACING = 5; // Vertical gap between rows
const IMAGE_WIDTH = 160;
const IMAGE_HEIGHT = 160;
const SPACING = 5;

// Specific images from your assets folder
const BASE_IMAGES = [
    require('../../assets/Maedeh.png'),
    require('../../assets/Nyuszi.png'),
    require('../../assets/Maedeh2.jpeg'),
    require('../../assets/Rozh.png'),
    require('../../assets/Maedeh3.jpeg'),
    require('../../assets/Nastaran.png'),
    require('../../assets/Nastaran2.png'),
    require('../../assets/Nahal.jpeg'),
    require('../../assets/Nahal2.png'),
    require('../../assets/Nahal3.png'),
];

// For this example, we'll use one copy of BASE_IMAGES.
const IMAGES = [...BASE_IMAGES];

// Helper function to shuffle an array using Fisher–Yates
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export default function ThreeRowsCarouselWithGradients() {
    // Shuffle images for each row independently.
    const topImages = shuffleArray(IMAGES);
    const middleImages = shuffleArray(IMAGES);
    const bottomImages = shuffleArray(IMAGES);

    // ScrollView refs for each row
    const scrollRefTop = useRef(null);
    const scrollRefMiddle = useRef(null);
    const scrollRefBottom = useRef(null);

    // Offsets for each row
    let offsetTop = 0;
    let offsetMiddle = 0;
    let offsetBottom = 0;

    // Speed refs (base speed = 0.1)
    const speedTopRef = useRef(0.1);
    const speedMiddleRef = useRef(0.1);
    const speedBottomRef = useRef(0.1);

    // Helper: smoothly boost a row’s speed then ease back to base.
    function triggerBoost(speedRef, boostSpeed = 1.0, duration = 1000, baseSpeed = 0.1) {
        let startTime = null;
        function animate(timestamp) {
            if (startTime === null) {
                startTime = timestamp;
            }
            const t = timestamp - startTime;
            if (t < duration) {
                let newSpeed;
                if (t < duration / 2) {
                    newSpeed = baseSpeed + (boostSpeed - baseSpeed) * (t / (duration / 2));
                } else {
                    newSpeed = boostSpeed - (boostSpeed - baseSpeed) * ((t - duration / 2) / (duration / 2));
                }
                speedRef.current = newSpeed;
                requestAnimationFrame(animate);
            } else {
                speedRef.current = baseSpeed;
            }
        }
        requestAnimationFrame(animate);
    }

    useEffect(() => {
        // Calculate total content width for one row
        const totalImageWidth = IMAGES.length * (IMAGE_WIDTH + SPACING);
        const maxOffset = totalImageWidth + 10 - width; // 10 is the left padding

        // Continuous scrolling loop (~60 FPS)
        const scrollInterval = setInterval(() => {
            offsetTop += speedTopRef.current;
            offsetMiddle += speedMiddleRef.current;
            offsetBottom += speedBottomRef.current;

            scrollRefTop.current?.scrollTo({ x: offsetTop, animated: false });
            scrollRefMiddle.current?.scrollTo({ x: offsetMiddle, animated: false });
            scrollRefBottom.current?.scrollTo({ x: offsetBottom, animated: false });

            if (offsetTop > maxOffset) offsetTop = 0;
            if (offsetMiddle > maxOffset) offsetMiddle = 0;
            if (offsetBottom > maxOffset) offsetBottom = 0;
        }, 16);

        // Schedule boost triggers (with staggered delays)
        const boostIntervalTop = setInterval(() => {
            triggerBoost(speedTopRef, 30.0, 1000, 0.1);
        }, 5000);

        const boostIntervalMiddle = setInterval(() => {
            triggerBoost(speedMiddleRef, 20.0, 1000, 0.1);
        }, 9100);

        const boostIntervalBottom = setInterval(() => {
            triggerBoost(speedBottomRef, 15.0, 1000, 0.1);
        }, 8200);

        return () => {
            clearInterval(scrollInterval);
            clearInterval(boostIntervalTop);
            clearInterval(boostIntervalMiddle);
            clearInterval(boostIntervalBottom);
        };
    }, []);

    return (
        // The outer wrapper holds the carousel and gradient overlays.
        <View style={styles.wrapper}>
            {/* The group container holds the three rows. */}
            <View style={styles.groupContainer}>
                {/* Top Row */}
                <View style={[styles.rowContainer, { top: 0 }]}>
                    <View style={styles.angledContainer}>
                        <ScrollView
                            ref={scrollRefTop}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.scrollView}
                            contentContainerStyle={styles.contentContainer}
                        >
                            {topImages.map((src, i) => (
                                <Image key={i} source={src} style={styles.image} />
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Middle Row (reversed horizontally) */}
                <View style={[styles.rowContainer, { top: ROW_HEIGHT + ROW_SPACING }]}>
                    <View style={[styles.angledContainer, styles.middleAngled]}>
                        <ScrollView
                            ref={scrollRefMiddle}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.scrollView}
                            contentContainerStyle={styles.contentContainer}
                        >
                            {middleImages.map((src, i) => (
                                <Image key={i} source={src} style={styles.image} />
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Bottom Row */}
                <View style={[styles.rowContainer, { top: ROW_HEIGHT * 2 + ROW_SPACING * 2 }]}>
                    <View style={styles.angledContainer}>
                        <ScrollView
                            ref={scrollRefBottom}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.scrollView}
                            contentContainerStyle={styles.contentContainer}
                        >
                            {bottomImages.map((src, i) => (
                                <Image key={i} source={src} style={styles.image} />
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </View>

            {/* Top Gradient Overlay */}
            <LinearGradient
                pointerEvents="none"
                colors={['#1A1423', 'rgba(0,0,0,0)']}
                style={styles.topGradient}
            />

            {/* Bottom Gradient Overlay */}
            <LinearGradient
                pointerEvents="none"
                colors={['rgba(0,0,0,0)', '#1A1423']}
                style={styles.bottomGradient}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // The outer wrapper for the carousel and overlays.
    wrapper: {
        position: 'relative',
        width: '100%',
        // Total height includes three rows plus two spacings.
        height: ROW_HEIGHT * 3 + ROW_SPACING * 2,
    },
    groupContainer: {
        flex: 1,
        width: '100%',
        overflow: 'hidden', // Clips angled content so group boundaries remain flat.
    },
    rowContainer: {
        position: 'absolute',
        height: ROW_HEIGHT,
        left: 0,
        right: 0,
    },
    // The inner container that applies the rotation.
    angledContainer: {
        flex: 1,
        transform: [{ rotate: '-3deg' }],
    },
    // For the middle row: rotate and flip horizontally.
    middleAngled: {
        transform: [{ rotate: '-3deg' }, { scaleX: -1 }],
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        alignItems: 'center',
        paddingLeft: 10,
    },
    image: {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        marginRight: SPACING,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    // Gradient overlays
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 150, // Adjust the height of the top fade as needed
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150, // Adjust the height of the bottom fade as needed
    },
});