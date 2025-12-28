import React, { useMemo, memo } from 'react';
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

export const StatusCard = memo(({ 
  personalCompleted, 
  bodyMeasuresCompleted, 
  hasAnyIllnesses, 
  illnessesLoading, 
  colors 
}: StatusCardProps) => {
  // Memoize styles
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  return (
    <View style={styles.statusCard}>
      <Text style={styles.statusTitle}>Profile status</Text>
      
      <StatusRow 
        completed={personalCompleted} 
        textTrue="Personal info completed" 
        textFalse="Personal info missing" 
        styles={styles}
        colors={colors}
      />
      
      <StatusRow 
        completed={bodyMeasuresCompleted} 
        textTrue="Body measures completed" 
        textFalse="Body measures missing" 
        styles={styles}
        colors={colors}
      />
      
      <StatusRow 
        completed={hasAnyIllnesses} 
        loading={illnessesLoading} 
        textTrue="Health conditions selected" 
        textFalse="Health conditions not selected yet" 
        styles={styles}
        colors={colors}
      />
    </View>
  );
});

// --- Sub-Components ---

interface StatusRowProps {
  completed: boolean;
  loading?: boolean;
  textTrue: string;
  textFalse: string;
  styles: any;
  colors: AppColors;
}

const StatusRow = ({ completed, loading, textTrue, textFalse, styles, colors }: StatusRowProps) => {
  // Determine Visual State
  const isSuccess = completed && !loading;
  
  const iconName = loading 
    ? 'ellipse-outline' 
    : (isSuccess ? 'checkmark-circle' : 'ellipse-outline');

  const iconColor = loading 
    ? colors.subtitle 
    : (isSuccess ? '#22c55e' : colors.subtitle);

  const displayText = loading 
    ? 'Loading...' 
    : (isSuccess ? textTrue : textFalse);

  return (
    <View style={styles.statusRow}>
      <Ionicons name={iconName} size={18} color={iconColor} />
      <Text style={[styles.statusText, !isSuccess && { color: colors.subtitle }]}>
        {displayText}
      </Text>
    </View>
  );
};