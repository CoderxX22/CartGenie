import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onComplete: (barcode: string) => void;
};

export default function ScanProduct({ onComplete }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // пока ещё не получили объект permission
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.infoText}>Checking camera permission…</Text>
      </View>
    );
  }

  // нет доступа к камере
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={32} color="#f97316" />
        <Text style={styles.infoText}>
          We need your permission to use the camera for barcode scanning.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Ionicons name="camera" size={18} color="#fff" />
          <Text style={styles.buttonText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return; // защита от двойного срабатывания

    setScanned(true);
    const value = String(result.data); // это строка штрихкода

    // вызываем родительский коллбек
    onComplete(value);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          // какие типы штрихкодов нас интересуют
          barcodeTypes: ['ean13', 'ean8', 'upc_e', 'upc_a', 'qr'],
        }}
      />

      {/* Оверлей с рамкой и подсказкой */}
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <View style={styles.bottomPanel}>
          <Text style={styles.hintTitle}>Point the barcode inside the frame</Text>
          <Text style={styles.hintText}>Scanning will happen automatically</Text>

          {scanned && (
            <View style={styles.rescanBlock}>
              <Text style={styles.infoText}>
                Barcode scanned, processing…
              </Text>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setScanned(false)}
              >
                <Ionicons name="scan-outline" size={18} color="#0f172a" />
                <Text style={styles.secondaryButtonText}>Scan again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  frame: {
    width: '70%',
    aspectRatio: 1,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  bottomPanel: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  hintTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  hintText: {
    color: '#e5e7eb',
    fontSize: 13,
    textAlign: 'center',
  },
  rescanBlock: {
    marginTop: 12,
    alignItems: 'center',
    gap: 8,
  },

  center: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  infoText: {
    color: '#e5e7eb',
    fontSize: 14,
    textAlign: 'center',
  },

  button: {
    marginTop: 8,
    backgroundColor: '#0096c7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#0369A1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
});
