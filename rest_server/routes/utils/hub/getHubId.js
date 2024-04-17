const { ref, get } = require('firebase/database');
const { dbRef } = require('../../../firebase');

const findHubIdByMac = async (userId, hubMac) => {
  try {
    const hubRef = ref(dbRef, `users/${userId}/hubs`);
    const snapshot = await get(hubRef);
    const hubs = snapshot.val();

    for (const id in hubs) {
      const hub = hubs[id];

      if (hub.macAddress === hubMac) {
        return id;
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding hub:', error);
    throw error;
  }
};

module.exports = { findHubIdByMac }