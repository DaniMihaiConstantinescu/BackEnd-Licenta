const { ref, set, get } = require('firebase/database');
const { dbRef } = require('../../firebase');

function getResourceType(resource){
    if (resource === 'scenes') {
        return 'scene';
    } else if (resource === 'scenes') {
        return 'schedule';
    }else
      return resource;
}

const addDevice = async ( resource, userId, resourceId, newDevice) => {
    const resourceType = getResourceType(resource);

    try {
      const userScenesRef = ref(dbRef, `users/${userId}/${resource}`);
      const snapshot = await get(userScenesRef);
      const scenes = snapshot.val();

  
      if (scenes && scenes[resourceId]) {
        const existingDevices = scenes[resourceId].devices || [];
        
        // Check if the device already exists
        const isDeviceExists = existingDevices.some(device => device.macAddress === newDevice.macAddress);
  
        if (isDeviceExists) {
          return { success: false, message: `Device with the same MAC address already exists in the ${resourceType}.` };
        }
  
        scenes[resourceId].devices = [...existingDevices, newDevice];
        await set(userScenesRef, scenes);
  
        return { success: true, message: 'Device added successfully.', resourceType: scenes[resourceId] };
      } else {
        return { success: false, message: `${resourceType} with ID ${resourceId} not found for user with ID ${userId}.` };
      }
    } catch (error) {
      console.error(`Error adding device:`, error);
      return { success: false, message: 'Internal Server Error' };
    }
  };
  
  module.exports = { addDevice };