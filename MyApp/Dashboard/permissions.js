import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import { Platform } from 'react-native';

const requestCameraPermission = async () => {
  try {
    const cameraPermission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

    const result = await check(cameraPermission);
    if (result === RESULTS.DENIED) {
      const requestResult = await request(cameraPermission);
      return requestResult === RESULTS.GRANTED;
    }
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error('Permission Error:', error);
    return false;
  }
};

const requestLocationPermission = async () => {
  try {
    const locationPermission = Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const result = await check(locationPermission);
    if (result === RESULTS.DENIED) {
      const requestResult = await request(locationPermission);
      return requestResult === RESULTS.GRANTED;
    }
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error('Permission Error:', error);
    return false;
  }
};

module.exports = {
    requestCameraPermission,
    requestLocationPermission
};
