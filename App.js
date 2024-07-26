import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AdminPanel from './screens/AdminPanel';
import UserPanel from './screens/UserPanel';
import Login from './screens/Login';
import { View, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ایمپورت صحیح AsyncStorage

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await axios.get('http://127.0.0.1:5000/check_session');
          if (response.data.role) {
            setIsLoggedIn(true);
            setUserRole(response.data.role);
          }
        } catch (error) {
          console.error('Session check failed', error);
        }
      }
      setLoading(false);
    };
    checkLogin();
  }, []);

  const handleLogin = async (token, role, rememberMe) => {
    setUserRole(role);
    setIsLoggedIn(true);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (rememberMe) {
      await AsyncStorage.setItem('authToken', token);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isLoggedIn ? (
          <Stack.Screen name="Login">
            {(props) => <Login {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : userRole === 'admin' ? (
          <Stack.Screen name="AdminPanel" component={AdminPanel} />
        ) : (
          <Stack.Screen name="UserPanel" component={UserPanel} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
