/**
 * Camera Tab Screen
 * Handles camera/gallery selection when camera tab is tapped
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActionSheetIOS,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, theme } from '../../constants/colors';
import { haptics } from '../../utils/haptics';
import { captureImageFromCamera, pickImageFromGallery } from '../../utils/imageUtils';

export default function CameraTabScreen() {
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);

  const handleTakePhoto = async () => {
    setModalVisible(false);
    haptics.medium();

    try {
      const result = await captureImageFromCamera();
      if (result) {
        haptics.success();
        navigation.navigate('Home', {
          screen: 'ProcessingReceipt',
          params: { imageUri: result.uri },
        });
      } else {
        // User cancelled - go back to Home tab
        navigation.navigate('Home');
      }
    } catch (error: any) {
      haptics.error();
      if (error.message.includes('permission')) {
        Alert.alert(
          'Permission Denied',
          'Please enable camera access in your device settings to scan receipts.',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      } else {
        Alert.alert('Error', 'Failed to open camera. Please try again.', [
          { text: 'OK', onPress: () => navigation.navigate('Home') },
        ]);
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
        navigation.navigate('Home', {
          screen: 'ProcessingReceipt',
          params: { imageUri: result.uri },
        });
      } else {
        // User cancelled - go back to Home tab
        navigation.navigate('Home');
      }
    } catch (error: any) {
      haptics.error();
      if (error.message.includes('permission')) {
        Alert.alert(
          'Permission Denied',
          'Please enable photo library access in your device settings.',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      } else {
        Alert.alert('Error', 'Failed to open gallery. Please try again.', [
          { text: 'OK', onPress: () => navigation.navigate('Home') },
        ]);
      }
    }
  };

  const handleManualEntry = () => {
    setModalVisible(false);
    haptics.medium();
    navigation.navigate('Home', { screen: 'AddExpense' });
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
          } else {
            // User cancelled - go back to Home tab
            navigation.navigate('Home');
          }
        }
      );
    } else {
      setModalVisible(true);
    }
  };

  // Show options every time this screen is focused
  useFocusEffect(
    React.useCallback(() => {
      showOptions();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Android Action Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          haptics.light();
          setModalVisible(false);
          navigation.navigate('Home');
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            haptics.light();
            setModalVisible(false);
            navigation.navigate('Home');
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Receipt</Text>

            <TouchableOpacity style={styles.modalOption} onPress={handleTakePhoto}>
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

            <TouchableOpacity style={styles.modalOption} onPress={handleManualEntry}>
              <Text style={styles.modalOptionIcon}>✏️</Text>
              <Text style={styles.modalOptionText}>Enter Manually</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancel]}
              onPress={() => {
                haptics.light();
                setModalVisible(false);
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
