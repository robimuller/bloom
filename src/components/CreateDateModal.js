import React from 'react';
import { Dimensions, View } from 'react-native';
import CustomDraggableBottomSheet from './CustomDraggableBottomSheet';

export default function CreateDateModal({ isVisible, onClose, children }) {
    // Get the screen height
    const { height: screenHeight } = Dimensions.get('window');
    // Calculate 90% of the screen height
    const sheetHeight = screenHeight * 0.9;

    return (
        <CustomDraggableBottomSheet
            isVisible={isVisible}
            onClose={onClose}
            sheetHeight={sheetHeight}
        >
            <View style={{ flex: 1 }}>
                {children}
            </View>
        </CustomDraggableBottomSheet>
    );
}