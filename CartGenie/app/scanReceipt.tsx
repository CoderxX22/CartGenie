import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  Platform
} from 'react-native';
import { Stack, useRouter, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../src/config/api';

const ACCENT = '#0096c7';

export default function ScanReceiptScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. בחירת תמונה או צילום
  const pickImage = async (useCamera: boolean) => {
    try {
      let result;
      
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission needed', 'Camera permission is required to scan receipts.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // 2. שליחת התמונה לשרת
  const uploadAndScan = async () => {
    if (!image) return;
    if (loading) return;

    setLoading(true);

    try {
      // הכנת ה-FormData
      const formData = new FormData();
      
      const filename = image.split('/').pop() || 'receipt.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      // @ts-ignore: React Native FormData
      formData.append('receiptImage', {
        uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
        name: filename,
        type,
      } as any);

      console.log('Sending to OCR...', `${API_URL}/api/ocr/scan`);

      const response = await fetch(`${API_URL}/api/ocr/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'OCR Failed');
      }

      // מעבר למסך התוצאות עם הנתונים
      // השימוש ב-as Href פותר את בעיית הטיפוסים של expo-router
      router.push({
        pathname: '/ReceiptResultsScreen' as Href,
        params: {
          rawText: data.data.rawText,
          extractedItems: JSON.stringify(data.data.extractedItems)
        }
      });

    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Error', 'Failed to scan receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Scan Receipt', headerBackTitle: 'Back' }} />
      
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* אזור התמונה */}
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} resizeMode="contain" />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="receipt-outline" size={60} color="#CBD5E1" />
              <Text style={styles.placeholderText}>No receipt selected</Text>
            </View>
          )}
        </View>

        {/* כפתורי פעולה */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.secondaryBtn]} 
            onPress={() => pickImage(false)}
            disabled={loading}
          >
            <Ionicons name="images-outline" size={22} color={ACCENT} />
            <Text style={styles.secondaryBtnText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, styles.primaryBtn]} 
            onPress={() => pickImage(true)}
            disabled={loading}
          >
            <Ionicons name="camera-outline" size={22} color="#fff" />
            <Text style={styles.primaryBtnText}>Camera</Text>
          </TouchableOpacity>
        </View>

        {/* כפתור סריקה */}
        {image && (
          <TouchableOpacity 
            style={[styles.scanBtn, loading && { opacity: 0.7 }]} 
            onPress={uploadAndScan}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.scanBtnText}>Analyze Receipt</Text>
                <Ionicons name="sparkles" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 50,
  },
  imageContainer: {
    width: '100%',
    height: 350,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    gap: 10,
  },
  placeholderText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: ACCENT,
  },
  secondaryBtn: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: ACCENT,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtnText: {
    color: ACCENT,
    fontWeight: '700',
    fontSize: 16,
  },
  scanBtn: {
    width: '100%',
    backgroundColor: '#0F172A',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});