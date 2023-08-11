import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { isValidEmail, isValidPassword } from '../utils/validations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Invalid email address');
      return;
    } else if (!isValidPassword(password)) {
      Alert.alert('Error', 'Invalid password');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      const token = data.token;
      await AsyncStorage.setItem('userToken', token);

      if (data.error) {
        Alert.alert('Error', data.error);
      } else {
        Alert.alert('Success', 'Login successful');
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text>Don&apos;t have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Add your styles here, they can be similar to those in RegisterScreen
  // For example:
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '90%',
    padding: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  }
});

LoginScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};

export default LoginScreen;
