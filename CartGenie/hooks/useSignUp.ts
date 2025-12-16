// hooks/useSignUpLogic.ts
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { API_URL } from '../src/config/api';
import { getPasswordStrength } from '../utils/password';

export const useSignUpLogic = () => {
  const router = useRouter(); // Navigation handler (expo-router)

  // Form State
  const [email, setEmail] = useState('');        // User email input
  const [username, setUsername] = useState('');  // User username input
  const [pwd, setPwd] = useState('');            // Password input
  const [pwd2, setPwd2] = useState('');          // Confirm password input
  const [accept, setAccept] = useState(false);   // Terms acceptance checkbox state
  const [loading, setLoading] = useState(false); // Request in-flight state

  // Validation State
  const [errors, setErrors] = useState<{
    email?: string; username?: string; pwd?: string; pwd2?: string; accept?: string;
  }>({});

  // Computed Values
  const strength = useMemo(() => getPasswordStrength(pwd), [pwd]); // Derived password strength
  const disabled = loading || !email || !username || !pwd || !pwd2 || !accept; // Disable submit until ready

  // Clears a specific field error once the user starts editing again
  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Validates inputs and sets per-field errors
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

  // Shows a humorous (but still understandable) Terms & Privacy Policy dialog
  const showTerms = () => {
    const TERMS_TEXT = [
      'Welcome to CartGenie — Terms & Privacy Policy!',
      '',
      '1) The Genie Agreement',
      'By creating an account, you agree to these terms. If you do not agree, the Genie will not be summoned.',
      '',
      '2) You Are The Captain Of Your Account',
      'Keep your password secret. If you share it with your cat, your roommate, or the neighborhood raccoon, that is on you.',
      '',
      '3) Health Disclaimer (Important!)',
      'CartGenie provides informational guidance, not medical advice. If the app says “eat broccoli,” and your doctor says “eat broccoli,” you should still listen to your doctor.',
      '',
      '4) What We Collect (The Boring-but-True Part)',
      'We may process account data and content you submit (e.g., receipts and blood test files) to provide features.',
      'We do not want your secrets. We want your groceries to make sense.',
      '',
      '5) Security (Also Important!)',
      'We use reasonable safeguards, but no system is invincible. Even Genies respect physics.',
      '',
      '6) Don’t Be That User',
      'No hacking, no abuse, no unlawful uploads, and no attempts to confuse the Genie with cursed PDFs.',
      '',
      '7) Your Rights',
      'You can request access/correction/deletion of your data, subject to legal and operational constraints.',
      'In plain English: we try to help, but sometimes the law says “nope.”',
      '',
      '8) Changes To These Terms',
      'We may update terms from time to time. If we do, we’ll do our best to keep it reasonable and not summon chaos.',
      '',
      '9) Contact',
      'Questions? Use your official “Support Voice” and contact us via the app or your project support channel.',
      '(Please do not shout “GENIE!” at 3 a.m. It scares the servers.)'
    ].join('\n');

    Alert.alert(
      'CartGenie Terms & Privacy Policy',
      TERMS_TEXT,
      [{ text: 'Close', style: 'cancel' }],
      { cancelable: true }
    );
  };

  // Submits registration request after successful validation
  const onSubmit = async () => {
    if (loading) return;       // Prevent double-submit while request is running
    if (!validate()) return;   // Stop if validation failed

    try {
      setLoading(true); // Enter loading state

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password: pwd }) // Server expects: username/email/password
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert('Error', data.message || 'Registration failed'); // Server-side error
        return;
      }

      router.push('/login'); // Navigate to login after successful signup
    } catch (err) {
      Alert.alert('Error', 'Network request failed'); // Network/connection error
    } finally {
      setLoading(false); // Exit loading state
    }
  };

  // Public API for the SignUp screen
  return {
    form: { email, username, pwd, pwd2, accept }, // Values consumed by the UI
    setters: { setEmail, setUsername, setPwd, setPwd2, setAccept }, // Setters used by input handlers
    actions: { onSubmit, showTerms, clearError }, // Screen actions (submit, show terms, clear field error)
    state: { loading, errors, disabled, strength } // Derived UI state (loading, validation, button disabled, strength meter)
  };
};
