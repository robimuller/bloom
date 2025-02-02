import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme } from 'react-native-paper';

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
  const theme = useTheme();
  // Animated value for vertical translation.
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Create a PanResponder to handle drag gestures.
  const panResponder = useRef(
    PanResponder.create({
      // Let the child components get the touch initially.
      onStartShouldSetPanResponderCapture: (evt, gestureState) => {
        return false;
      },
      // Decide whether to start handling the gesture after movement begins.
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // If horizontal movement is dominant, don’t capture.
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          return false;
        }
        // Otherwise, if the vertical movement is significant, start capturing.
        return Math.abs(gestureState.dy) > 5;
      },
      // Optionally, capture the gesture on move if conditions are met.
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          return false;
        }
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward dragging.
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
          // Otherwise, spring back to the open position.
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
    <View style={styles.cardBackground}>
      {/* Tapping the semi-transparent background will close the sheet */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.background, { backgroundColor: theme.colors.overlay2 }]} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            transform: [{ translateY }],
            backgroundColor: theme.colors.background,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1 }}>
          {/* Wrap the content so that tapping anywhere dismisses the keyboard */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
});