import React, { useState, useEffect } from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './auth/LoginScreen';
import RegisterScreen from './auth/RegisterScreen';
import Dashboard from './Dashboard/dashboard';
import CreatePost from './Dashboard/CreatePost';
import ViewProfile from './Dashboard/ViewProfile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native';

const Stack = createStackNavigator();

const MainNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Dashboard" component={Dashboard} options={({ navigation }) => ({
        headerTitle: () => (
          <Button title="I was here" onPress={() => navigation.navigate('Dashboard')} />
        ),
        headerRight: () => (
          <Button title="Profile" onPress={() => navigation.navigate('Profile')} />
        ),
        headerLeft: () => null,
      })}
    />
    <Stack.Screen name="Create" component={CreatePost} />
    <Stack.Screen
      name="Profile"
      component={ViewProfile}
      options={({ navigation }) => ({  // Changed `navigationRef` to `navigation`
        headerRight: () => (
          <Button
            title="Logout"
            onPress={async () => {
              await AsyncStorage.removeItem('userToken');
              navigation.dispatch(  // Used `navigation` instead of `navigationRef.current`
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })
              );
            }}
          />
        ),
      })}
    />
  </Stack.Navigator>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(userToken ? true : false);
    };

    checkLoginStatus();
  }, []);

  if (isLoggedIn === null) {
    return null; // Consider returning a loading component
  }

  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
}
