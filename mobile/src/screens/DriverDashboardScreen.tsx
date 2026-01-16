import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const DriverDashboardScreen = () => {
  const [isOnline, setIsOnline] = useState(false);
  const navigation = useNavigation<any>();

  const orders = [
    { id: 'ORD-1002', customer: 'Bob Smith', address: '123 Main St, New York, NY', status: 'ASSIGNED' },
    { id: 'ORD-1003', customer: 'Charlie Davis', address: '456 Wall St, New York, NY', status: 'PICKED_UP' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="bg-white p-6 rounded-b-3xl shadow-sm">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-500 text-sm font-medium">Welcome back,</Text>
            <Text className="text-2xl font-bold text-gray-800">John Doe</Text>
          </View>
          <View className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
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
            onValueChange={() => setIsOnline(prev => !prev)}
            value={isOnline}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 mt-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">Current Orders</Text>
        
        {orders.map((order) => (
          <View key={order.id} className="bg-white p-5 rounded-xl mb-4 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="font-bold text-lg text-gray-800">#{order.id}</Text>
              <View className={`px-2 py-1 rounded-md ${
                order.status === 'PICKED_UP' ? 'bg-blue-100' : 'bg-yellow-100'
              }`}>
                <Text className={`text-xs font-bold ${
                   order.status === 'PICKED_UP' ? 'text-blue-800' : 'text-yellow-800'
                }`}>{order.status}</Text>
              </View>
            </View>
            
            <Text className="text-gray-500 mb-1">Customer: {order.customer}</Text>
            <Text className="text-gray-800 font-medium mb-4">{order.address}</Text>
            
            <View className="flex-row gap-3">
               <TouchableOpacity 
                 className="flex-1 bg-gray-100 py-3 rounded-lg items-center"
                 onPress={() => console.log('Navigate')}
               >
                 <Text className="font-semibold text-gray-700">Navigate</Text>
               </TouchableOpacity>
               
               <TouchableOpacity 
                 className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
                 onPress={() => navigation.navigate('Signature', { orderId: order.id })}
               >
                 <Text className="font-semibold text-white">Complete</Text>
               </TouchableOpacity>
            </View>
          </View>
        ))}

        {!isOnline && orders.length === 0 && (
            <View className="items-center justify-center mt-10">
                <Text className="text-gray-400">No active orders</Text>
            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverDashboardScreen;
