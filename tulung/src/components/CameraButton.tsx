import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActionSheetIOS,
  Platform,
  Alert,
  View,
  Text,
  Modal,
  Pressable,
} from 'react-native';
import { colors, theme } from '../constants/colors';
import { haptics } from '../utils/haptics';
import { captureImageFromCamera, pickImageFromGallery } from '../utils/imageUtils';

interface CameraButtonProps {
  onImageSelected: (uri: string) => void;
  onManualEntry: () => void;
  style?: object;
}

export default function CameraButton({ onImageSelected, onManualEntry, style }: CameraButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleTakePhoto = async () => {
    setModalVisible(false);
    haptics.medium();

    try {
      const result = await captureImageFromCamera();
      if (result) {
        haptics.success();
        onImageSelected(result.uri);
      }
    } catch (error: any) {
      haptics.error();
      if (error.message.includes('permission')) {
        Alert.alert(
          'Permission Denied',
          'Please enable camera access in your device settings to scan receipts.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to open camera. Please try again.');
      }
    }
  };

  const handleChooseFromGallery = async () => {
    setModalVisible(false);
    haptics.medium();

    try {
      const result = await pickImageFromGallery();
      if (result) {
        haptics.success();
        onImageSelected(result.uri);
      }
    } catch (error: any) {
      haptics.error();
      if (error.message.includes('permission')) {
        Alert.alert(
          'Permission Denied',
          'Please enable photo library access in your device settings.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to open gallery. Please try again.');
      }
    }
  };

  const handleManualEntry = () => {
    setModalVisible(false);
    haptics.medium();
    onManualEntry();
  };

  const showOptions = () => {
    haptics.light();

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery', 'Enter Manually'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handleChooseFromGallery();
          } else if (buttonIndex === 3) {
            handleManualEntry();
          }
        }
      );
    } else {
      setModalVisible(true);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.fab, style]}
        onPress={showOptions}
        accessibilityLabel="Add expense"
      >
        <Text style={styles.fabIcon}>📸</Text>
      </TouchableOpacity>

      {/* Android Action Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          haptics.light();
          setModalVisible(false);
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            haptics.light();
            setModalVisible(false);
          }}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Receipt</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleTakePhoto}
            >
              <Text style={styles.modalOptionIcon}>📷</Text>
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleChooseFromGallery}
            >
              <Text style={styles.modalOptionIcon}>🖼️</Text>
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleManualEntry}
            >
              <Text style={styles.modalOptionIcon}>✏️</Text>
              <Text style={styles.modalOptionText}>Enter Manually</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancel]}
              onPress={() => {
                haptics.light();
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.large,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: theme.borderRadius.xlarge,
    borderTopRightRadius: theme.borderRadius.xlarge,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.sm,
  },
  modalOptionIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  modalCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: theme.spacing.md,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    flex: 1,
  },
});
