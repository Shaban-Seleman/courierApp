import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SignatureCaptureScreen = () => {
  const ref = useRef<any>();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { orderId } = route.params || {};

  const handleSignature = (signature: string) => {
    // Here you would upload the base64 signature to your PoD Service
    console.log('Signature captured for Order:', orderId);
    console.log('Signature data length:', signature.length);
    
    Alert.alert('Success', 'Delivery confirmed!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
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
          Order #{orderId || 'Unknown'}
        </Text>
      </View>

      <View className="flex-1 m-4 border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
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
          className="flex-1 bg-gray-100 py-4 rounded-xl items-center"
        >
          <Text className="font-bold text-gray-700">Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleConfirm}
          className="flex-1 bg-blue-600 py-4 rounded-xl items-center"
        >
          <Text className="font-bold text-white">Confirm Delivery</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignatureCaptureScreen;
