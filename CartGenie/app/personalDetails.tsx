import React, { useState, useMemo } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  ActivityIndicator,
  Keyboard, // used to hide the keyboard when opening pickers
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors, AppColors } from '@/components/appThemeProvider';

type Sex = '' | 'male' | 'female';

type Errors = {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  sex?: string;
};

const CARD_MAX = 520;
const ACCENT = '#0096c7';

export default function PersonalDetails() {
  const router = useRouter();
  const col = useAppColors();

  // All params forwarded from the previous screen.
  // 'username' is currently used only for display in the header banner.
  const params = useLocalSearchParams();
  const { username } = params;

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [ageYears, setAgeYears] = useState<string>('');
  const [sex, setSex] = useState<Sex>('');

  // UI state
  const [showSexPicker, setShowSexPicker] = useState(false);
  const [showAgePicker, setShowAgePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Temp state for sex selection inside the modal.
  // This prevents closing the modal on simple scroll.
  const [tempSex, setTempSex] = useState<Sex>('');

  // Validation errors
  const [errors, setErrors] = useState<Errors>({});

  // Handle date selection and derive age in years.
  // On iOS the picker stays open until user closes the modal manually.
  const onAgeChange = (_event: any, selected?: Date) => {
    if (!selected) return;

    setBirthDate(selected);

    const today = new Date();
    let years = today.getFullYear() - selected.getFullYear();
    const m = today.getMonth() - selected.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < selected.getDate())) years--;
    setAgeYears(String(years));

    if (errors.birthDate) {
      setErrors(prev => ({ ...prev, birthDate: undefined }));
    }

    // On Android, close the date picker immediately after selection.
    if (Platform.OS !== 'ios') {
      setShowAgePicker(false);
    }
  };

  // Format a Date value as DD/MM/YYYY for display.
  const formatDate = (d?: Date | null) => {
    if (!d) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Basic client-side validation before continuing to the next step.
  const validate = () => {
    const e: Errors = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (!birthDate) e.birthDate = 'Birth date is required';
    if (!sex) e.sex = 'Sex is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Continue to the next screen and pass all collected data forward.
  const onContinue = async () => {
    if (loading) return;
    if (!validate()) return;

    try {
      setLoading(true);

      // Build an object representing what would be sent to the backend.
      const payloadForBackendPreview = {
        ...(params as any),
        firstName,
        lastName,
        birthDate: birthDate?.toISOString() || '',
        ageYears,
        sex,
      };

      // Console preview for backend integration / debugging.
      console.log(
        'PersonalDetails – payload for backend preview:',
        payloadForBackendPreview,
      );

      // Placeholder delay while backend integration is not yet connected.
      await new Promise(r => setTimeout(r, 700));

      router.push({
        pathname: '/bodyMeasures',
        params: payloadForBackendPreview,
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = useMemo(() => makeStyles(col), [col]);

  // Disable the Continue button when required fields are missing or we are loading.
  const isDisabled = loading || !firstName || !lastName || !birthDate || !sex;

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Info' }} />

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Personal Information</Text>

          {/* Show a small banner with the username if it was passed from login. */}
          {username && (
            <View style={styles.usernameBanner}>
              <Ionicons name="person-circle" size={20} color={col.accent ?? ACCENT} />
              <Text style={styles.usernameText}>Logged in as: {username}</Text>
            </View>
          )}

          {/* First Name */}
          <View style={styles.field}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              placeholder="Enter your first name"
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholderTextColor="#9AA0A6"
              value={firstName}
              onChangeText={(t) => {
                setFirstName(t);
                if (errors.firstName) {
                  setErrors(p => ({ ...p, firstName: undefined }));
                }
              }}
              // When focusing a text field, make sure pickers are hidden.
              onFocus={() => {
                setShowAgePicker(false);
                setShowSexPicker(false);
              }}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {!!errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          </View>

          {/* Last Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              placeholder="Enter your last name"
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholderTextColor="#9AA0A6"
              value={lastName}
              onChangeText={(t) => {
                setLastName(t);
                if (errors.lastName) {
                  setErrors(p => ({ ...p, lastName: undefined }));
                }
              }}
              onFocus={() => {
                setShowAgePicker(false);
                setShowSexPicker(false);
              }}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {!!errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>

          {/* Birth Date */}
          <View style={styles.field}>
            <Text style={styles.label}>Birth Date</Text>
            <TouchableOpacity
              style={[styles.input, styles.inputButton, errors.birthDate && styles.inputError]}
              activeOpacity={0.85}
              onPress={() => {
                // Whenever we open the date picker, exit text-edit mode and hide the keyboard.
                Keyboard.dismiss();
                setShowSexPicker(false);
                setShowAgePicker(true);
              }}
            >
              <Text style={[styles.inputText, { color: birthDate ? '#111827' : '#9AA0A6' }]}>
                {birthDate ? formatDate(birthDate) : 'Select your birth date'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#94A3B8" />
            </TouchableOpacity>
            {!!errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
            {!!ageYears && <Text style={styles.helperText}>Calculated age: {ageYears}</Text>}
          </View>

          {/* Sex */}
          <View style={styles.field}>
            <Text style={styles.label}>Sex</Text>
            <TouchableOpacity
              style={[styles.input, styles.inputButton, errors.sex && styles.inputError]}
              activeOpacity={0.85}
              onPress={() => {
                // When opening the sex picker, hide the keyboard and initialize tempSex.
                Keyboard.dismiss();
                setShowAgePicker(false);
                setTempSex(sex);
                setShowSexPicker(true);
              }}
            >
              <Text style={[styles.inputText, { color: sex ? '#111827' : '#9AA0A6' }]}>
                {sex ? sex.charAt(0).toUpperCase() + sex.slice(1) : 'Select sex'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#94A3B8" />
            </TouchableOpacity>
            {!!errors.sex && <Text style={styles.errorText}>{errors.sex}</Text>}
          </View>

          {/* Continue */}
          <TouchableOpacity
            style={[styles.ContinueButton, isDisabled && { opacity: 0.5 }]}
            onPress={onContinue}
            disabled={isDisabled}
            activeOpacity={0.9}
            accessibilityState={{ disabled: isDisabled, busy: loading }}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[styles.ContinueButtonText, { marginLeft: 8 }]}>
                  Saving…
                </Text>
              </>
            ) : (
              <Text style={styles.ContinueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Birth Date Modal */}
      <Modal
        visible={showAgePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAgePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <DateTimePicker
              value={birthDate ?? new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onAgeChange}
              maximumDate={new Date()}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAgePicker(false)}
            >
              <Text style={styles.closeButtonText}>Choose</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sex Modal */}
      <Modal
        visible={showSexPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSexPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />

            {/* Keep the picker open while user scrolls; only update tempSex here. */}
            <Picker
              selectedValue={tempSex}
              onValueChange={(value: Sex) => {
                setTempSex(value);
              }}
            >
              <Picker.Item label="Select Sex" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>

            {/* Apply selection and close only when the user explicitly confirms. */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSex(tempSex);
                if (errors.sex) {
                  setErrors(p => ({ ...p, sex: undefined }));
                }
                setShowSexPicker(false);
              }}
            >
              <Text style={styles.closeButtonText}>Choose</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    card: {
      width: '100%',
      maxWidth: CARD_MAX,
      backgroundColor: c.card,
      borderRadius: 18,
      paddingHorizontal: 20,
      paddingVertical: 24,
      ...Platform.select({
        ios: {
          shadowColor: '#0F172A',
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
        },
        android: { elevation: 5 },
      }),
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: c.text,
      marginBottom: 18,
      letterSpacing: 0.2,
    },
    usernameBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${ACCENT}15`,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 16,
      gap: 8,
    },
    usernameText: {
      fontSize: 14,
      color: c.text,
      fontWeight: '600',
    },
    field: { marginBottom: 16 },
    label: {
      fontSize: 13,
      color: c.subtitle,
      marginBottom: 6,
      letterSpacing: 0.2,
    },
    input: {
      width: '100%',
      backgroundColor: c.inputBg,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      fontSize: 16,
      color: c.text,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    inputError: {
      borderColor: '#ef4444',
    },
    errorText: {
      marginTop: 6,
      fontSize: 12,
      color: '#ef4444',
    },
    inputButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: 12,
    },
    inputText: { fontSize: 16 },
    helperText: {
      marginTop: 6,
      fontSize: 12,
      color: c.text,
    },
    ContinueButton: {
      width: '100%',
      backgroundColor: c.accent ?? ACCENT,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 6,
      flexDirection: 'row',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#0369A1',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.22,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
      }),
    },
    ContinueButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.3,
    },

    // Modals
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(17, 24, 39, 0.35)',
    },
    modalContainer: {
      backgroundColor: c.inputBg,
      paddingTop: 8,
      paddingBottom: 16,
      paddingHorizontal: 12,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    modalHandle: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: '#D1D5DB',
      marginBottom: 10,
    },
    closeButton: {
      alignSelf: 'center',
      marginTop: 12,
      backgroundColor: c.accent ?? ACCENT,
      paddingVertical: 10,
      paddingHorizontal: 28,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    closeButtonText: {
      color: '#fff',
      fontWeight: '700',
      letterSpacing: 0.3,
    },
  });
