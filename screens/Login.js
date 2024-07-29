import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, Modal , CheckBox  } from 'react-native';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

axios.defaults.withCredentials = true;

export default function Login({ navigation, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [aboutVisible, setAboutVisible] = useState(false);
  const [aboutContent, setAboutContent] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://157.90.234.109:5000/login', {
        username,
        password,
        remember_me: rememberMe,
      });
      if (response.data.token && response.data.role) {
        onLogin(response.data.token, response.data.role, rememberMe);
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Login failed');
    }
  };

  const fetchAbout = async () => {
    try {
      const response = await axios.get('http://157.90.234.109:5000/about');
      setAboutContent(response.data.content);
      setAboutVisible(true);
    } catch (error) {
      console.error('Error fetching about content:', error);
      alert('Failed to fetch about content');
    }
  };

  return (
    <View style={styles.container}>
      <FontAwesome name="user-circle" size={64} color="#333" style={styles.icon} />
      <Text style={styles.title}>Login</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.rememberMeContainer}>
        <CheckBox
          value={rememberMe}
          onValueChange={setRememberMe}
        />
        <Text style={styles.rememberMeText}>Remember Me</Text>
      </View>
      <Pressable style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </Pressable>
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
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rememberMeText: {
    marginLeft: 8,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
  },
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
