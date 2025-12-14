// hooks/useSignUpLogic.ts
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { API_URL } from '../src/config/api';
import { getPasswordStrength } from '../utils/password';

export const useSignUpLogic = () => {
  const router = useRouter();
  
  // Form State
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Validation State
  const [errors, setErrors] = useState<{
    email?: string; username?: string; pwd?: string; pwd2?: string; accept?: string;
  }>({});

  // Computed Values
  const strength = useMemo(() => getPasswordStrength(pwd), [pwd]);
  const disabled = loading || !email || !username || !pwd || !pwd2 || !accept;

  // Handlers
  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

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

  const showTerms = () => {
    Alert.alert(
      'CartGenie Terms & Privacy Policy',
      [
        '1. Introduction', 'By creating an account you agree...', 
        // ... (הטקסט הארוך שלך כאן, קיצרתי לצורך הדוגמה)
        '8. Contact', 'If you have questions, shout “Genie!”.'
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
        body: JSON.stringify({ username, email, password: pwd }),
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert('Error', data.message || "Registration failed");
        return;
      }
      router.push("/login");
    } catch (err) {
      Alert.alert('Error', 'Network request failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    form: { email, username, pwd, pwd2, accept },
    setters: { setEmail, setUsername, setPwd, setPwd2, setAccept },
    actions: { onSubmit, showTerms, clearError },
    state: { loading, errors, disabled, strength }
  };
};