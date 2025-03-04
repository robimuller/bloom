import React, { useState, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { PanGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    withTiming,
    useAnimatedReaction,
    runOnJS,
} from 'react-native-reanimated';

const ZoomableImage = ({ source, style, ...props }) => {
    // Shared values for scale and translation
    const scale = useSharedValue(1);
    const translationX = useSharedValue(0);
    const translationY = useSharedValue(0);

    // Local state to determine if panning should be enabled (when zoomed in)
    const [isZoomedIn, setIsZoomedIn] = useState(false);
    // Capture container layout so we can compute a local focal point.
    const [containerLayout, setContainerLayout] = useState({ x: 0, y: 0 });

    // Refs for gesture handlers so they can work simultaneously.
    const panRef = useRef();
    const pinchRef = useRef();

    // Update panning enabled state based on scale
    useAnimatedReaction(
        () => scale.value,
        (current) => {
            if (current > 1.1 && !isZoomedIn) {
                runOnJS(setIsZoomedIn)(true);
            } else if (current <= 1.1 && isZoomedIn) {
                runOnJS(setIsZoomedIn)(false);
            }
        }
    );

    // Pinch gesture handler that uses the focal point (in container coordinates)
    const pinchHandler = useAnimatedGestureHandler({
        onStart: (event, ctx) => {
            ctx.startScale = scale.value;
            ctx.startTranslationX = translationX.value;
            ctx.startTranslationY = translationY.value;
            // Record the focal point in local container coordinates
            // (assuming containerLayout has been set via onLayout)
            ctx.focalX = event.focalX - containerLayout.x;
            ctx.focalY = event.focalY - containerLayout.y;
            // Compute the container's center
            ctx.centerX = containerLayout.width / 2;
            ctx.centerY = containerLayout.height / 2;
        },
        onActive: (event, ctx) => {
            // Calculate new scale and clamp so it doesn't go below 1
            const newScale = Math.max(ctx.startScale * event.scale, 1);
            scale.value = newScale;
            // We want the point at (ctx.focalX, ctx.focalY) to remain fixed.
            // Using the formula: newTranslation = oldTranslation + (1 - newScale) * (focalPoint - center)
            translationX.value = ctx.startTranslationX + (1 - newScale) * (ctx.focalX - ctx.centerX);
            translationY.value = ctx.startTranslationY + (1 - newScale) * (ctx.focalY - ctx.centerY);
        },
        onEnd: () => {
            // Smoothly animate back to original state
            scale.value = withTiming(1);
            translationX.value = withTiming(0);
            translationY.value = withTiming(0);
        },
    });

    // Pan handler for moving the image when zoomed in
    const panHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.startTranslationX = translationX.value;
            ctx.startTranslationY = translationY.value;
        },
        onActive: (event, ctx) => {
            translationX.value = ctx.startTranslationX + event.translationX;
            translationY.value = ctx.startTranslationY + event.translationY;
        },
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translationX.value },
            { translateY: translationY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <PinchGestureHandler
            ref={pinchRef}
            simultaneousHandlers={panRef}
            onGestureEvent={pinchHandler}
        >
            <Animated.View
                style={[style, animatedStyle, { overflow: 'hidden', position: 'relative' }]}
                onLayout={(e) => {
                    setContainerLayout(e.nativeEvent.layout);
                }}
            >
                <PanGestureHandler
                    ref={panRef}
                    simultaneousHandlers={pinchRef}
                    onGestureEvent={panHandler}
                    enabled={isZoomedIn} // Only enable panning when zoomed in
                >
                    <Animated.View style={{ flex: 1 }}>
                        <Image source={source} style={{ width: '100%', height: '100%' }} {...props} />
                    </Animated.View>
                </PanGestureHandler>
            </Animated.View>
        </PinchGestureHandler>
    );
};

export default ZoomableImage;