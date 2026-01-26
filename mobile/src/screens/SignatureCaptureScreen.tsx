import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Trash2 } from 'lucide-react-native';
import { driverService } from '../services/driverService';

const SignatureCaptureScreen = () => {
  const ref = useRef<any>();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Camera access is needed to take a photo of the package.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSignature = async (signature: string) => {
    if (!photo) {
      Alert.alert('Missing Photo', 'Please take a photo of the delivered package before confirming.');
      return;
    }

    setLoading(true);
    try {
      await driverService.uploadPoD(orderId, signature, photo);
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

      {/* Content Container */}
      <View className="flex-1 p-4 space-y-4">
        
        {/* Photo Section */}
        <View className="h-48 w-full bg-gray-50 rounded-xl border border-gray-200 border-dashed overflow-hidden justify-center items-center relative">
          {photo ? (
            <>
              <Image source={{ uri: photo }} className="w-full h-full" resizeMode="cover" />
              <TouchableOpacity 
                onPress={() => setPhoto(null)}
                className="absolute top-2 right-2 bg-red-500 p-2 rounded-full shadow-sm"
              >
                <Trash2 size={20} color="white" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={takePhoto} className="items-center justify-center p-4">
              <View className="bg-blue-100 p-4 rounded-full mb-2">
                <Camera size={32} color="#2563eb" />
              </View>
              <Text className="text-gray-500 font-medium">Take Package Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Signature Section */}
        <View className="flex-1 border border-gray-300 rounded-xl overflow-hidden bg-gray-50 relative">
          {loading && (
            <View className="absolute inset-0 bg-white/80 z-10 items-center justify-center">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="mt-2 text-blue-600 font-medium">Uploading...</Text>
            </View>
          )}
          <Text className="absolute top-2 left-4 text-xs text-gray-400 z-10">Sign Here</Text>
          <SignatureScreen
            ref={ref}
            onOK={handleSignature}
            onEmpty={handleEmpty}
            webStyle={style}
          />
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 pt-2">
          <TouchableOpacity 
            onPress={handleClear}
            disabled={loading}
            className="flex-1 bg-gray-100 py-4 rounded-xl items-center"
          >
            <Text className="font-bold text-gray-700">Clear Signature</Text>
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
      </View>
    </SafeAreaView>
  );
};

export default SignatureCaptureScreen;
