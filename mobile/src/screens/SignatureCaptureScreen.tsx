import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { driverService } from '../services/driverService';

const SignatureCaptureScreen = () => {
  const ref = useRef<any>();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params || {};
  const [loading, setLoading] = useState(false);

  const handleSignature = async (signature: string) => {
    setLoading(true);
    try {
      await driverService.uploadPoD(orderId, signature);
      Alert.alert('Success', 'Delivery confirmed!', [
        { 
          text: 'OK', 
          onPress: () => navigation.navigate('DriverDashboard') 
        }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to upload proof of delivery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmpty = () => {
    Alert.alert('Error', 'Please provide a signature');
  };

  const handleClear = () => {
    ref.current.clearSignature();
  };

  const handleConfirm = () => {
    ref.current.readSignature();
  };

  const style = `.m-signature-pad--footer {display: none; margin: 0px;}`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-center text-gray-800">
          Confirm Delivery
        </Text>
        <Text className="text-sm text-center text-gray-500">
          Order #{orderId?.substring(0, 8) || 'Unknown'}
        </Text>
      </View>

      <View className="flex-1 m-4 border border-gray-300 rounded-xl overflow-hidden bg-gray-50 relative">
        {loading && (
          <View className="absolute inset-0 bg-white/80 z-10 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-2 text-blue-600 font-medium">Uploading...</Text>
          </View>
        )}
        <SignatureScreen
          ref={ref}
          onOK={handleSignature}
          onEmpty={handleEmpty}
          webStyle={style}
        />
      </View>

      <View className="p-4 flex-row gap-4">
        <TouchableOpacity 
          onPress={handleClear}
          disabled={loading}
          className="flex-1 bg-gray-100 py-4 rounded-xl items-center"
        >
          <Text className="font-bold text-gray-700">Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleConfirm}
          disabled={loading}
          className={`flex-1 py-4 rounded-xl items-center ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
        >
          <Text className="font-bold text-white">
            {loading ? 'Processing...' : 'Confirm Delivery'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignatureCaptureScreen;
