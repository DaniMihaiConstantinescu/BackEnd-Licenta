const { ref, set, get } = require('firebase/database');
const { dbRef } = require('../../firebase');

const deleteDeviceFromScene = async (userId, sceneId, macAddress) => {
    try {
        const userSceneDevicesRef = ref(dbRef, `users/${userId}/scenes/${sceneId}/devices`);

        const snapshot = await get(userSceneDevicesRef);
        const devices = snapshot.val();

        // Get index of device if exists
        const deviceIndex = Object.keys(devices || {}).findIndex((deviceId) => devices[deviceId].macAddress === macAddress);

        if (deviceIndex !== -1) {
            delete devices[Object.keys(devices)[deviceIndex]];

            // Update the devices array in the database
            await set(userSceneDevicesRef, devices);

            return { message: `Device with mac address ${macAddress} deleted from the array successfully` };
        } else {
            throw new Error(`Device with mac address ${macAddress} not found in the scene's devices array.`);
        }
    } catch (error) {
        console.error('Error deleting device from array:', error);
        throw error;
    }
};

module.exports = { deleteDeviceFromScene };
