// HeightRuler.js
import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions, Text } from 'react-native';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RULER_HEIGHT = 80;       // height of the ruler view
const TICK_SPACING = 10;       // pixels per 1 cm
const MIN_HEIGHT = 100;        // minimum height (cm)
const MAX_HEIGHT = 220;        // maximum height (cm)
const TOTAL_TICKS = MAX_HEIGHT - MIN_HEIGHT + 1;
const TICKS_WIDTH = TOTAL_TICKS * TICK_SPACING;

const HeightRuler = ({ initialValue = 170, onChange, modalVisible }) => {
    const scrollViewRef = useRef(null);
    const [selectedValue, setSelectedValue] = useState(initialValue);

    const scrollToCorrectOffset = () => {
        if (scrollViewRef.current) {
            // Compute the offset based on the initial value
            const offset = (initialValue - MIN_HEIGHT) * TICK_SPACING;
            scrollViewRef.current.scrollTo({ x: offset, animated: false });
            // Optionally log for debugging:
            // console.log("Scrolling to offset:", offset);
        }
    };

    // Trigger scrollToCorrectOffset on layout of the ScrollView.
    const handleScrollViewLayout = () => {
        // Use a slightly longer delay to be sure layout is finished.
        setTimeout(scrollToCorrectOffset, 100);
    };

    // Also re-run scrollToCorrectOffset when modalVisible or initialValue changes.
    useEffect(() => {
        if (modalVisible) {
            const timeout = setTimeout(scrollToCorrectOffset, 100);
            return () => clearTimeout(timeout);
        }
    }, [initialValue, modalVisible]);

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
                        scrollEnabled
                        showsHorizontalScrollIndicator
                        snapToInterval={TICK_SPACING}
                        decelerationRate="fast"
                        onScroll={handleScroll}
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
                                return (
                                    <View key={value} style={styles.tickContainer}>
                                        <View style={[styles.tick, { height: isMajor ? 40 : 20 }]} />
                                        {isMajor && <Text style={styles.tickLabel}>{value}</Text>}
                                    </View>
                                );
                            })}
                        </View>
                        {/* Right spacer */}
                        <View style={styles.sideSpacer} />
                    </Animated.ScrollView>
                </NativeViewGestureHandler>
                {/* Center indicator */}
                <View style={[styles.indicator, { pointerEvents: 'none' }]} />
            </View>
            <Text style={styles.valueText}>Height: {selectedValue} cm</Text>
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
        height: RULER_HEIGHT, // Ensure spacer fills vertical space
    },
    ticksContainer: { flexDirection: 'row' },
    tickContainer: { width: TICK_SPACING, alignItems: 'center' },
    tick: { width: 2, backgroundColor: '#333' },
    tickLabel: { marginTop: 4, fontSize: 10, color: '#333' },
    indicator: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: SCREEN_WIDTH / 2 - 1,
        width: 2,
        backgroundColor: 'red',
    },
    valueText: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
});

export default HeightRuler;