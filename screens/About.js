import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';

export default function About() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const response = await axios.get('http://127.0.0.1:5000/about');
    setContent(response.data.content);
  };

  const saveContent = async () => {
    await axios.post('http://127.0.0.1:5000/about', { content });
    alert('Content saved successfully');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>About Us</Text>
      <TextInput
        style={styles.textArea}
        value={content}
        onChangeText={setContent}
        multiline
      />
      <Button title="Save" onPress={saveContent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  textArea: {
    height: 200,
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
  },
});
