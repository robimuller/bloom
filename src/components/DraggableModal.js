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
    const translateY = useRef(new Animated.Value(0)).current;
    const { colors } = useContext(ThemeContext);
    const panResponder = useRef(
        PanResponder.create({
            // Capture all touch events on the modal
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > sheetHeight / 3) {
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
            },
        })
    ).current;

    return (
        <Animated.View
            style={[styles.sheet, { height: sheetHeight, transform: [{ translateY }], backgroundColor: colors.cardBackground }]}
            {...panResponder.panHandlers}
        >
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1 }}>
                        {children}
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
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