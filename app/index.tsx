import { Stack, useRouter } from 'expo-router';
import { View, Text, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { Upload, Map, ArrowRight, RotateCcw } from 'lucide-react-native';
import { useStore } from '@/store/store';
import { parseGPX } from '@/utils/gpxParser';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { setOriginalRoute, gpxFileName, reset } = useStore();

  const handleSelectGPX = async () => {
    try {
      setLoading(true);

      // Open document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setLoading(false);
        return;
      }

      const file = result.assets[0];

      // Read file content
      const content = await readAsStringAsync(file.uri);

      // Parse GPX
      const route = parseGPX(content);

      if (!route.points || route.points.length === 0) {
        Alert.alert('Error', 'No valid route found in GPX file');
        setLoading(false);
        return;
      }

      // Save to store
      setOriginalRoute(route, file.name);

      setLoading(false);

      // Navigate to POI selection
      router.push('/poi-selection');
    } catch (error) {
      console.error('Error loading GPX:', error);
      Alert.alert('Error', 'Failed to load GPX file. Please try again.');
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    Alert.alert('Success', 'App data has been reset');
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-blue-500 px-4 pb-4 pt-12">
        <View className="flex-row items-center">
          <Map size={28} color="#ffffff" strokeWidth={2} />
          <Text className="ml-3 text-2xl font-bold text-white">Refuel</Text>
        </View>
        <Text className="mt-1 text-blue-100">Plan your route with essential stops</Text>
      </View>

      {/* Content */}
      <View className="flex-1 px-4">
        {/* Upload Section */}
        <TouchableOpacity
          className="mt-4 items-center rounded-xl border-2 border-dashed border-blue-200 p-6"
          activeOpacity={0.7}
          onPress={handleSelectGPX}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : (
            <>
              <Upload size={40} color="#60a5fa" strokeWidth={2} />
              <Text className="mt-2 font-medium text-blue-600">Upload GPX File</Text>
              <Text className="mt-1 text-sm text-gray-400">Tap to select your route file</Text>
            </>
          )}
        </TouchableOpacity>

        {gpxFileName && (
          <View className="mt-4 rounded-xl bg-green-50 p-4">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-green-500">
                <Text className="text-lg text-white">✓</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-green-600">Route loaded</Text>
                <Text className="font-semibold text-green-700">{gpxFileName}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="mt-4 gap-3">
              <TouchableOpacity
                className="flex-row items-center justify-center rounded-xl bg-blue-500 py-4"
                activeOpacity={0.7}
                onPress={() => router.push('/poi-selection')}>
                <Text className="font-semibold text-white">Continue</Text>
                <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-center rounded-xl bg-gray-100 py-3"
                activeOpacity={0.7}
                onPress={handleReset}>
                <RotateCcw size={18} color="#6b7280" style={{ marginRight: 8 }} />
                <Text className="font-medium text-gray-600">Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!gpxFileName && (
          <View className="mt-6 rounded-xl bg-blue-50 p-4">
            <Text className="text-center text-sm leading-6 text-blue-700">
              Upload a GPX file to find water supplies, stores, and restaurants along your route.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
