import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Button, Image, Text } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { requestCameraPermission } from './permissions';
import { getCurrentLocation } from './upload';
import AsyncStorage from '@react-native-async-storage/async-storage';


const CreatePost = ({ navigation }) => {
  const cameraRef = useRef(null);
  const [imageUri, setImageUri] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);  // State to track camera permission

  useEffect(() => {
    const checkPermissions = async () => {
      const permission = await requestCameraPermission();
      setHasPermission(permission);
    };

    checkPermissions();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
        const options = { quality: 0.5 };
        const data = await cameraRef.current.takePictureAsync(options);
        setImageUri(data.uri);
    }
};

const handleSubmit = async () => {
  try {
    console.log("Submitting image...")
      // Create a new FormData object
      let formData = new FormData();
      formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg', // Assuming the image is jpeg. Adjust if otherwise
          name: new Date().toISOString() + '.jpg'
      });

      const location = await getCurrentLocation();
      const jwt = await AsyncStorage.getItem('userToken');

      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());

      console.log("Sending image...", formData)

      const postImage = await fetch('http://10.0.2.2:3000/create-post', {
          method: 'POST',
          headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': 'Bearer ' + jwt,
          },
          body: formData,
      });

      console.log("Image submitted!");

      const data = await postImage.json();
      console.log(data);
      setImageUri(null);

      navigation.goBack();
    } catch (error) {
        console.error("Error uploading file:", error);
    }
};


  // If permissions aren't determined yet, show nothing (or a loading indicator)
  if (hasPermission === null) {
    return <View style={styles.container} />;
  }
  // If no camera permission, show a permission denied message
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>No camera permissions. Please grant access from settings.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={styles.container}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          <Button title="Submit" onPress={handleSubmit} />
          <Button title="Cancel" onPress={() => setImageUri(null)} />
        </View>
      ) : (
        <View style={styles.container}>
          <RNCamera
            ref={cameraRef}
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            captureAudio={false}
          />
          <Button title="Snap" onPress={takePicture} />
          <Button title="Back to Dashboard" onPress={() => navigation.navigate("Dashboard")} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default CreatePost;
