import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useAppColors } from '@/components/appThemeProvider';
import { CameraPermissionView } from './camera/cameraPermissionView';
import { CameraOverlay } from './camera/CameraOverlay';

type Props = {
  onComplete: (barcode: string) => void;
};

export default function ScanProduct({ onComplete }: Props) {
  const col = useAppColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  
  // מונע סריקות כפולות בזמן המעבר מסך
  const scanLockRef = useRef(false);

  // 1. בדיקת הרשאות
  if (!permission) {
    return <CameraPermissionView status="loading" colors={col} />;
  }
  if (!permission.granted) {
    return (
      <CameraPermissionView 
        status="denied" 
        onRequestPermission={requestPermission} 
        colors={col} 
      />
    );
  }

  // 2. לוגיקת סריקה
  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanLockRef.current) return;
    
    scanLockRef.current = true;
    setScanned(true);
    onComplete(result.data);
  };

  // 3. תצוגה
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_e', 'upc_a', 'qr'],
        }}
      />
      
      {!scanned && (
        <CameraOverlay 
          title="Point at a barcode" 
          subtitle="Scanning happens automatically" 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
});