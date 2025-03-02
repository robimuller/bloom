import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from 'react-native-paper';

const ProfileDetailsBottomSheet = ({ selectedProfile, onClose }) => {
    const sheetRef = useRef(null);
    const { colors } = useTheme();
    // Define three valid snap points: 25%, 50%, and 90%.
    const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);
    // When the sheet is shown, start at 50% (index 1).
    const [index, setIndex] = useState(1);

    // Reset to 50% when a new profile is selected.
    useEffect(() => {
        setIndex(1);
    }, [selectedProfile]);

    const handleSheetChange = useCallback((i) => {
        setIndex(i);
        // With enablePanDownToClose enabled, if the user drags below the 25% stop,
        // the library will trigger the onClose callback automatically.
    }, []);

    return (
        <BottomSheet
            ref={sheetRef}
            index={index}
            snapPoints={snapPoints}
            onChange={handleSheetChange}
            onClose={onClose} // This is triggered when the user drags down past the lowest snap point.
            enableDynamicSizing={true}
            enablePanDownToClose={true}
            backgroundStyle={{ backgroundColor: colors.cardBackground }}
            handleIndicatorStyle={styles.handle}
        >
            <BottomSheetView style={styles.contentContainer}>
                <Text style={styles.title}>{selectedProfile.firstName}'s Details</Text>
                <Text style={styles.text}>Bio: {selectedProfile.bio}</Text>
                <Text style={styles.text}>City: {selectedProfile.city}</Text>
                <Text style={styles.text}>Occupation: {selectedProfile.occupation}</Text>
            </BottomSheetView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    handle: {
        backgroundColor: '#ccc',
    },
    contentContainer: {
        flex: 1,
        padding: 36,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
        marginBottom: 5,
    },
});

export default ProfileDetailsBottomSheet;