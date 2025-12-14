import React, { useMemo } from 'react';
import { Stack } from 'expo-router';
import {
  View, Text, TouchableOpacity, Modal, ActivityIndicator, Platform, Keyboard
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors } from '@/components/appThemeProvider';
import { usePersonalDetailsLogic, Sex } from '../hooks/usePersonalDetailsLogic';
import { createPersonalDetailsStyles } from '../app/styles/personalDetails.styles';
import { InputField } from '../components/InputField'; // הקיים
import { SelectField } from '../components/SelectField'; // החדש שיצרנו

const ACCENT = '#0096c7';

export default function PersonalDetails() {
  const col = useAppColors();
  const styles = useMemo(() => createPersonalDetailsStyles(col), [col]);
  
  const { form, setters, ui, errors, params, actions, helpers, isDisabled } = usePersonalDetailsLogic();

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Info' }} />

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Personal Information</Text>

          {/* Banner */}
          {params.username && (
            <View style={styles.usernameBanner}>
              <Ionicons name="person-circle" size={20} color={ACCENT} />
              <Text style={styles.usernameText}>Logged in as: {params.username}</Text>
            </View>
          )}

          {/* Text Inputs */}
          <InputField
            label="First Name"
            placeholder="Enter your first name"
            value={form.firstName}
            onChangeText={(t) => { setters.setFirstName(t); if(errors.firstName) actions.validate(); }} // simple clear error logic inside hook is better usually
            colors={col}
            autoCapitalize="words"
            returnKeyType="next"
            error={errors.firstName}
            onFocus={() => { ui.setShowAgePicker(false); ui.setShowSexPicker(false); }}
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
            onFocus={() => { ui.setShowAgePicker(false); ui.setShowSexPicker(false); }}
          />

          {/* Date Selector */}
          <SelectField
            label="Birth Date"
            placeholder="Select your birth date"
            value={helpers.formatDate(form.birthDate)}
            onPress={() => { Keyboard.dismiss(); ui.setShowSexPicker(false); ui.setShowAgePicker(true); }}
            iconName="calendar-outline"
            colors={col}
            error={errors.birthDate}
            helperText={form.ageYears ? `Calculated age: ${form.ageYears}` : undefined}
          />

          {/* Sex Selector */}
          <SelectField
            label="Sex"
            placeholder="Select sex"
            value={form.sex ? form.sex.charAt(0).toUpperCase() + form.sex.slice(1) : ''}
            onPress={actions.openSexPicker}
            iconName="chevron-down"
            colors={col}
            error={errors.sex}
          />

          {/* Continue Button (Reusing styles from auth base) */}
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

      {/* --- Modals --- */}
      
      {/* Date Picker Modal */}
      <Modal visible={ui.showAgePicker} transparent animationType="slide" onRequestClose={() => ui.setShowAgePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <DateTimePicker
              value={form.birthDate ?? new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={actions.onAgeChange}
              maximumDate={new Date()}
              textColor={col.text} // Important for Dark Mode on iOS
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.modalButton} onPress={() => ui.setShowAgePicker(false)}>
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Sex Picker Modal */}
      <Modal visible={ui.showSexPicker} transparent animationType="slide" onRequestClose={() => ui.setShowSexPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <Picker
              selectedValue={ui.tempSex}
              onValueChange={(val) => setters.setTempSex(val as Sex)}
              itemStyle={{ color: col.text }} // Important for iOS Dark Mode
            >
              <Picker.Item label="Select Sex" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
            <TouchableOpacity style={styles.modalButton} onPress={actions.confirmSexSelection}>
              <Text style={styles.modalButtonText}>Choose</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}