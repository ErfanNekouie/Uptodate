import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AllArticles from './AllArticles';
import MyArticles from './MyArticles';
import { FontAwesome } from '@expo/vector-icons';
import { View, Modal, Text, Pressable, StyleSheet } from 'react-native';
import axios from 'axios';

const Tab = createBottomTabNavigator();

export default function UserPanel({ navigation }) {
  const [aboutVisible, setAboutVisible] = useState(false);
  const [aboutContent, setAboutContent] = useState('');

  const fetchAbout = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/about');
      setAboutContent(response.data.content);
      setAboutVisible(true);
    } catch (error) {
      console.error('Error fetching about content:', error);
      alert('Failed to fetch about content');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'All Articles') {
              iconName = 'list';
            } else if (route.name === 'My Articles') {
              iconName = 'file';
            }

            return <FontAwesome name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen name="All Articles" component={AllArticles} />
        <Tab.Screen name="My Articles" component={MyArticles} />
      </Tab.Navigator>
      <Pressable onPress={fetchAbout} style={styles.infoButton}>
        <FontAwesome name="info-circle" size={24} color="blue" />
      </Pressable>

      <Modal visible={aboutVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>About Us</Text>
          <Text>{aboutContent}</Text>
          <Pressable onPress={() => setAboutVisible(false)} style={styles.closeButton}>
            <FontAwesome name="times-circle" size={30} color="red" />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  infoButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 20,
  },
});
