import React, { useMemo, memo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createProductResultStyles } from '../../app/styles/productResult.styles';
import { AIAnalysisResult } from '../../data/productTypes';

const ACCENT = '#0096c7';

// --- Configuration ---

type StatusType = 'SAFE' | 'CAUTION' | 'AVOID';

interface StatusConfig {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  SAFE:    { color: '#10B981', icon: 'checkmark-circle', text: 'Safe to Consume' },
  CAUTION: { color: '#F59E0B', icon: 'warning',          text: 'Consume with Caution' },
  AVOID:   { color: '#EF4444', icon: 'alert-circle',     text: 'Better to Avoid' },
  DEFAULT: { color: '#64748B', icon: 'help-circle',      text: 'Unknown' },
};

// --- Main Component ---

interface AiAnalysisCardProps {
  result: AIAnalysisResult;
  colors: AppColors;
}

export const AiAnalysisCard = memo(({ result, colors }: AiAnalysisCardProps) => {
  const styles = useMemo(() => createProductResultStyles(colors), [colors]);

  // Determine status configuration
  const status = STATUS_MAP[result.recommendation] || STATUS_MAP.DEFAULT;

  return (
    <View style={[styles.aiCard, { borderColor: status.color }]}>
      {/* Header Badge */}
      <View style={[styles.statusHeader, { backgroundColor: status.color }]}>
        <Ionicons name={status.icon} size={24} color="#fff" />
        <Text style={styles.statusTitle}>{status.text}</Text>
      </View>

      <View style={styles.aiBody}>
        {/* Insight Header */}
        <View style={styles.aiLabelRow}>
          <Ionicons name="sparkles" size={16} color={ACCENT} />
          <Text style={styles.aiLabel}>AI Health Insight</Text>
        </View>
        
        {/* Main Reason */}
        <Text style={styles.aiReasonText}>{result.reason}</Text>

        {/* Alternatives Section */}
        <AlternativesList alternatives={result.alternatives} styles={styles} />
      </View>
    </View>
  );
});

// --- Sub-Components ---

interface AlternativesListProps {
  alternatives?: { name: string; reason: string }[];
  styles: any;
}

const AlternativesList = ({ alternatives, styles }: AlternativesListProps) => {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <View style={styles.altContainer}>
      <Text style={styles.altTitle}>Better Alternatives:</Text>
      {alternatives.map((alt, index) => (
        <View key={index} style={styles.altItem}>
          <Ionicons name="leaf-outline" size={14} color="#10B981" />
          <Text style={styles.altText}>
            <Text style={{ fontWeight: '700' }}>{alt.name}</Text>: {alt.reason}
          </Text>
        </View>
      ))}
    </View>
  );
};