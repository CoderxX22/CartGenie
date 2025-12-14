import { Linking, Alert } from 'react-native';

export const useHelpLogic = () => {
  const handleContact = async () => {
    const email = 'support@healthcart.com';
    const subject = 'Support Request - CartGenie';
    const url = `mailto:${email}?subject=${subject}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Could not open email client.');
      }
    } catch (err) {
      console.error('An error occurred', err);
    }
  };

  return {
    handleContact,
  };
};