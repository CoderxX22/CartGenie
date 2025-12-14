import React from 'react';
import { View, Text } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';
import { createReceiptStyles } from '../../app/styles/receiptResults.styles';

export const ScoreCard = ({ score, colors }: { score: number; colors: AppColors }) => {
  const styles = createReceiptStyles(colors);

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#10B981'; 
    if (s >= 50) return '#F59E0B'; 
    return '#EF4444'; 
  };

  const color = getScoreColor(score);

  return (
    <View style={styles.scoreCard}>
      <Text style={styles.scoreTitle}>Cart Health Score</Text>
      <View style={[styles.scoreCircle, { borderColor: color + '30' }]}>
        <Text style={[styles.scoreNumber, { color: color }]}>{score}</Text>
      </View>
      <Text style={styles.scoreSubtitle}>Based on your health profile</Text>
    </View>
  );
};