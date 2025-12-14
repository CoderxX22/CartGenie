import React, { useMemo } from 'react';
import { Stack } from 'expo-router';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppColors } from '@/components/appThemeProvider';
import { useIllnessesScreenLogic } from '../hooks/useIllnessesScreen';
import { createIllnessesStyles } from '../app/styles/illnesses.styles';
import { IllnessChip, ActionPill } from '../components/IllnessesComponents';
import { InputField } from '../components/InputField'; // שימוש חוזר

const ACCENT = '#0096c7';

export default function IllnessesScreen() {
  const insets = useSafeAreaInsets();
  const col = useAppColors();
  const styles = useMemo(() => createIllnessesStyles(col), [col]);
  
  const { state, actions } = useIllnessesScreenLogic();
  const { query, selected, other, filteredIllnesses, isSaving, loadingIllnesses, hasSelection, selectedCount } = state;

  if (loadingIllnesses) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Health Conditions' }} />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingTop: insets.top + 8 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Select Health Conditions</Text>
            <Text style={styles.subtitle}>
              Choose any health issues that may affect your nutrition.
            </Text>

            {/* Search Bar */}
            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color={col.subtitle} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search conditions..."
                placeholderTextColor={col.subtitle}
                value={query}
                onChangeText={actions.setQuery}
              />
            </View>

            {/* Action Pills */}
            <View style={styles.actionsRow}>
              <ActionPill 
                label="Nothing" 
                icon="checkmark-done" 
                isPrimary 
                onPress={actions.onConfirmNothing} 
                colors={col} 
              />
              <ActionPill 
                label="Clear All" 
                icon="close-circle-outline" 
                onPress={actions.handleClearAll} 
                colors={col} 
              />
              <View style={[styles.pillButton, { backgroundColor: col.inputBorder, borderColor: col.inputBorder }]}>
                 <Ionicons name="list-circle-outline" size={16} color={col.text} />
                 <Text style={styles.pillButtonText}>Selected: {selectedCount}</Text>
              </View>
            </View>

            {/* Chips Grid */}
            <View style={styles.chipsWrap}>
              {filteredIllnesses.map((item) => (
                <IllnessChip
                  key={item}
                  label={item}
                  isSelected={selected.has(item)}
                  onPress={() => actions.handleToggle(item)}
                  colors={col}
                />
              ))}
            </View>

            {/* Other Input */}
            <InputField 
                label="Other (free text)"
                placeholder="Type another condition..."
                value={other}
                onChangeText={actions.setOther}
                colors={col}
                maxLength={80}
            />

            {/* Finish Button */}
            <TouchableOpacity
              style={[styles.primaryButton, (!hasSelection || isSaving) && { opacity: 0.6 }]}
              onPress={actions.onFinish}
              disabled={!hasSelection || isSaving}
              activeOpacity={0.92}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={[styles.primaryButtonText, { marginLeft: 8 }]}>Saving Profile...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Finish & Save</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </View>
    </>
  );
}