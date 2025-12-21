import React, { useMemo } from 'react';
import { Stack } from 'expo-router';
import {
  View, Text, TouchableOpacity, Modal, ActivityIndicator, Platform, Keyboard
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors } from '@/components/appThemeProvider';
// וודא ש-Sex מיובא מכאן
import { usePersonalDetailsLogic, Sex } from '../hooks/usePersonalDetailsLogic';
import { createPersonalDetailsStyles } from '../app/styles/personalDetails.styles';
import { InputField } from '../components/InputField';
import { SelectField } from '../components/SelectField';

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
            onChangeText={(t) => { setters.setFirstName(t); if(errors.firstName) actions.validate(); }}
            colors={col}
            autoCapitalize="words"
            returnKeyType="next"
            error={errors.firstName}
            // הסרנו את ui.setShowSexPicker מכאן כי המודל בוטל
            onFocus={() => { ui.setShowAgePicker(false); }}
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
            onFocus={() => { ui.setShowAgePicker(false); }}
          />

          {/* Date Selector */}
          <SelectField
            label="Birth Date"
            placeholder="Select your birth date"
            value={helpers.formatDate(form.birthDate)}
            onPress={() => { Keyboard.dismiss(); ui.setShowAgePicker(true); }}
            iconName="calendar-outline"
            colors={col}
            error={errors.birthDate}
            helperText={form.ageYears ? `Calculated age: ${form.ageYears}` : undefined}
          />

          {/* --- Sex Selector (Fixed & Updated) --- */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ 
                marginBottom: 8, 
                fontWeight: '600', 
                color: col.text,
                marginLeft: 4 
            }}>Sex</Text>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {['Male', 'Female','Other'].map((option) => {
                // תיקון 1: המרה מפורשת לטיפוס Sex
                const value = option.toLowerCase() as Sex; 
                const isSelected = form.sex === value;
                
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setters.setSex(value)}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      backgroundColor: isSelected ? ACCENT : 'transparent',
                      borderWidth: 1,
                      // תיקון 2: שימוש בצבע אפור קבוע במקום col.border החסר
                      borderColor: isSelected ? ACCENT : '#ccc', 
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ 
                      color: isSelected ? '#FFF' : col.text,
                      fontWeight: isSelected ? '700' : '400',
                      fontSize: 16
                    }}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {errors.sex && (
                <Text style={{ color: 'red', fontSize: 12, marginTop: 6, marginLeft: 4 }}>
                    {errors.sex}
                </Text>
            )}
          </View>
          {/* --- End of Sex Selector --- */}

          {/* Continue Button */}
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
              textColor={col.text}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.modalButton} onPress={() => ui.setShowAgePicker(false)}>
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

    </>
  );
}