import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../services/authService';

export const useForgotPasswordLogic = () => {
  const router = useRouter();

  // State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- Actions ---

  const handleVerify = async () => {
    // מחיקת רווחים מיותרים לפני הבדיקה
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername || !cleanEmail) {
      Alert.alert('Error', 'Please fill in both fields.');
      return;
    }

    setLoading(true);
    try {
      // שליחת הנתונים הנקיים
      await authService.verifyIdentity(cleanUsername, cleanEmail);
      setStep(2);
    } catch (error: any) {
      console.log("Verify Error Log:", error.response?.data); // לוג כדי לראות מה השרת החזיר
      const msg = error.response?.data?.message || 'Verification failed.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    // וולידציות בצד לקוח
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(username, newPassword);
      setStep(3); // מעבר למסך הצלחה
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update password.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = () => {
    router.replace('/login');
  };

  return {
    // Data
    state: {
      step,
      loading,
      username,
      email,
      newPassword,
      confirmPassword,
    },
    // Setters (רק מה שצריך לחשוף ל-UI לעריכה)
    setters: {
      setUsername,
      setEmail,
      setNewPassword,
      setConfirmPassword
    },
    // Functions
    actions: {
      handleVerify,
      handleResetPassword,
      goBackToLogin
    }
  };
};