import React, { useMemo, memo } from 'react';
import { Modal, View, TouchableWithoutFeedback, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createHomeStyles } from '../../app/styles/homePage.styles';

const ACCENT = '#0096c7';

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onUpdateInfo: () => void;
  onHelp: () => void;
  onLogout: () => void;
  colors: AppColors;
}

export const SideMenu = memo(({ visible, onClose, onUpdateInfo, onHelp, onLogout, colors }: SideMenuProps) => {
  // Memoize styles to prevent unnecessary recalculations
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade" 
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop - Tap to close */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        {/* Menu Content */}
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.menuItems}>
            <MenuItem 
              icon="person-outline" 
              label="Update Personal Info" 
              onPress={onUpdateInfo} 
              styles={styles} 
              color={ACCENT} 
            />
            
            <MenuItem 
              icon="help-circle-outline" 
              label="Help" 
              onPress={onHelp} 
              styles={styles} 
              color={ACCENT} 
            />
            
            <View style={styles.divider} />
            
            <MenuItem 
              icon="log-out-outline" 
              label="Logout" 
              onPress={onLogout} 
              styles={styles} 
              color="#ef4444" 
              textColor="#ef4444" 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
});

// --- Sub-Components ---

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  styles: any;
  color: string;
  textColor?: string;
}

const MenuItem = ({ icon, label, onPress, styles, color, textColor }: MenuItemProps) => (
  <TouchableOpacity 
    style={styles.menuItem} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons name={icon} size={22} color={color} />
    <Text style={[styles.menuItemText, textColor ? { color: textColor } : undefined]}>
      {label}
    </Text>
  </TouchableOpacity>
);