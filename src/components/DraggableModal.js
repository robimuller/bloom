import React, { useRef, useContext } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    View,
} from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DraggableModal({ children, onClose, sheetHeight = 300 }) {
    // Animated value for vertical translation (for downward dragging)
    const translateY = useRef(new Animated.Value(0)).current;
    // Animated value for modal height (for upward dragging)
    const modalHeightAnim = useRef(new Animated.Value(sheetHeight)).current;
    const { colors } = useContext(ThemeContext);

    // Maximum height the modal can expand to (adjust as needed)
    const maxHeight = SCREEN_HEIGHT - 100;
    // Threshold values for upward and downward drags
    const upwardExpansionThreshold = 50;
    const downwardCollapseThreshold = sheetHeight / 3;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    // Dragging downward: update the translateY value (native driver)
                    translateY.setValue(gestureState.dy);
                } else {
                    // Dragging upward: update the modal's height (JavaScript driver)
                    const newHeight = Math.min(sheetHeight - gestureState.dy, maxHeight);
                    modalHeightAnim.setValue(newHeight);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    // On release after dragging downward, close if beyond threshold
                    if (gestureState.dy > downwardCollapseThreshold) {
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
                } else {
                    // On release after dragging upward, decide to expand or revert
                    if (-gestureState.dy > upwardExpansionThreshold) {
                        Animated.timing(modalHeightAnim, {
                            toValue: maxHeight,
                            duration: 200,
                            useNativeDriver: false,
                        }).start();
                    } else {
                        Animated.timing(modalHeightAnim, {
                            toValue: sheetHeight,
                            duration: 200,
                            useNativeDriver: false,
                        }).start();
                    }
                }
            },
        })
    ).current;

    return (
        // Outer container handles the vertical translation (using native driver)
        <Animated.View style={{ transform: [{ translateY }] }} {...panResponder.panHandlers}>
            {/* Inner container handles the animated height (native driver disabled) */}
            <Animated.View style={[styles.sheet, { height: modalHeightAnim, backgroundColor: colors.cardBackground }]}>
                <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={{ flex: 1 }}>
                            {children}
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
    },
});

