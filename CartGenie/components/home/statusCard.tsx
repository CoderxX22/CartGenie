import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createHomeStyles } from '../../app/styles/homePage.styles';

interface StatusCardProps {
  personalCompleted: boolean;
  bodyMeasuresCompleted: boolean;
  hasAnyIllnesses: boolean;
  illnessesLoading: boolean;
  colors: AppColors;
}

export const StatusCard = ({ 
  personalCompleted, bodyMeasuresCompleted, hasAnyIllnesses, illnessesLoading, colors 
}: StatusCardProps) => {
  const styles = createHomeStyles(colors);

  const StatusRow = ({ completed, loading, textTrue, textFalse }: any) => {
    const isOk = completed;
    const color = loading ? colors.subtitle : (isOk ? '#22c55e' : colors.subtitle);
    const icon = loading ? 'ellipse-outline' : (isOk ? 'checkmark-circle' : 'ellipse-outline');
    
    return (
      <View style={styles.statusRow}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={[styles.statusText, !isOk && { color: colors.subtitle }]}>
          {loading ? 'Loading...' : (isOk ? textTrue : textFalse)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.statusCard}>
      <Text style={styles.statusTitle}>Profile status</Text>
      <StatusRow completed={personalCompleted} textTrue="Personal info completed" textFalse="Personal info missing" />
      <StatusRow completed={bodyMeasuresCompleted} textTrue="Body measures completed" textFalse="Body measures missing" />
      
      <StatusRow 
        completed={hasAnyIllnesses} 
        loading={illnessesLoading} 
        textTrue="Health conditions selected" 
        textFalse="Health conditions not selected yet" 
      />
    </View>
  );
};