import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../app/styles/index.styles'; // Import shared styles or specific button styles

interface ActionButtonProps {
  title: string;
  onPress: () => void;
}

export const ActionButton = ({ title, onPress }: ActionButtonProps) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
    <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.icon} />
  </TouchableOpacity>
);