import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { requestLocationPermission } from './permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentLocation } from './upload';

const ViewProfile = ({navigation}) => {
  const [posts, setPosts] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);  // State to track location permission
  const [location, setLocation] = useState(null);
  const [token, setToken] = useState(null);

  const fetchMyPosts = async () => {
    if (!token) {
      const jwt = await AsyncStorage.getItem('userToken');
        setToken(jwt);
        if (!token) {
          navigation.navigate('Login');
        }
    }
    try {
      const response = await fetch('http://10.0.2.2:3000/my-posts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
        'authorization': 'Bearer ' + token, },
      });
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };


  // Check for JWT token
useEffect(() => {
  const checkToken = async () => {
    const jwt = await AsyncStorage.getItem('userToken');
    setToken(jwt);
  };

  checkToken();
}, []);

// Check for location permissions and set location if permission is granted
useEffect(() => {
  const checkPermissions = async () => {
    const locationPermission = await requestLocationPermission();

    setHasPermission(locationPermission);

    if (locationPermission) {
      const loc = await getCurrentLocation();
      setLocation(loc);
    }
  };

  checkPermissions();
}, [hasPermission]);

useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    console.log("Fetching posts...");
    if (location) {
      fetchNearbyPosts(location.latitude, location.longitude);
    } else {
      const checkLocation = async () => {
        const loc = await getCurrentLocation();
        setLocation(loc);
      };

      checkLocation();
    }
  });

  return unsubscribe;
}, [navigation]);


// Fetch nearby posts whenever location changes
useEffect(() => {
  if (location) {
      fetchMyPosts(location.latitude, location.longitude);
  }
}, [location]);


  if (!hasPermission) {
    return <View style={styles.container}><Text>No location access</Text></View>;
  } else if (!location) {
    const checkLocation = async () => {
      const loc = await getCurrentLocation();
      setLocation(loc);
    };

    checkLocation();

    return <View style={styles.container}><Text>Loading...</Text></View>;
  } else if (!token) {
    return (
      <View style={styles.container}>
        <Text>You have been logged out. Please log in again.</Text>
        <Button title="Log In" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Calculate distance between two latitude and longitude points using Haversine formula
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2); // Return distance rounded to 2 decimal places
};

  return (
    <View style={styles.container}>
        <Text>Profile</Text>
        {posts.map((post) => (
            <View key={post.id} style={styles.postContainer}>
                <Image source={{ uri: post.image_url }} style={styles.postImage} />
                <Text>{post.title}</Text>
                <Text>{post.description}</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text>{post.location}</Text>
                    <Text>{calculateDistance(location.latitude, location.longitude, post.latitude, post.longitude)} km</Text>
                </View>
            </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    postContainer: {
      width: '80%',
      padding: 10,
      marginVertical: 10,
      borderRadius: 5,
      borderColor: '#ddd',
      borderWidth: 1,
      backgroundColor: '#fff',
    },
    postImage: {
      width: '100%',
      height: 200,
      borderRadius: 5,
    },
  });

export default ViewProfile;
