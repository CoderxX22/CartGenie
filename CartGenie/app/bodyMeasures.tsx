import React, { useMemo } from 'react';
import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors, AppColors } from '@/components/appThemeProvider';
import { useBodyMeasuresLogic } from '../hooks/useBodyMeasuresLogic';
import { createBodyMeasuresStyles } from '../app/styles/bodyMeasures.styles';
import { InputField } from '../components/InputField';

const ACCENT = '#0096c7';

// --- Sub Components (DRY) ---

const MeasurementInput = ({ 
  label, icon, value, onChangeText, error, placeholder, colors 
}: { 
  label: string; icon: keyof typeof Ionicons.glyphMap; value: string; onChangeText: (t: string) => void; error?: string; placeholder: string; colors: AppColors;
}) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
    <View style={{ width: 32, alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
      <Ionicons name={icon} size={22} color={colors.accent ?? ACCENT} />
    </View>
    <View style={{ flex: 1, marginLeft: 8 }}>
      <InputField
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType="numeric"
        returnKeyType="next"
        colors={colors}
        error={error}
        style={{ paddingVertical: 12 }} // Slight adjustment for this screen
      />
    </View>
  </View>
);

const MetricRow = ({ 
  label, value, status, onInfoPress, colors 
}: { 
  label: string; value: string; status: { label: string; bg: string; text: string } | null; onInfoPress: () => void; colors: AppColors;
}) => {
  const styles = useMemo(() => createBodyMeasuresStyles(colors), [colors]);
  return (
    <View style={styles.metricRow}>
      <View style={styles.metricLabelRow}>
        <Text style={styles.metricLabel}>{label}</Text>
        <TouchableOpacity onPress={onInfoPress} hitSlop={8}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent ?? ACCENT} />
        </TouchableOpacity>
      </View>
      <View style={styles.metricValueColumn}>
        <Text style={styles.metricValue}>{value}</Text>
        {status && (
          <Text style={[styles.metricBadge, { backgroundColor: status.bg, color: status.text }]}>
            {status.label}
          </Text>
        )}
      </View>
    </View>
  );
};

const InfoModal = ({ 
  visible, onClose, title, lines, colors 
}: { 
  visible: boolean; onClose: () => void; title: string; lines: string[]; colors: AppColors;
}) => {
  const styles = useMemo(() => createBodyMeasuresStyles(colors), [colors]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.infoOverlay}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>{title}</Text>
          {lines.map((line, i) => (
            <Text key={i} style={styles.infoText}>{line}</Text>
          ))}
          <TouchableOpacity style={[styles.primaryButton, { marginTop: 10, width: 'auto', alignSelf: 'center', paddingHorizontal: 30, paddingVertical: 10 }]} onPress={onClose}>
             <Text style={styles.primaryButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- Main Screen ---

export default function BodyMeasuresScreen() {
  const col = useAppColors();
  const styles = useMemo(() => createBodyMeasuresStyles(col), [col]);
  const { values, setters, ui, actions, isDisabled, status } = useBodyMeasuresLogic();

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Body measures' }} />

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" style={{ width: '100%' }}>
          <View style={styles.card}>
            <Text style={styles.title}>Body Measurements</Text>
            <Text style={styles.subtitle}>
              Please enter your measurements in metric units. These values are used to compute your BMI and waist-to-height ratio.
            </Text>

            {/* Inputs - Using the DRY Component */}
            <MeasurementInput
              label="Height (cm)"
              icon="swap-vertical-outline"
              placeholder="Enter height"
              value={values.height}
              onChangeText={setters.setHeight}
              error={ui.errors.height}
              colors={col}
            />

            <MeasurementInput
              label="Weight (kg)"
              icon="scale-outline"
              placeholder="Enter weight"
              value={values.weight}
              onChangeText={setters.setWeight}
              error={ui.errors.weight}
              colors={col}
            />

            <MeasurementInput
              label="Waist circumference (cm)"
              icon="accessibility-outline"
              placeholder="Enter waist"
              value={values.waist}
              onChangeText={setters.setWaist}
              error={ui.errors.waist}
              colors={col}
            />

            {/* Metrics Card */}
            <View style={styles.metricsCard}>
              <MetricRow
                label="BMI"
                value={values.bmi ? values.bmi.toFixed(1) : '--'}
                status={status.bmi}
                onInfoPress={() => ui.setInfoModal('bmi')}
                colors={col}
              />
              <MetricRow
                label="WHtR"
                value={values.whtr ? values.whtr.toFixed(3) : '--'}
                status={status.whtr}
                onInfoPress={() => ui.setInfoModal('whtr')}
                colors={col}
              />
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[styles.primaryButton, isDisabled && { opacity: 0.5 }, { marginTop: 18 }]}
              onPress={actions.onContinue}
              disabled={isDisabled}
              activeOpacity={0.9}
            >
              {ui.loading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.primaryButtonText}>Saving…</Text>
                </>
              ) : (
                <Text style={styles.primaryButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Info Modals - Using DRY Component */}
      <InfoModal
        visible={ui.infoModal === 'bmi'}
        onClose={() => ui.setInfoModal('none')}
        title="What is BMI?"
        lines={[
          "Body Mass Index (BMI) is a simple index of weight-for-height used to classify underweight, normal weight, overweight and obesity.",
          "Formula: BMI = weight (kg) / [height (m)]²"
        ]}
        colors={col}
      />

      <InfoModal
        visible={ui.infoModal === 'whtr'}
        onClose={() => ui.setInfoModal('none')}
        title="What is WHtR?"
        lines={[
          "Waist-to-Height Ratio (WHtR) is the ratio of your waist circumference to your height. It is often used to estimate central fat distribution and cardiometabolic risk.",
          "Formula: WHtR = waist circumference (cm) / height (cm)"
        ]}
        colors={col}
      />
    </>
  );
}