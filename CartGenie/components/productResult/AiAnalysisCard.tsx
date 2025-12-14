import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createProductResultStyles } from '../../app/styles/productResult.styles';
import { AIAnalysisResult } from '../../data/productTypes';

const ACCENT = '#0096c7';

export const AiAnalysisCard = ({ result, colors }: { result: AIAnalysisResult; colors: AppColors }) => {
  const styles = createProductResultStyles(colors);

  let statusColor = '#64748B';
  let statusIcon: any = 'help-circle';
  let statusText = 'Unknown';

  switch (result.recommendation) {
    case 'SAFE':
      statusColor = '#10B981';
      statusIcon = 'checkmark-circle';
      statusText = 'Safe to Consume';
      break;
    case 'CAUTION':
      statusColor = '#F59E0B';
      statusIcon = 'warning';
      statusText = 'Consume with Caution';
      break;
    case 'AVOID':
      statusColor = '#EF4444';
      statusIcon = 'alert-circle';
      statusText = 'Better to Avoid';
      break;
  }

  return (
    <View style={[styles.aiCard, { borderColor: statusColor }]}>
      <View style={[styles.statusHeader, { backgroundColor: statusColor }]}>
        <Ionicons name={statusIcon} size={24} color="#fff" />
        <Text style={styles.statusTitle}>{statusText}</Text>
      </View>

      <View style={styles.aiBody}>
        <View style={styles.aiLabelRow}>
          <Ionicons name="sparkles" size={16} color={ACCENT} />
          <Text style={styles.aiLabel}>AI Health Insight</Text>
        </View>
        
        <Text style={styles.aiReasonText}>{result.reason}</Text>

        {result.alternatives && result.alternatives.length > 0 && (
          <View style={styles.altContainer}>
            <Text style={styles.altTitle}>Better Alternatives:</Text>
            {result.alternatives.map((alt, index) => (
              <View key={index} style={styles.altItem}>
                <Ionicons name="leaf-outline" size={14} color="#10B981" />
                <Text style={styles.altText}>
                  <Text style={{fontWeight: '700'}}>{alt.name}</Text>: {alt.reason}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};