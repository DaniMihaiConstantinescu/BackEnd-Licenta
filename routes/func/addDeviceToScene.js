const { ref, set, get } = require('firebase/database');
const { dbRef } = require('../../firebase');

const addDeviceToScene = async (userId, sceneId, newDevice) => {
    try {
      const userScenesRef = ref(dbRef, `users/${userId}/scenes`);
      const snapshot = await get(userScenesRef);
      const scenes = snapshot.val();
  
      if (scenes && scenes[sceneId]) {
        const existingDevices = scenes[sceneId].devices || [];
        
        // Check if the device already exists
        const isDeviceExists = existingDevices.some(device => device.macAddress === newDevice.macAddress);
  
        if (isDeviceExists) {
          return { success: false, message: 'Device with the same MAC address already exists in the scene.' };
        }
  
        scenes[sceneId].devices = [...existingDevices, newDevice];
        await set(userScenesRef, scenes);
  
        return { success: true, message: 'Device added successfully.', scene: scenes[sceneId] };
      } else {
        return { success: false, message: `Scene with ID ${sceneId} not found for user with ID ${userId}.` };
      }
    } catch (error) {
      console.error('Error adding device to scene:', error);
      return { success: false, message: 'Internal Server Error' };
    }
  };
  
  module.exports = { addDeviceToScene };