import React, { useMemo, useState, useEffect } from 'react';
import { Stack, useRouter, Link, Href } from 'expo-router';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// 👇 תוספת: ייבוא AsyncStorage לשמירת ה-Session
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { API_URL } from '../src/config/api';
import { useAppColors, AppColors } from '@/components/appThemeProvider';

const { width } = Dimensions.get('window');
const ACCENT = '#0096c7';
const CARD_MAX = 520;

export default function LoginScreen() {
  const router = useRouter();
  const col = useAppColors();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const styles = useMemo(() => makeStyles(col), [col]);

  // חסימת כפתור חזרה פיזי באנדרואיד
  useEffect(() => {
    const onBackPress = () => {
      return true; 
    };
    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandlerSubscription.remove();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing information', 'Please fill in both fields before logging in.');
      return;
    }
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const cleanUsername = username.trim().toLowerCase();
  
      // 1. אימות שם משתמש וסיסמה (Auth)
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername, password }),
      });
  
      const loginData = await loginRes.json();
  
      if (!loginData.success) {
        Alert.alert('Login failed', loginData.message || 'Please try again.');
        setIsLoading(false);
        return;
      }
  
      // 2. שליפת הנתונים המלאים של המשתמש (UserData)
      const userDataRes = await fetch(`${API_URL}/api/userdata/${cleanUsername}`);
      
      if (userDataRes.status === 200) {
        const json = await userDataRes.json();
        const userData = json.data; // הנתונים הגולמיים מה-DB

        // ✅ שמירה לזיכרון המקומי (פותר את בעיית ה-Guest בסריקה)
        await AsyncStorage.setItem('loggedInUser', cleanUsername);
        console.log('✅ Logged in & saved locally:', cleanUsername);

        // ✅ הכנת כל הנתונים להעברה ל-Home Screen
        // אנחנו מפרקים את המבנה המקונן של MongoDB למבנה שטוח של Params
        const allUserParams = {
            username: cleanUsername,
            
            // Personal Details
            firstName: userData.personalDetails?.firstName || '',
            lastName: userData.personalDetails?.lastName || '',
            birthDate: userData.personalDetails?.birthDate || '',
            ageYears: userData.personalDetails?.age?.toString() || '',
            sex: userData.personalDetails?.sex || '',
            
            // Body Measurements
            weight: userData.bodyMeasurements?.weight?.toString() || '',
            height: userData.bodyMeasurements?.height?.toString() || '',
            waist: userData.bodyMeasurements?.waist?.toString() || '',
            bmi: userData.bodyMeasurements?.bmi?.toString() || '',
            whtr: userData.bodyMeasurements?.whtr?.toString() || '',

            // Medical Data
            // המרה של מערך האובייקטים למחרוזת JSON כדי שיוכל לעבור ב-Params
            illnesses: JSON.stringify(
                userData.medicalData?.illnesses?.map((i: any) => i.name) || []
            ),
            otherIllnesses: userData.medicalData?.otherIllnesses || '',
        };

        // ניווט למסך הבית עם כל הנתונים
        router.replace({
            pathname: '/(tabs)/homePage',
            params: allUserParams
        });

      } else {
        // אם המשתמש קיים ב-Auth אבל אין לו UserData (מצב נדיר, אולי נרשם ונתקע באמצע)
        // שומרים לוגין בכל זאת ומעבירים להשלמת פרטים
        await AsyncStorage.setItem('loggedInUser', cleanUsername);
        
        router.replace({
            pathname: '/personalDetails',
            params: {
              username: cleanUsername,
            },
        });
      }

    } catch (e) {
      console.error('Login error:', e);
      Alert.alert('Login failed', 'Network error or server issue.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || !username.trim() || !password.trim();

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false, 
          title: 'Login',
          gestureEnabled: false, 
          headerLeft: () => null,
        }} 
      />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome To CartGenie</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              placeholder="Enter your username"
              style={styles.input}
              placeholderTextColor={col.subtitle}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
              editable={!isLoading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              secureTextEntry
              style={styles.input}
              placeholderTextColor={col.subtitle}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              isDisabled && { opacity: 0.5 },
            ]}
            onPress={handleLogin}
            activeOpacity={0.9}
            disabled={isDisabled}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[styles.loginButtonText, { marginLeft: 8 }]}>
                  Signing in…
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.loginButtonText}>Login</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            activeOpacity={0.9}
            disabled={isLoading}
          >
            <Ionicons name="logo-google" size={20} />
            <Text style={styles.googleButtonText}>Connect via Google</Text>
          </TouchableOpacity>

          <TouchableOpacity disabled={isLoading}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <Link href={'/signUpScreen' as Href}>
            <Text style={styles.signUp}>
              Don’t have an account? <Text style={styles.signUpLink}>Sign Up</Text>
            </Text>
          </Link>
        </View>
      </View>
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
    loginButton: {
      width: '100%',
      backgroundColor: ACCENT,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginTop: 6,
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
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 14,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: c.inputBorder,
    },
    dividerText: {
      marginHorizontal: 10,
      color: c.subtitle,
      fontSize: 13,
    },
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
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
        },
        android: { elevation: 2 },
      }),
    },
    googleButtonText: {
      marginLeft: 10,
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
    },
    forgotPassword: {
      fontSize: 14,
      color: c.subtitle,
      marginTop: 16,
      textAlign: 'center',
    },
    signUp: {
      fontSize: 14,
      color: c.subtitle,
      marginTop: 8,
      textAlign: 'center',
    },
    signUpLink: {
      fontWeight: '700',
      color: '#023e8a',
      textDecorationLine: 'underline',
    },
  });