import React, { useRef, useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, View, Text } from 'react-native';

const screenWidth = Dimensions.get('screen').width;
const width = screenWidth - 48; // proper numeric width

const minHeight = 140;
const maxHeight = 210;
const segmentsLength = maxHeight - minHeight + 1;
const segmentWidth = 4;
const segmentSpacing = 20;
const snapSegment = segmentWidth + segmentSpacing;

// This spacer centers each segment in the view.
const spacerWidth = (width / 2) - (segmentWidth / 2);

const indicatorHeight = 40;

// Helper to convert cm → ft/in
function convertToFeetInches(cm) {
    const totalInches = Math.round(cm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'${inches}"`;
}

const HeightRuler = ({ onValueChange, initialValue, colors }) => {
    // Default to 170 cm if no initial value provided.
    const defaultHeight = 170;
    const initialHeight = initialValue !== undefined ? initialValue : defaultHeight;

    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef(null);
    const [displayValue, setDisplayValue] = useState(initialHeight);

    // On mount, scroll to the proper offset.
    useEffect(() => {
        const timer = setTimeout(() => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                    x: (initialHeight - minHeight) * snapSegment,
                    animated: false,
                });
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [initialHeight]);

    // Update display value as user scrolls.
    useEffect(() => {
        const listener = scrollX.addListener(({ value }) => {
            const liveValue = Math.round(value / snapSegment) + minHeight;
            setDisplayValue(liveValue);
        });
        return () => scrollX.removeListener(listener);
    }, [scrollX]);

    const handleMomentumScrollEnd = (e) => {
        const x = e.nativeEvent.contentOffset.x;
        const finalValue = Math.round(x / snapSegment) + minHeight;
        if (onValueChange) {
            onValueChange(String(finalValue));
        }
    };

    // Convert cm to ft/in string.
    const ftInchesValue = convertToFeetInches(displayValue);

    return (
        <View style={styles.container}>
            {/* Top area: cm value */}
            <View style={styles.indicatorTopContainer}>
                <Text style={[styles.valueText, { color: colors.text }]}>{displayValue} cm</Text>
            </View>

            {/* Middle area: Ruler and indicator */}
            <View style={styles.rulerContainer}>
                <Animated.ScrollView
                    ref={scrollViewRef}
                    horizontal
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    snapToInterval={snapSegment}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onMomentumScrollEnd={handleMomentumScrollEnd}
                    contentContainerStyle={styles.scrollViewContainer}
                >
                    {/* Left spacer */}
                    <View style={{ width: spacerWidth }} />
                    {Array.from({ length: segmentsLength }, (_, i) => {
                        const value = i + minHeight;
                        const isTenth = value % 10 === 0;
                        return (
                            <View
                                key={value}
                                style={[
                                    styles.segment,
                                    {
                                        backgroundColor: isTenth ? colors.text : colors.secondary,
                                        height: isTenth ? 40 : 20,
                                        marginRight: i === segmentsLength - 1 ? 0 : segmentSpacing,
                                    },
                                ]}
                            />
                        );
                    })}
                    {/* Right spacer */}
                    <View style={{ width: spacerWidth }} />
                </Animated.ScrollView>

                {/* Indicator line with its bottom edge flush with the ruler */}
                <View style={[styles.indicatorLine, { backgroundColor: colors.primary }]} />
            </View>

            {/* Bottom area: ft/in value */}
            <View style={styles.indicatorBottomContainer}>
                <Text style={[styles.valueText, { color: colors.text }]}>{ftInchesValue}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width,
        marginVertical: 16,
    },
    indicatorTopContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    rulerContainer: {
        position: 'relative',
    },
    scrollViewContainer: {
        alignItems: 'flex-end', // Segments align to the bottom
    },
    segment: {
        width: segmentWidth,
    },
    // This indicator line is absolutely positioned so its bottom is flush with the ruler.
    indicatorLine: {
        position: 'absolute',
        bottom: 0,
        left: (width / 2) - (segmentWidth / 2),
        height: indicatorHeight,
        width: segmentWidth,
    },
    indicatorBottomContainer: {
        alignItems: 'center',
        marginTop: 15,
    },
    valueText: {
        fontSize: 20,
        fontWeight: '600',
    },
});

export default HeightRuler;