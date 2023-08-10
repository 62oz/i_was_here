import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './auth/LoginScreen';
import RegisterScreen from './auth/RegisterScreen';
import Dashboard from './Dashboard/dashboard';
import CreatePost from './Dashboard/CreatePost';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Dashboard">
      <Stack.Screen name="Dashboard" component={Dashboard} options={({ navigation }) => ({
          headerTitle: () => (
            <Button
              title="I was here..."
              onPress={() => {
                navigation.navigate('Dashboard');
                console.log('Refresh clicked!');
              }}
            />
          ),
          headerRight: () => (
            <Button
              title="Profile"
              onPress={() => navigation.navigate('ViewProfile')}
            />
          ),
        })}
  />
      <Stack.Screen name="CreatePost" component={CreatePost} />
    </Stack.Navigator>
  );
};

export default function App() {
  const isLoggedIn = AsyncStorage.getItem('userToken') ? true : false;

  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="none">
        {isLoggedIn ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
