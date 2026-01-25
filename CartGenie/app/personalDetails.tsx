import React, { useMemo } from 'react';
import { Stack } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  Keyboard,
  StyleSheet
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors, AppColors } from '@/components/appThemeProvider';
import { usePersonalDetailsLogic, Sex } from '../hooks/usePersonalDetailsLogic';
import { createPersonalDetailsStyles } from '../app/styles/personalDetails.styles';
import { InputField } from '../components/InputField';
import { SelectField } from '../components/SelectField';

const ACCENT = '#0096c7';

export default function PersonalDetails() {
  const col = useAppColors();
  const styles = useMemo(() => createPersonalDetailsStyles(col), [col]);
  
  const { form, setters, ui, errors, params, actions, helpers, isDisabled } = usePersonalDetailsLogic();

  const handleInputFocus = () => ui.setShowAgePicker(false);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Info' }} />

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Personal Information</Text>

          {params.username && (
            <View style={styles.usernameBanner}>
              <Ionicons name="person-circle" size={20} color={ACCENT} />
              <Text style={styles.usernameText}>Logged in as: {params.username}</Text>
            </View>
          )}

          <InputField
            label="First Name"
            placeholder="Enter your first name"
            value={form.firstName}
            onChangeText={(t) => {
              setters.setFirstName(t);
              if (errors.firstName) actions.validate();
            }}
            colors={col}
            autoCapitalize="words"
            returnKeyType="next"
            error={errors.firstName}
            onFocus={handleInputFocus}
          />

          <InputField
            label="Last Name"
            placeholder="Enter your last name"
            value={form.lastName}
            onChangeText={setters.setLastName}
            colors={col}
            autoCapitalize="words"
            returnKeyType="next"
            error={errors.lastName}
            onFocus={handleInputFocus}
          />

          <SelectField
            label="Birth Date"
            placeholder="Select your birth date"
            value={helpers.formatDate(form.birthDate)}
            onPress={() => {
              Keyboard.dismiss();
              ui.setShowAgePicker(true);
            }}
            iconName="calendar-outline"
            colors={col}
            error={errors.birthDate}
            helperText={form.ageYears ? `Calculated age: ${form.ageYears}` : undefined}
          />

          <SexSelector 
            selected={form.sex} 
            onSelect={setters.setSex} 
            error={errors.sex} 
            colors={col} 
          />

          <TouchableOpacity
            style={[styles.primaryButton, isDisabled && { opacity: 0.5 }]}
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
      </View>

      {Platform.OS === 'ios' && (
        <Modal 
          visible={ui.showAgePicker} 
          transparent 
          animationType="slide" 
          onRequestClose={() => ui.setShowAgePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHandle} />
              <DateTimePicker
                value={form.birthDate ?? new Date(2000, 0, 1)}
                mode="date"
                display="spinner"
                onChange={actions.onAgeChange}
                maximumDate={new Date()}
                textColor={col.text}
              />
              <TouchableOpacity style={styles.modalButton} onPress={() => ui.setShowAgePicker(false)}>
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && ui.showAgePicker && (
        <DateTimePicker
          value={form.birthDate ?? new Date(2000, 0, 1)}
          mode="date"
          display="default"
          onChange={actions.onAgeChange}
          maximumDate={new Date()}
        />
      )}
    </>
  );
}

interface SexSelectorProps {
  selected: Sex | null;
  onSelect: (sex: Sex) => void;
  error?: string;
  colors: AppColors;
}

const SexSelector = ({ selected, onSelect, error, colors }: SexSelectorProps) => {
  const options: Sex[] = ['male', 'female'];

  const localStyles = StyleSheet.create({
    container: { marginBottom: 20 },
    label: {
      marginBottom: 8,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 4,
    },
    row: { flexDirection: 'row', gap: 12 },
    optionBtn: {
      flex: 1,
      paddingVertical: 14,
      borderWidth: 1,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionText: {
      fontSize: 16,
    },
    errorText: {
      color: '#ef4444',
      fontSize: 12,
      marginTop: 6,
      marginLeft: 4,
    },
  });

  return (
    <View style={localStyles.container}>
      <Text style={localStyles.label}>Sex</Text>
      <View style={localStyles.row}>
        {options.map((option) => {
          const isSelected = selected === option;
          const displayLabel = option.charAt(0).toUpperCase() + option.slice(1);

          return (
            <TouchableOpacity
              key={option}
              onPress={() => onSelect(option)}
              activeOpacity={0.7}
              style={[
                localStyles.optionBtn,
                {
                  backgroundColor: isSelected ? ACCENT : 'transparent',
                  borderColor: isSelected ? ACCENT : '#ccc',
                },
              ]}
            >
              <Text
                style={[
                  localStyles.optionText,
                  {
                    color: isSelected ? '#FFF' : colors.text,
                    fontWeight: isSelected ? '700' : '400',
                  },
                ]}
              >
                {displayLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text style={localStyles.errorText}>{error}</Text>}
    </View>
  );
};