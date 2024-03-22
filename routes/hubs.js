const express = require('express')
const router = express.Router()

const { ref, push, set, get } = require('firebase/database');
const { dbRef } = require('../firebase');
const { addSimpleDevice } = require('./func/addSimpleDevice')
const { deleteSimpleDevice } = require('./func/removeSimpleDevice')


// --------- Routes only with userID --------- 
router
    .route('/:userId')

    // --------- Get all the hubs for a user --------- 
    .get(async (req, res) => {
      const userId = req.params.userId;
      try {
        const usersRef = ref(dbRef, `users/${userId}/hubs`);
        const snapshot = await get(usersRef);

        const hubs = snapshot.val();
        if (hubs) {
          return res.json({
            message: "Hubs data found successfully",
            hubs: hubs
          });
        } else {
          return res.status(404).send(`User with ID ${userId} not found.`);
        }
      } catch (error) {
        console.error('Error fetching user hubs:', error);
        return res.status(500).send('Internal Server Error');
      }
    })

    // --------- Create a new hub for a user --------- 
    .post(async (req, res) => {
      try {
        const userId = req.params.userId;
        const { devices, macAddress } = req.body;
    
        // Validate body
        if (!devices || !macAddress) {
          return res.status(400).json({ error: 'Invalid request body' });
        }
    
        const userHubsRef = ref(dbRef, `users/${userId}/hubs`);
    
        // Generate unique Id
        const newHubRef = push(userHubsRef);
    
        const hub = {
          hubId: newHubRef.key,
          devices,
          macAddress
        };
        
        // Set the new hub in the database
        await set(newHubRef, hub);
    
        // Send response after setting the hub
        return res.status(201).json({ message: 'Hub created successfully', hub });
      } catch (error) {
        console.error('Error creating hub:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    })
    

// --------- Get all devices in hub ---------   
router.get('/:userId/all-devices', async (req, res) => {
  const userId = req.params.userId;

  try {
    const hubsRef = ref(dbRef, `users/${userId}/hubs`);
    const snapshotHub = await get(hubsRef);
    const hubs = snapshotHub.val();

    if (hubs) {
      let allDevices = [];

      // Iterate over each hub
      for (const hubId in hubs) {
        const hubDevicesRef = ref(dbRef, `users/${userId}/hubs/${hubId}/devices`);
        const snapshotDevices = await get(hubDevicesRef);
        const devices = snapshotDevices.val();

        if (devices) {
          // Add devices of the current hub to the array of all devices
          allDevices = allDevices.concat(Object.values(devices));
        }
      }

      if (allDevices.length > 0) {
        // Retrieve details for each device
        const deviceDetailsPromises = allDevices.map(async (deviceId) => {
          const deviceRef = ref(dbRef, `devices/${deviceId}`);
          const deviceSnapshot = await get(deviceRef);
          const deviceDetails = deviceSnapshot.val();
          return deviceDetails;
        });

        // Wait for all device details promises to resolve
        const deviceDetails = await Promise.all(deviceDetailsPromises);

        return res.json({
          message: "Devices found successfully",
          devices: deviceDetails
        });
      } else {
        return res.status(404).send("No devices found for the user's hubs.");
      }
    } else {
      return res.status(404).send(`Hubs for user with ID ${userId} not found.`);
    }
  } catch (error) {
    console.error('Error fetching devices:', error);
    return res.status(500).send('Internal Server Error');
  }
});


// --------- Routes with userID and hubId --------- 
router
    .route('/:userId/:hubId')
    .get(async (req, res) => {
      const userId = req.params.userId;
      const hubId = req.params.hubId;

      try {
        const usersRef = ref(dbRef, `users/${userId}/hubs/${hubId}`);
        const snapshot = await get(usersRef);
        
        const hub = snapshot.val();
        if (hub) {
          return res.json({
            message: "Hub found successfully",
            hub: hub
          });
        } else {
          return res.status(404).send(`Hub with ID ${hubId} not found.`);
        }
      } catch (error) {
        console.error('Error fetching hub:', error);
        return res.status(500).send('Internal Server Error');
      }
    })

    .put(async (req, res) => {
      const userId = req.params.userId;
      const hubId = req.params.hubId;
      const { devices, macAddress } = req.body;
    
      if (!devices || !macAddress) {
        return res.status(400).json({ error: 'Invalid request body' });
      }
    
      try {
        const userHubsRef = ref(dbRef, `users/${userId}/hubs`);
    
        const snapshot = await get(userHubsRef);
        const hubs = snapshot.val();
    
        if (hubs && hubs[hubId]) {
          hubs[hubId] = {
            hubId,
            devices,
            macAddress
          };
    
          await set(userHubsRef, hubs);
          return res.json({ 
            message: `Hub with ID ${hubId} updated for user with ID ${userId}.`,
            hub: hubs[hubId] 
          });
        } else {
          return res.status(404).send(`Hub with ID ${hubId} not found for user with ID ${userId}.`);
        }
      } catch (error) {
        console.error('Error updating hub:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    .patch(async (req, res) => {
      const userId = req.params.userId;
      const hubId = req.params.hubId;
      const { macAddress, devices } = req.body;
    
      if (macAddress === undefined && devices === undefined) {
        return res.status(400).json({ error: 'Invalid request body' });
      }
    
      try {
        const userHubsRef = ref(dbRef, `users/${userId}/hubs`);
    
        const snapshot = await get(userHubsRef);
        const hubs = snapshot.val();
    
        if (hubs && hubs[hubId]) {
          if (macAddress !== undefined) {
            hubs[hubId].macAddress = macAddress;
          }
    
          if (devices !== undefined) {
            hubs[hubId].devices = devices;
          }
    
          await set(userHubsRef, hubs);
    
          res.json({ 
            message: `Hub with ID ${hubId} updated for user with ID ${userId}.`,
            hub: hubs[hubId] 
          });
        } else {
          res.status(404).send(`Hub with ID ${hubId} not found for user with ID ${userId}.`);
        }
      } catch (error) {
        console.error('Error updating hub:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })
    
    .delete(async (req, res) => {
      const userId = req.params.userId;
      const hubId = req.params.hubId;
    
      try {
        const usersRef = ref(dbRef, `users/${userId}/hubs`);
        const snapshot = await get(usersRef);
    
        const hubs = snapshot.val();
  
        if (hubs && hubs[hubId]) {
          delete hubs[hubId];
  
          // Update db
          set(ref(dbRef, `users/${userId}/hubs`), hubs);
  
          if (!res.headersSent) {
            return res.json({ message: `Hub with ID ${hubId} deleted for user with ID ${userId}.` });
          }
        } else {
          if (!res.headersSent) {
            return res.status(404).send(`Hub with ID ${hubId} not found for user with ID ${userId}.`);
          }
        }
      } catch (error) {
        console.error('Error deleting hub:', error);
        if (!res.headersSent) {
          return res.status(500).send('Internal Server Error');
        }
      }
    });


// --------- Add device to hub ---------   
router.post('/:userId/:hubId/add-device', async (req, res) => {
  const userId = req.params.userId;
  const hubId = req.params.hubId;
  const newDevice = req.body;

  const result = await addSimpleDevice('hubs', userId, hubId, newDevice);

  if (result.success) {
    return res.status(201).json({ message: result.message, hub: result.hub });
  } else {
    return res.status(400).json({ error: result.message });
  }
});

// --------- Remove device from hub ---------   
router.post('/:userId/:hubId/:macAddress', async (req, res) => {
  const userId = req.params.userId;
  const hubId = req.params.hubId;
  const macAddress = req.params.macAddress;

  try {
    const result = await deleteSimpleDevice('hubs', userId, hubId, macAddress);
    return res.status(201).json({ message: result.message, hub: result.hub });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    } else {
      console.error('Error removing device from hub:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});
    

module.exports = router