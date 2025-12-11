import React, { useMemo, useState } from 'react';
import { API_URL } from "../src/config/api";
import { Stack, useRouter, Link, Href } from 'expo-router';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  Alert,              // 👈 added
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors, AppColors } from '@/components/appThemeProvider';

const { width } = Dimensions.get('window');
const ACCENT = '#0096c7';
const CARD_MAX = 520;

/** Evaluate password strength: returns level 0..4, label and color */
function getPasswordStrength(pwd: string) {
  const len = pwd.length;
  const lower = /[a-z]/.test(pwd);
  const upper = /[A-Z]/.test(pwd);
  const digit = /\d/.test(pwd);
  const symbol = /[^A-Za-z0-9]/.test(pwd);
  const common = /(password|qwerty|1234|1111|0000|abcd)/i.test(pwd);
  const repeats = /(.)\1{2,}/.test(pwd); // aaa, 111 etc.

  let score =
    len === 0 ? 0 :
    len < 6 ? 1 :
    len < 8 ? 2 :
    len < 12 ? 3 : 4;

  const variety = [lower, upper, digit, symbol].filter(Boolean).length;
  score += Math.max(0, variety - 2);

  if (common) score -= 2;
  if (repeats) score -= 1;
  score = Math.max(0, Math.min(4, score));

  const labels = ['very weak', 'weak', 'medium', 'strong', 'strong'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#22c55e'];

  return { level: score, label: labels[score], color: colors[score] };
}

export default function SignUpScreen() {
  const router = useRouter();
  const col = useAppColors();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string; username?: string; pwd?: string; pwd2?: string; accept?: string;
  }>({});

  const styles = useMemo(() => makeStyles(col), [col]);
  const strength = useMemo(() => getPasswordStrength(pwd), [pwd]);

  const validate = () => {
    const e: typeof errors = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim() || !emailRe.test(email)) e.email = 'Enter a valid email';
    if (!username.trim() || username.trim().length < 3) e.username = 'Username must be at least 3 characters';
    if (!pwd || pwd.length < 6) e.pwd = 'Password must be at least 6 characters';
    if (pwd2 !== pwd) e.pwd2 = 'Passwords do not match';
    if (!accept) e.accept = 'You must accept the Terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // 👇 handler to show funny Terms & Privacy Policy
  const showTerms = () => {
    Alert.alert(
      'CartGenie Terms & Privacy Policy',
      [
        '1. Introduction',
        'By creating an account you agree that CartGenie will try its best not to judge your snack choices, only to analyze them nicely.',
        '',
        '2. Use of the App',
        'You agree not to use CartGenie while sleep-walking through the supermarket or driving a shopping cart at unsafe speeds.',
        '',
        '3. Data We Collect',
        'We may store basic profile data and nutrition-related information. We will never sell your BMI to your gym trainer or your mother-in-law.',
        '',
        '4. Health Disclaimer',
        'CartGenie does not replace your doctor, dietitian, or that one very opinionated friend. All suggestions are informational and not medical advice.',
        '',
        '5. Cookies & Snacks',
        'We use digital “cookies”, not the edible kind. Real cookies are still your responsibility (but we may gently comment on them).',
        '',
        '6. Account Safety',
        'You are responsible for keeping your password safe and not writing it on a Post-it attached to your fridge.',
        '',
        '7. Changes to These Terms',
        'We may update these Terms when CartGenie learns new tricks. We will try not to change anything right before your exam or big deadline.',
        '',
        '8. Contact',
        'If you have questions, feedback, or brilliant feature ideas, please shout “Genie!” (or just contact our support).',
      ].join('\n')
    );
  };

  const onSubmit = async () => {
    if (loading) return;
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password: pwd,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Registration failed");
        return;
      }

      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || !email || !username || !pwd || !pwd2 || !accept;

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Sign Up' }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <View style={styles.card}>
              <Text style={styles.title}>Create Your CartGenie Account</Text>

              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  placeholder="name@example.com"
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholderTextColor={col.subtitle}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  returnKeyType="next"
                />
                {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Username */}
              <View style={styles.field}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  placeholder="Enter a username"
                  style={[styles.input, errors.username && styles.inputError]}
                  placeholderTextColor={col.subtitle}
                  autoCapitalize="none"
                  autoComplete="username"
                  value={username}
                  onChangeText={(t) => {
                    setUsername(t);
                    if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
                  }}
                  returnKeyType="next"
                />
                {!!errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    placeholder="Enter a password"
                    style={[styles.inputFlex, errors.pwd && styles.inputError]}
                    placeholderTextColor={col.subtitle}
                    secureTextEntry={!showPwd}
                    autoComplete="new-password"
                    value={pwd}
                    onChangeText={(t) => {
                      setPwd(t);
                      if (errors.pwd) setErrors(prev => ({ ...prev, pwd: undefined }));
                    }}
                    returnKeyType="next"
                  />
                  <Pressable onPress={() => setShowPwd(s => !s)} hitSlop={10} style={styles.eyeBtn}>
                    <Ionicons name={showPwd ? 'eye-off' : 'eye'} size={20} color={col.subtitle} />
                  </Pressable>
                </View>
                {!!errors.pwd && <Text style={styles.errorText}>{errors.pwd}</Text>}

                {/* Password strength meter */}
                {!!pwd && (
                  <View style={styles.strengthWrap}>
                    <View style={styles.strengthBars}>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.strengthBar,
                            i < strength.level
                              ? { backgroundColor: strength.color }
                              : { backgroundColor: col.inputBorder },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.strengthLabel, { color: strength.color }]}>
                      Password strength: {strength.label}
                    </Text>
                    {strength.level <= 2 && (
                      <Text style={styles.strengthHint}>
                        Use at least 8 characters, mix upper/lowercase letters, numbers, and symbols.
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.field}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    placeholder="Repeat password"
                    style={[styles.inputFlex, errors.pwd2 && styles.inputError]}
                    placeholderTextColor={col.subtitle}
                    secureTextEntry={!showPwd2}
                    autoComplete="new-password"
                    value={pwd2}
                    onChangeText={(t) => {
                      setPwd2(t);
                      if (errors.pwd2) setErrors(prev => ({ ...prev, pwd2: undefined }));
                    }}
                    returnKeyType="done"
                    onSubmitEditing={onSubmit}
                  />
                  <Pressable onPress={() => setShowPwd2(s => !s)} hitSlop={10} style={styles.eyeBtn}>
                    <Ionicons name={showPwd2 ? 'eye-off' : 'eye'} size={20} color={col.subtitle} />
                  </Pressable>
                </View>
                {!!errors.pwd2 && <Text style={styles.errorText}>{errors.pwd2}</Text>}
              </View>

              {/* Terms */}
              <Pressable
                style={styles.termsRow}
                onPress={() => setAccept(a => !a)}
              >
                <Ionicons
                  name={accept ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={accept ? ACCENT : col.subtitle}
                />
                <Text style={styles.termsText}>
                  {' '}I accept the{' '}
                  <Text style={styles.termsLink} onPress={showTerms}>
                    Terms and Privacy Policy
                  </Text>
                </Text>
              </Pressable>
              {!!errors.accept && <Text style={styles.errorText}>{errors.accept}</Text>}

              {/* Submit */}
              <TouchableOpacity
                style={[styles.loginButton, disabled && { opacity: 0.5 }]}
                onPress={onSubmit}
                activeOpacity={0.9}
                disabled={disabled}
                accessibilityState={{ disabled, busy: loading }}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={[styles.loginButtonText, { marginLeft: 8 }]}>Creating…</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Create Account</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              {/* Google */}
              <TouchableOpacity style={styles.googleButton} activeOpacity={0.9} disabled={loading}>
                <Ionicons name="logo-google" size={20} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Link to Login */}
              <Link href={'/login' as Href} asChild>
                <TouchableOpacity disabled={loading}>
                  <Text style={styles.signUp}>
                    Already have an account? <Text style={styles.signUpLink}>Log in</Text>
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
      borderWidth: 1,
      borderColor: c.inputBorder,
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
      marginBottom: 22,
      textAlign: 'center',
      letterSpacing: 0.2,
    },
    field: { marginBottom: 14 },
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
    inputError: { borderColor: '#ef4444' },
    errorText: { marginTop: 6, color: '#ef4444', fontSize: 12 },
    inputRow: { flexDirection: 'row', alignItems: 'center' },
    inputFlex: {
      flex: 1,
      backgroundColor: c.inputBg,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      fontSize: 16,
      color: c.text,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    eyeBtn: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 10 },
    termsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
      marginBottom: 6,
      flexWrap: 'wrap',
    },
    termsText: {
      marginLeft: 8,
      color: c.text,
      flexShrink: 1,
    },
    termsLink: {
      color: ACCENT,
      textDecorationLine: 'underline',
      fontWeight: '600',
    },
    loginButton: {
      width: '100%',
      backgroundColor: ACCENT,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginTop: 8,
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
    loginButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
    divider: { flex: 1, height: 1, backgroundColor: c.inputBorder },
    dividerText: { marginHorizontal: 10, color: c.subtitle, fontSize: 13 },
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: c.inputBorder,
      width: '100%',
      justifyContent: 'center',
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3 },
        android: { elevation: 2 },
      }),
    },
    googleButtonText: { marginLeft: 10, fontSize: 16, fontWeight: '600', color: c.text },
    signUp: { fontSize: 14, color: c.subtitle, marginTop: 16, textAlign: 'center' },
    signUpLink: { fontWeight: '700', color: '#023e8a', textDecorationLine: 'underline' },
    strengthWrap: { marginTop: 8 },
    strengthBars: { flexDirection: 'row', gap: 6, marginBottom: 6 },
    strengthBar: { flex: 1, height: 6, borderRadius: 4 },
    strengthLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
    strengthHint: { fontSize: 12, color: c.subtitle },
  });
