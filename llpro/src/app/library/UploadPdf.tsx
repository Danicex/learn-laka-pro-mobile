import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import React, { useState } from 'react'
import * as DocumentPicker from 'expo-document-picker'
import api from "../utils/api"

interface UploadPdfProps {
  onUploadComplete?: (bookId: number) => void;
}

export default function UploadPdf({ onUploadComplete }: UploadPdfProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickAndUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      await uploadFile(file);
    } catch (err) {
      console.error('File pick error', err);
      Alert.alert('Error', 'Could not select file');
    }
  };

  const uploadFile = async (file: DocumentPicker.DocumentPickerAsset) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name ?? 'upload.pdf',
      type: 'application/pdf',
    } as any);

    try {
      const res = await api.post('/upload_pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });

      Alert.alert('Success', 'Book uploaded successfully');
      onUploadComplete?.(res.data.book_id);
    } catch (err) {
      console.error('Upload error', err);
      Alert.alert('Error', 'Failed to upload PDF');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickAndUpload} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>+ Upload PDF</Text>
        )}
      </TouchableOpacity>
      {uploading && <Text style={styles.progressText}>{progress}%</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 12 },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  progressText: { marginTop: 6, fontSize: 12, color: '#555' },
});