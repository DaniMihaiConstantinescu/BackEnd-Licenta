const { ref, set, get, remove } = require('firebase/database');
const { dbRef } = require('../../../firebase');

const removeDeviceFromOtherLocations = async (userId, macAddress) => {
  try {
    await removeDeviceFromLocation('rooms', userId, macAddress);
    await removeDeviceFromLocation('scenes', userId, macAddress);
    await removeDeviceFromLocation('schedules', userId, macAddress);

    await removeDeviceFromDevices(macAddress);
  } catch (error) {
    console.error('Error removing device from other locations:', error);
    throw error;
  }
};

// Function to remove the device from a specific location
const removeDeviceFromLocation = async (location, userId, macAddress) => {
  try {
    const locationRef = ref(dbRef, `users/${userId}/${location}`);
    const snapshot = await get(locationRef);
    const items = snapshot.val();

    if (items) {
      for (const id in items) {
        const item = items[id];

        if (location === 'scenes' || location === 'schedules') {
          item.devices = item.devices.filter(device => device.macAddress !== macAddress);
        }else{
          if (item.devices && item.devices.includes(macAddress)) {
            item.devices = item.devices.filter(device => device !== macAddress);
          }
        }
        await set( ref(dbRef, `users/${userId}/${location}/${id}`), item);
      }
    }
  } catch (error) {
    console.error(`Error removing device from ${location}:`, error);
    throw error;
  }
};

// Function to remove the device from devices
const removeDeviceFromDevices = async (macAddress) => {
  try {
    const devicesRef = ref(dbRef, `devices/${macAddress}`);
    const snapshot = await get(devicesRef);
    const device = snapshot.val();

    if (device) {
        await remove(devicesRef);
    }
  } catch (error) {
    console.error(`Error removing device from devices:`, error);
    throw error;
  }
};

module.exports = { removeDeviceFromOtherLocations }