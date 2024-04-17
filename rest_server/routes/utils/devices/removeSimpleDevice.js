const { ref, set, get } = require('firebase/database');
const { dbRef } = require('../../../firebase');

function getResourceType(resource){
    if (resource === 'scenes') {
        return 'scene';
    } else if (resource === 'scenes') {
        return 'schedule';
    } else {
      return resource;
    }
}

const deleteSimpleDevice = async (resource, userId, resourceId, macAddress) => {
    const resourceType = getResourceType(resource);

    try {
        const userResourceRef = ref(dbRef, `users/${userId}/${resource}/${resourceId}/devices`);

        const snapshot = await get(userResourceRef);
        let devices = snapshot.val() || [];

        // Check if the device exists in the array
        const deviceIndex = devices.indexOf(macAddress);
        if (deviceIndex !== -1) {
            devices.splice(deviceIndex, 1);
            await set(userResourceRef, devices);

            return { message: `Device with mac address ${macAddress} deleted from the array successfully` };
        } else {
            throw new Error(`Device with mac address ${macAddress} not found in the ${resourceType}'s devices array.`);
        }
    } catch (error) {
        console.error('Error deleting device from array:', error);
        throw error;
    }
};

module.exports = { deleteSimpleDevice };


module.exports = { deleteSimpleDevice };
