// src/components/EditFieldBottomSheet.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';

export default function EditFieldBottomSheet({
  isVisible,
  onClose,
  fieldName,
  initialValue = '',
  onSave,
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  function handleSave() {
    onSave(fieldName, value);
    onClose();
  }

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modalContainer}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.heading}>Edit {fieldName}</Text>

        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={setValue}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0, // so it spans the width
  },
  contentContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  heading: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'blue',
    borderRadius: 6,
  },
  cancelText: {
    color: 'red',
  },
  saveText: {
    color: '#fff',
  },
});