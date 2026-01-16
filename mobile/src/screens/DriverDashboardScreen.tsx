import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { driverService } from '../services/driverService';
import { authService } from '../services/auth';
import { trackingService } from '../services/trackingService';

const DriverDashboardScreen = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const fetchData = async () => {
    try {
      const userProfile = await driverService.getProfile();
      setProfile(userProfile);
      setIsOnline(userProfile.status === 'ONLINE');

      if (userProfile.status === 'ONLINE') {
        const assignedOrders = await driverService.getAssignedOrders();
        setOrders(assignedOrders);
        // Start tracking if online
        trackingService.connect(userProfile.userId);
      } else {
        setOrders([]);
        trackingService.stop();
      }
    } catch (error) {
      console.log('Error fetching data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => {
          // Optional: stop tracking when screen loses focus? 
          // usually we want it to run in background, but for this demo maybe not.
          // keeping it running if online is better.
      };
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const toggleStatus = async () => {
    const newStatus = isOnline ? 'OFFLINE' : 'ONLINE';
    try {
      const updatedProfile = await driverService.updateStatus(newStatus);
      setIsOnline(newStatus === 'ONLINE');
      setProfile(updatedProfile);
      
      if (newStatus === 'ONLINE') {
        trackingService.connect(updatedProfile.userId);
        const assignedOrders = await driverService.getAssignedOrders();
        setOrders(assignedOrders);
      } else {
        trackingService.stop();
        setOrders([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleLogout = async () => {
    trackingService.stop();
    await authService.logout();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="bg-white p-6 rounded-b-3xl shadow-sm">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-500 text-sm font-medium">Welcome back,</Text>
            <Text className="text-2xl font-bold text-gray-800">{profile?.userId || 'Driver'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
             <Text className="text-red-500 font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-gray-50 rounded-xl p-4 flex-row justify-between items-center border border-gray-200">
          <View>
            <Text className="text-lg font-semibold text-gray-800">
              {isOnline ? 'You are Online' : 'You are Offline'}
            </Text>
            <Text className="text-gray-500 text-sm">
              {isOnline ? 'Waiting for orders...' : 'Go online to receive orders'}
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#767577', true: '#2563EB' }}
            thumbColor={isOnline ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleStatus}
            value={isOnline}
          />
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-4 mt-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text className="text-xl font-bold text-gray-800 mb-4">Current Orders</Text>
        
        {orders.map((order) => (
          <View key={order.id} className="bg-white p-5 rounded-xl mb-4 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="font-bold text-lg text-gray-800">#{order.id.substring(0, 8)}</Text>
              <View className={`px-2 py-1 rounded-md ${
                order.status === 'PICKED_UP' ? 'bg-blue-100' : 'bg-yellow-100'
              }`}>
                <Text className={`text-xs font-bold ${
                   order.status === 'PICKED_UP' ? 'text-blue-800' : 'text-yellow-800'
                }`}>{order.status}</Text>
              </View>
            </View>
            
            <Text className="text-gray-500 mb-1">Pickup: {order.pickupAddress}</Text>
            <Text className="text-gray-800 font-medium mb-4">Delivery: {order.deliveryAddress}</Text>
            
            <View className="flex-row gap-3">
               {order.status === 'ASSIGNED' && (
                   <TouchableOpacity 
                     className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
                     onPress={async () => {
                        await driverService.updateOrderStatus(order.id, 'PICKED_UP');
                        fetchData();
                     }}
                   >
                     <Text className="font-semibold text-white">Confirm Pickup</Text>
                   </TouchableOpacity>
               )}
               
               {order.status === 'PICKED_UP' && (
                   <TouchableOpacity 
                     className="flex-1 bg-green-600 py-3 rounded-lg items-center"
                     onPress={() => navigation.navigate('Signature', { orderId: order.id })}
                   >
                     <Text className="font-semibold text-white">Complete Delivery</Text>
                   </TouchableOpacity>
               )}
            </View>
          </View>
        ))}

        {orders.length === 0 && (
            <View className="items-center justify-center mt-10">
                <Text className="text-gray-400">No active orders</Text>
            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverDashboardScreen;
