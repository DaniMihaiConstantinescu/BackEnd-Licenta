const express = require('express')
const router = express.Router()

const { onValue, ref, push, set, get } = require('firebase/database');
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

        onValue(usersRef, (snapshot) => {
          const hubs = snapshot.val();
          if (hubs) {
            res.json({
              message: "Hubs data found successfully",
              hubs: hubs
            });
          } else {
            res.status(404).send(`User with ID ${userId} not found.`);
          }
        });
      } catch (error) {
        console.error('Error fetching user hubs:', error);
        res.status(500).send('Internal Server Error');
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
        res.status(201).json({ message: 'Hub created successfully', hub });
      } catch (error) {
        console.error('Error creating hub:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })
    
    

// --------- Routes with userID and hubId --------- 
router
    .route('/:userId/:hubId')
    .get((req, res) => {
      const userId = req.params.userId;
      const hubId = req.params.hubId;

      try {
        const usersRef = ref(dbRef, `users/${userId}/hubs/${hubId}`);

        onValue(usersRef, (snapshot) => {
          const hub = snapshot.val();
          if (hub) {
            res.json({
              message: "Hub found successfully",
              hub: hub
            });
          } else {
            res.status(404).send(`Hub with ID ${hubId} not found.`);
          }
        });
      } catch (error) {
        console.error('Error fetching hub:', error);
        res.status(500).send('Internal Server Error');
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
    
    .delete((req, res) => {
      const userId = req.params.userId;
      const hubId = req.params.hubId;
    
      try {
        const usersRef = ref(dbRef, `users/${userId}/hubs`);
    
        onValue(usersRef, (snapshot) => {
          const hubs = snapshot.val();
    
          if (hubs && hubs[hubId]) {
            delete hubs[hubId];
    
            // Update db
            set(ref(dbRef, `users/${userId}/hubs`), hubs);
    
            if (!res.headersSent) {
              res.json({ message: `Hub with ID ${hubId} deleted for user with ID ${userId}.` });
            }
          } else {
            if (!res.headersSent) {
              res.status(404).send(`Hub with ID ${hubId} not found for user with ID ${userId}.`);
            }
          }
        });
      } catch (error) {
        console.error('Error deleting hub:', error);
        if (!res.headersSent) {
          res.status(500).send('Internal Server Error');
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
    res.status(201).json({ message: result.message, hub: result.hub });
  } else {
    res.status(400).json({ error: result.message });
  }
});

// --------- Remove device from hub ---------   
router.post('/:userId/:hubId/:macAddress', async (req, res) => {
  const userId = req.params.userId;
  const hubId = req.params.hubId;
  const macAddress = req.params.macAddress;

  try {
    const result = await deleteSimpleDevice('hubs', userId, hubId, macAddress);
    res.status(201).json({ message: result.message, hub: result.hub });
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      console.error('Error removing device from hub:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});
    

module.exports = router