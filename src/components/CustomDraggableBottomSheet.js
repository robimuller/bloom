import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * CustomDraggableBottomSheet
 *
 * Props:
 * - isVisible: boolean, whether the sheet is visible.
 * - onClose: callback fired when the sheet should close.
 * - children: content to render inside the sheet.
 * - snapPoints: an array of snap point heights (in pixels) from the bottom.
 *   For example, [SCREEN_HEIGHT * 0.25, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT * 0.75]
 * - initialSnapIndex: index of the snapPoints array for initial height.
 */
export default function CustomDraggableBottomSheet({
  isVisible,
  onClose,
  children,
  snapPoints = [SCREEN_HEIGHT * 0.25, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT * 0.75],
  initialSnapIndex = 0,
}) {
  // Calculate initial offset from bottom (i.e. the sheet is open to snapPoints[initialSnapIndex])
  const initialHeight = snapPoints[initialSnapIndex];
  const initialTranslateY = SCREEN_HEIGHT - initialHeight;

  // Animated value controlling vertical translation relative to initialTranslateY.
  const translateY = useRef(new Animated.Value(initialTranslateY)).current;

  // Create a PanResponder for vertical drag gestures.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        translateY.setOffset(translateY.__getValue());
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Allow vertical dragging only.
        translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        const currentPos = translateY.__getValue() + initialTranslateY; // current absolute Y position of the sheet
        // If user drags down beyond threshold, close the sheet.
        if (gestureState.dy > 50) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT - initialTranslateY,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onClose && onClose());
          return;
        }
        // Find the closest snap point:
        let closestSnap = snapPoints[0];
        let closestDiff = Math.abs(currentPos - (SCREEN_HEIGHT - snapPoints[0]));
        snapPoints.forEach(point => {
          const diff = Math.abs(currentPos - (SCREEN_HEIGHT - point));
          if (diff < closestDiff) {
            closestDiff = diff;
            closestSnap = point;
          }
        });
        const targetY = SCREEN_HEIGHT - closestSnap;
        Animated.timing(translateY, {
          toValue: targetY - initialTranslateY,
          duration: 300,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    if (isVisible) {
      // Animate in: set translateY to 0 (i.e. the sheet is at initialTranslateY)
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate out: move the sheet off-screen.
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT - initialTranslateY,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, initialTranslateY, translateY]);

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.background} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.sheet,
          {
            // The sheet's height is set to the maximum snap point.
            height: snapPoints[snapPoints.length - 1],
            transform: [{ translateY: Animated.add(translateY, new Animated.Value(initialTranslateY)) }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>{children}</View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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