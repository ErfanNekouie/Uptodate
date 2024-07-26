import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Users from './Users';
import Categories from './Categories';
import Articles from './Articles';
import About from './About';
import { FontAwesome } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function AdminPanel({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Users') {
            iconName = 'users';
          } else if (route.name === 'Categories') {
            iconName = 'list';
          } else if (route.name === 'Articles') {
            iconName = 'file-text';
          } else if (route.name === 'About') {
            iconName = 'info-circle';
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Users" component={Users} />
      <Tab.Screen name="Categories" component={Categories} />
      <Tab.Screen name="Articles" component={Articles} />
      <Tab.Screen name="About" component={About} />
    </Tab.Navigator>
  );
}
