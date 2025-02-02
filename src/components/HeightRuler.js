// HeightRuler.js
import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions, Text } from 'react-native';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { useTheme } from 'react-native-paper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RULER_HEIGHT = 80;       // Height of the ruler view
const TICK_SPACING = 20;       // Pixels per 1 cm
const MIN_HEIGHT = 100;        // Minimum height (cm)
const MAX_HEIGHT = 220;        // Maximum height (cm)
const TOTAL_TICKS = MAX_HEIGHT - MIN_HEIGHT + 1;
const TICKS_WIDTH = TOTAL_TICKS * TICK_SPACING;

const HeightRuler = ({ initialValue = 170, onChange, modalVisible }) => {
    const scrollViewRef = useRef(null);
    // Create an Animated.Value for the horizontal scroll offset.
    const scrollX = useRef(new Animated.Value(0)).current;
    const [selectedValue, setSelectedValue] = useState(initialValue);
    const paperTheme = useTheme();

    // Scroll to the proper offset based on initialValue.
    const scrollToCorrectOffset = () => {
        if (scrollViewRef.current) {
            const offset = (initialValue - MIN_HEIGHT) * TICK_SPACING;
            scrollViewRef.current.scrollTo({ x: offset, animated: false });
        }
    };

    const handleScrollViewLayout = () => {
        setTimeout(scrollToCorrectOffset, 100);
    };

    // When modalVisible or initialValue changes, scroll to the correct offset.
    useEffect(() => {
        if (modalVisible) {
            const timeout = setTimeout(scrollToCorrectOffset, 100);
            return () => clearTimeout(timeout);
        }
    }, [initialValue, modalVisible]);

    // Update the selected value (and call onChange) on scroll.
    const handleScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const value = Math.round(offsetX / TICK_SPACING) + MIN_HEIGHT;
        setSelectedValue(value);
        if (onChange) {
            onChange(value);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.rulerContainer}>
                <NativeViewGestureHandler>
                    <Animated.ScrollView
                        ref={scrollViewRef}
                        horizontal
                        nestedScrollEnabled={true} // <--- Add this line
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={TICK_SPACING}
                        decelerationRate="fast"
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: true, listener: handleScroll }
                        )}
                        scrollEventThrottle={16}
                        directionalLockEnabled
                        contentContainerStyle={styles.scrollContent}
                        onLayout={handleScrollViewLayout}
                    >
                        {/* Left spacer */}
                        <View style={styles.sideSpacer} />
                        {/* Ticks container */}
                        <View style={styles.ticksContainer}>
                            {Array.from({ length: TOTAL_TICKS }, (_, i) => {
                                const value = MIN_HEIGHT + i;
                                const isMajor = value % 10 === 0;
                                // The center of this tick (in content coordinates)
                                const tickCenter =
                                    SCREEN_WIDTH / 2 + i * TICK_SPACING + TICK_SPACING / 2;
                                // When the tick’s center aligns with the center of the screen,
                                // scrollX should equal: tickCenter - SCREEN_WIDTH/2.
                                // Use that as the middle of our interpolation range.
                                const inputRange = [
                                    tickCenter - TICK_SPACING,
                                    tickCenter,
                                    tickCenter + TICK_SPACING,
                                ];
                                // Animate opacity and scale for the tick label.
                                const animatedOpacity = scrollX.interpolate({
                                    inputRange,
                                    outputRange: [0.5, 1, 0.5],
                                    extrapolate: 'clamp',
                                });
                                const animatedScale = scrollX.interpolate({
                                    inputRange,
                                    outputRange: [1, 1.4, 1],
                                    extrapolate: 'clamp',
                                });
                                return (
                                    <View key={value} style={styles.tickContainer}>
                                        <View
                                            style={[
                                                styles.tick,
                                                {
                                                    height: isMajor ? 40 : 20,
                                                    backgroundColor: paperTheme.colors.primary,
                                                },
                                            ]}
                                        />
                                        {isMajor && (
                                            <Animated.Text
                                                style={[
                                                    styles.tickLabel,
                                                    {
                                                        color: paperTheme.colors.text,
                                                        opacity: animatedOpacity,
                                                        transform: [{ scale: animatedScale }],
                                                    },
                                                ]}
                                            >
                                                {value}
                                            </Animated.Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                        {/* Right spacer */}
                        <View style={styles.sideSpacer} />
                    </Animated.ScrollView>
                </NativeViewGestureHandler>
                {/* Center indicator */}
                <View
                    style={[
                        styles.indicator,
                        { backgroundColor: paperTheme.colors.accent },
                    ]}
                />
            </View>
            {/* Optionally, remove this separate display if you prefer the tick label to serve as the value */}
            <Animated.Text
                style={[styles.valueText, { color: paperTheme.colors.text }]}
            >
                {selectedValue} cm
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', marginVertical: 20 },
    rulerContainer: {
        width: SCREEN_WIDTH,
        height: RULER_HEIGHT,
        justifyContent: 'center',
        overflow: 'visible',
    },
    scrollContent: {
        width: TICKS_WIDTH + SCREEN_WIDTH,
        flexDirection: 'row',
    },
    sideSpacer: {
        width: SCREEN_WIDTH / 2,
        height: RULER_HEIGHT,
    },
    ticksContainer: { flexDirection: 'row' },
    tickContainer: { width: TICK_SPACING, alignItems: 'center' },
    tick: { width: 2 },
    tickLabel: {
        marginTop: 4,
        fontSize: 10,
        width: 30,         // Provide enough horizontal space for the label
        textAlign: 'center',
    },
    indicator: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: SCREEN_WIDTH / 2 - 1,
        width: 2,
    },
    valueText: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
});

export default HeightRuler;