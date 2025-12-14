import React from 'react';
import { Modal, View, TouchableWithoutFeedback, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createHomeStyles } from '../../app/styles/homePage.styles';

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onUpdateInfo: () => void;
  onHelp: () => void;
  onLogout: () => void;
  colors: AppColors;
}

export const SideMenu = ({ visible, onClose, onUpdateInfo, onHelp, onLogout, colors }: SideMenuProps) => {
  const styles = createHomeStyles(colors);
  const accent = '#0096c7';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.menuItems}>
            <MenuItem icon="person-outline" label="Update Personal Info" onPress={onUpdateInfo} styles={styles} color={accent} />
            <MenuItem icon="help-circle-outline" label="Help" onPress={onHelp} styles={styles} color={accent} />
            <View style={styles.divider} />
            <MenuItem icon="log-out-outline" label="Logout" onPress={onLogout} styles={styles} color="#ef4444" textColor="#ef4444" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const MenuItem = ({ icon, label, onPress, styles, color, textColor }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={22} color={color} />
    <Text style={[styles.menuItemText, textColor && { color: textColor }]}>{label}</Text>
  </TouchableOpacity>
);