// CustomDraggableBottomSheet.js
import React, { useRef, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import {
  PanGestureHandler,
} from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CustomDraggableBottomSheet({
  isVisible,
  onClose,
  children,
  sheetHeight = 300,
}) {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === 5 /* END */) {
      if (nativeEvent.translationY > sheetHeight / 2) {
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onClose && onClose());
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isVisible ? 0 : SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, translateY]);

  if (!isVisible) return null;

  return (
    <View style={styles.cardBackground}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.background, { backgroundColor: theme.colors.overlay2 }]} />
      </TouchableWithoutFeedback>
      <PanGestureHandler
        activeOffsetX={[-10, 10]} // ignore horizontal gestures
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              transform: [{ translateY }],
              backgroundColor: theme.colors.background,
            },
          ]}
          pointerEvents="box-none"
        >
          {/* Header with the pan handler */}
          <View style={styles.sheetHeader}>
            <View style={styles.dragHandle} />
          </View>
          {/* Content area (which now won’t be affected by the modal’s pan) */}
          <View style={{ flex: 1 }} pointerEvents="auto">
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                  {children}
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </Animated.View>
      </PanGestureHandler>
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
  sheetHeader: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ccc',
  },
});