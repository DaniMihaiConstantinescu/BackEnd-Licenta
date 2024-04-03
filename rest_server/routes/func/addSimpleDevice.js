const { ref, set, get } = require('firebase/database');
const { dbRef } = require('../../firebase');

function getResourceType(resource){
    if (resource === 'scenes') {
        return 'scene';
    } else if (resource === 'scenes') {
        return 'schedule';
    } else {
      return resource;
    }
}

const addSimpleDevice = async (resource, userId, resourceId, newDevice) => {
    const resourceType = getResourceType(resource);

    try {
        const userResourceRef = ref(dbRef, `users/${userId}/${resource}/${resourceId}/devices`);
        const snapshot = await get(userResourceRef);
        let devices = snapshot.val() || [];

        // Check if the device already exists
        if (devices.includes(newDevice.deviceMAC)) {
            return { success: false, message: `Device with the same MAC address already exists in the ${resourceType}.` };
        }

        devices.push(newDevice.deviceMAC);
        await set(userResourceRef, devices);

        return { success: true, message: 'Device added successfully.', resourceType: devices };
    } catch (error) {
        console.error(`Error adding device:`, error);
        return { success: false, message: 'Internal Server Error' };
    }
};

module.exports = { addSimpleDevice };


module.exports = { addSimpleDevice };
