import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * CustomDraggableBottomSheet
 *
 * Props:
 * - isVisible: boolean, whether the sheet should be visible.
 * - onClose: callback fired when the sheet is dismissed.
 * - children: content to render inside the sheet.
 * - sheetHeight: height of the bottom sheet (default 300).
 */
export default function CustomDraggableBottomSheet({
  isVisible,
  onClose,
  children,
  sheetHeight = 300,
}) {
  // Animated value for vertical translation.
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Create a PanResponder to handle drag gestures.
  const panResponder = useRef(
    PanResponder.create({
      // Activate when the vertical drag is noticeable.
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging downward (positive dy)
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > sheetHeight / 2) {
          // If dragged more than half the sheet height, dismiss.
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onClose && onClose());
        } else {
          // Otherwise, spring back to open position.
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Animate the sheet in or out when isVisible changes.
  useEffect(() => {
    if (isVisible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, translateY]);

  // Render nothing if not visible.
  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      {/* Tapping the semi-transparent background will close the sheet */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.background} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.sheet,
          { height: sheetHeight, transform: [{ translateY }] },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
});