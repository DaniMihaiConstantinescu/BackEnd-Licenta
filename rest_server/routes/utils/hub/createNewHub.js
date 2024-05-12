const { ref, push, set } = require('firebase/database');
const { dbRef } = require('../../../firebase');

const createNewHub = async (userId, hubMac) => {
    try {
      const userHubsRef = ref(dbRef, `users/${userId}/hubs`);
      const newHubRef = push(userHubsRef);
      const hub = {
        hubId: newHubRef.key,
        devices: [],
        macAddress: hubMac
      };
      await set(newHubRef, hub);
      return hub;
    } catch (error) {
      console.error('Error creating hub:', error);
      return null;
    }
  };

module.exports = { createNewHub }
