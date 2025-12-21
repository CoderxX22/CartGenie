import { Linking, Alert, Platform } from 'react-native';

export const useHelpLogic = () => {
  const handleContact = async () => {
    // Hardcoded support phone number (E.164 format)
    const phoneNumber = process.env.EXPO_PUBLIC_SUPPORT_PHONE;

    // iOS: telprompt gives a nicer call prompt when available
    const primaryUrl = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    const fallbackUrl = `tel:${phoneNumber}`;

    try {
      const canOpenPrimary = await Linking.canOpenURL(primaryUrl);
      if (canOpenPrimary) {
        await Linking.openURL(primaryUrl);
        return;
      }

      const canOpenFallback = await Linking.canOpenURL(fallbackUrl);
      if (canOpenFallback) {
        await Linking.openURL(fallbackUrl);
        return;
      }

      Alert.alert(
        'Calling not available',
        'This device cannot place phone calls (for example: simulator or no dialer).'
      );
    } catch (err) {
      console.error('Call failed:', err);
      Alert.alert('Error', 'Could not open the phone dialer.');
    }
  };

  return { handleContact };
};
