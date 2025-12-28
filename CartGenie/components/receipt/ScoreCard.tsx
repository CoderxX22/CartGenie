import React, { useMemo, memo } from 'react';
import { View, Text } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';
import { createReceiptStyles } from '../../app/styles/receiptResults.styles';

interface ScoreCardProps {
  score: number;
  colors: AppColors;
}

export const ScoreCard = memo(({ score, colors }: ScoreCardProps) => {
  // Memoize styles to avoid recreation on every render
  const styles = useMemo(() => createReceiptStyles(colors), [colors]);

  // Determine color based on score thresholds
  const scoreColor = 
    score >= 80 ? '#10B981' : // Green
    score >= 50 ? '#F59E0B' : // Orange
    '#EF4444';                // Red

  return (
    <View style={styles.scoreCard}>
      <Text style={styles.scoreTitle}>Cart Health Score</Text>
      
      {/* Score Circle with transparent border matching the score color */}
      <View style={[styles.scoreCircle, { borderColor: scoreColor + '30' }]}>
        <Text style={[styles.scoreNumber, { color: scoreColor }]}>{score}</Text>
      </View>
      
      <Text style={styles.scoreSubtitle}>Based on your health profile</Text>
    </View>
  );
});