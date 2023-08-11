import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Button, TouchableOpacity, Dimensions } from 'react-native';
import { State, PanGestureHandler } from 'react-native-gesture-handler';
import Geolocation from '@react-native-community/geolocation';
import { requestLocationPermission } from './permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentLocation, calculateDistance } from './location';
import Animated from 'react-native-reanimated';

const Dashboard = ({navigation}) => {
  const [posts, setPosts] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);  // State to track location permission
  const [location, setLocation] = useState(null);
  const [token, setToken] = useState(null);
  const [lastPressPost, setLastPressPost] = useState(0);
  const scrollViewRefVertical = useRef(null);
  const scrollViewRefHorizontal = useRef(null);
  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const accumulatedTranslate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translate.x,
          translationY: translate.y,
        },
      },
    ],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      accumulatedTranslate.x.setValue(accumulatedTranslate.x._value + translate.x._value);
      accumulatedTranslate.y.setValue(accumulatedTranslate.y._value + translate.y._value);
      translate.setValue({ x: 0, y: 0 }); // Reset the transient values to zero
    }
  };




  const fetchNearbyPosts = async (latitude, longitude) => {
    try {
      if (!token) {
        const jwt = await AsyncStorage.getItem('userToken');
        setToken(jwt);
        if (!token) {
          navigation.navigate('Login');
        }
      }
      const response = await fetch('http://10.0.2.2:3000/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        authorization: 'Bearer ' + token,
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await response.json();
      data.posts.forEach((post) => {
        post.distance = calculateDistance(location.latitude, location.longitude, post.latitude, post.longitude);
        // if post was created less than 1 hour ago, show xx minutes ago, if less than 1 day ago, show xx hours ago, if less than a year ago, show xx days ago, else in dd/mm/yyyy
        const postDate = new Date(post.created_at);
        const now = new Date();
        const diff = now - postDate;
        if (diff < 3600000) {
          post.date = Math.floor(diff / 60000) + ' minutes ago';
        } else if (diff < 86400000) {
          post.date = Math.floor(diff / 3600000) + ' hours ago';
        } else if (diff < 31536000000) {
          post.date = Math.floor(diff / 86400000) + ' days ago';
        } else {
          post.date = postDate.getDate() + '/' + (postDate.getMonth() + 1) + '/' + postDate.getFullYear();
        }
      });

     // sort by timestamp most recent first
      data.posts.sort((a, b) => b.created_at - a.created_at);
      console.log("raw posts", data.posts)
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
      fetchNearbyPosts(location.latitude, location.longitude);
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

  const handlePressPost = (id) => () => {
    const now = Date.now();
    if (now - lastPressPost < 300) {
      setLastPressPost(0);
      likePost(id);
    } else {
      setLastPressPost(now);
    }
  };

  const likePost = async (id) => {
    try {
      const response = await fetch('http://10.0.2.2:3000/posts/' + id + '/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
        'authorization': 'Bearer ' + token },
        body: JSON.stringify({id}),
      });

      const data = await response.json();
      if (data.success) {
        //animation
        console.log(data.message);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

// Sort posts by distance
const sortedPosts = [...posts].sort((a, b) => a.distance - b.distance);

// Calculate circle sizes
const maxLikes = Math.max(...sortedPosts.map((post) => post.likes));
const circleSizes = sortedPosts.map((post) => {
    const size = 30 + (post.likes / maxLikes) * 50;
    return !isNaN(size) && size > 0 ? size : 100; // Fallback size of 100 if the calculated size is invalid
});

// Calculate circle positions
const generateCirclePosition = (avoidPositions) => {
    let maxTries = 1000;
    let validPosition = false;
    let circlePosition;

    if (avoidPositions.length === 0) {
      return {
          top: 1000,
          left: 1000
      };
  }

    while (maxTries > 0 && !validPosition) {
        circlePosition = {
            top: Math.random() * 2000 - 1000,
            left: Math.random() * 2000 - 1000,
        };
        validPosition = true;

        for (let avoidPos of avoidPositions) {
            if (isColliding(circlePosition, avoidPos, circleSizes[circleSizes.length - 1])) {
                validPosition = false;
                break;
            }
        }
        maxTries--;
    }
    return circlePosition;
};

const circlePositions = sortedPosts.map((_, index, arr) => {
    const position = generateCirclePosition(arr.slice(0, index));
    return {
        top: !isNaN(position.top) ? position.top : 0,  // Fallback to 0 if invalid
        left: !isNaN(position.left) ? position.left : 0 // Fallback to 0 if invalid
    };
});

// Logging to ensure consistency and inspect values
console.log("Circle Sizes:", circleSizes);
console.log("Circle Positions:", circlePositions);
console.log("Number of sortedPosts:", sortedPosts.length);


return (
  <View style={styles.container}>
    <PanGestureHandler
      maxPointers={1}
      minDist={10}
      avgTouches={true}
      waitFor={[scrollViewRefHorizontal]}
      simultaneousHandlers={[scrollViewRefHorizontal]}
      activeOffsetX={[-20, 20]}
      activeOffsetY={[-20, 20]}
      failOffsetX={[-20, 20]}
      failOffsetY={[-20, 20]}
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      style={{ flex: 1 }}
    >
      <View style={styles.panContainer}>
        <View style={styles.postContainer}>
          {sortedPosts.map((post, index) => (
            <TouchableOpacity
              key={post.id}
              style={{
                ...styles.circle,
                backgroundColor: 'red',
                width: circleSizes[index] || 100,
                height: circleSizes[index] || 100,
                top: circlePositions[index]?.top || 0,
                left: circlePositions[index]?.left || 0,
              }}
              onPress={() => handlePressPost(post.id)}
            >
              <Image source={{ uri: post.image_url }} style={styles.postImage} />
              <Text>{post.title}</Text>
              <Text>{post.description}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text>{post.date}</Text>
                <Text>
                  {calculateDistance(
                    location.latitude,
                    location.longitude,
                    post.latitude,
                    post.longitude
                  )}{' '}
                  km
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </PanGestureHandler>

    <View style={styles.overlay}>
      <Button title="Create" onPress={() => navigation.navigate('Create')} />
    </View>
  </View>
);

};

function isColliding(position1, position2, radius) {
const dx = position1.left - position2.left;
const dy = position1.top - position2.top;
const distance = Math.sqrt(dx * dx + dy * dy);
return distance < radius * 2;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  verticalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue',
    borderRadius: 999,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Dashboard;
