const express = require('express')
const router = express.Router()

const { onValue, ref, push, set, get } = require('firebase/database');
const { dbRef } = require('../firebase');
const { addDevice } = require('./func/addDevice')
const { deleteDevice } = require('./func/removeDevice')


// --------- Routes only with userID --------- 
router
    .route('/:userId')

    // --------- Get all the scenes for a user --------- 
    .get(async (req, res) => {
      const userId = req.params.userId;
      try {
        const usersRef = ref(dbRef, `users/${userId}/scenes`);

        onValue(usersRef, (snapshot) => {
          const scenes = snapshot.val();
          if (scenes) {
            res.json({
              message: "Scenes data found successfully",
              scenes: scenes
            });
          } else {
            res.status(404).send(`User with ID ${userId} not found.`);
          }
        });
      } catch (error) {
        console.error('Error fetching user scenes:', error);
        res.status(500).send('Internal Server Error');
      }
    })

    // --------- Create a new scene for a user --------- 
    .post(async (req, res) => {
      try {
        const userId = req.params.userId;
        const { devices, isActive, sceneName } = req.body;
    
        // Validate body
        if (!devices || isActive === undefined || !sceneName) {
          return res.status(400).json({ error: 'Invalid request body' });
        }
    
        const userScenesRef = ref(dbRef, `users/${userId}/scenes`);
    
        // Generate unique Id
        const newSceneRef = push(userScenesRef);
    
        const scene = {
          sceneId: newSceneRef.key,
          devices,
          isActive,
          sceneName
        };
        await set(newSceneRef, scene);
    
        res.status(201).json({ message: 'Scene created successfully', scene });
      } catch (error) {
        console.error('Error creating scene:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })


// --------- Get top 3 scenes --------- 
router.get('/top3/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const usersRef = ref(dbRef, `users/${userId}/scenes`);

    onValue(usersRef, (snapshot) => {
      const scenes = snapshot.val();

      if (scenes) {

        // Get first 3 active scenes
        const activeScenes = Object.values(scenes).filter((scene) => scene.isActive).slice(0, 3);

        // Complete with inactive scenes if needed
        const inactiveScenes = Object.values(scenes).filter((scene) => !scene.isActive);
        const resultScenes = activeScenes.concat(inactiveScenes.slice(0, Math.max(0, 3 - activeScenes.length)));

        res.json({
          message: "Top 3 scenes found successfully",
          scenes: resultScenes
        });
      } else {
        res.status(404).send(`User with ID ${userId} not found or has no scenes.`);
      }
    });
  } catch (error) {
    console.error('Error fetching user scenes:', error);
    res.status(500).send('Internal Server Error');
  }
});
    

// --------- Routes with userID and sceneId --------- 
router
    .route('/:userId/:sceneId')
    .get((req, res) => {
      const userId = req.params.userId;
      const sceneId = req.params.sceneId;

      try {
        const usersRef = ref(dbRef, `users/${userId}/scenes/${sceneId}`);

        onValue(usersRef, (snapshot) => {
          const scene = snapshot.val();
          if (scene) {
            res.json({
              message: "Scene found successfully",
              scene: scene
            });
          } else {
            res.status(404).send(`Scene with ID ${sceneId} not found.`);
          }
        });
      } catch (error) {
        console.error('Error fetching scene:', error);
        res.status(500).send('Internal Server Error');
      }
    })

    .put(async (req, res) => {
      const userId = req.params.userId;
      const sceneId = req.params.sceneId;
      const { devices, isActive, sceneName } = req.body;
    
      if (!devices || isActive === undefined || !sceneName) {
        return res.status(400).json({ error: 'Invalid request body' });
      }
    
      try {
        const userScenesRef = ref(dbRef, `users/${userId}/scenes`);
    
        const snapshot = await get(userScenesRef);
        const scenes = snapshot.val();
    
        if (scenes && scenes[sceneId]) {
          scenes[sceneId] = {
            sceneId,
            devices,
            isActive,
            sceneName
          };
    
          await set(userScenesRef, scenes);
          res.json({ 
            message: `Scene with ID ${sceneId} updated for user with ID ${userId}.`,
            scene: scenes[sceneId] 
          });
        } else {
          res.status(404).send(`Scene with ID ${sceneId} not found for user with ID ${userId}.`);
        }
      } catch (error) {
        console.error('Error updating scene:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    .patch(async (req, res) => {
      const userId = req.params.userId;
      const sceneId = req.params.sceneId;
      const { isActive, sceneName, devices } = req.body;
    
      if (isActive === undefined && sceneName === undefined && devices === undefined) {
        return res.status(400).json({ error: 'Invalid request body' });
      }
    
      try {
        const userScenesRef = ref(dbRef, `users/${userId}/scenes`);
    
        const snapshot = await get(userScenesRef);
        const scenes = snapshot.val();
    
        if (scenes && scenes[sceneId]) {
          if (isActive !== undefined) {
            scenes[sceneId].isActive = isActive;
          }
    
          if (sceneName !== undefined) {
            scenes[sceneId].sceneName = sceneName;
          }
    
          if (devices !== undefined) {
            scenes[sceneId].devices = devices;
          }
    
          await set(userScenesRef, scenes);
    
          res.json({ 
            message: `Scene with ID ${sceneId} updated for user with ID ${userId}.`,
            scene: scenes[sceneId] 
          });
        } else {
          res.status(404).send(`Scene with ID ${sceneId} not found for user with ID ${userId}.`);
        }
      } catch (error) {
        console.error('Error updating scene:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })
    
    .delete((req, res) => {
      const userId = req.params.userId;
      const sceneId = req.params.sceneId;
    
      try {
        const usersRef = ref(dbRef, `users/${userId}/scenes`);
    
        onValue(usersRef, (snapshot) => {
          const scenes = snapshot.val();
    
          if (scenes && scenes[sceneId]) {
            delete scenes[sceneId];
    
            // Update db
            set(ref(dbRef, `users/${userId}/scenes`), scenes);
    
            if (!res.headersSent) {
              res.json({ message: `Scene with ID ${sceneId} deleted for user with ID ${userId}.` });
            }
          } else {
            if (!res.headersSent) {
              res.status(404).send(`Scene with ID ${sceneId} not found for user with ID ${userId}.`);
            }
          }
        });
      } catch (error) {
        console.error('Error deleting scene:', error);
        if (!res.headersSent) {
          res.status(500).send('Internal Server Error');
        }
      }
    });
    

// --------- Toggle scene on/off ---------   
router.post('/toggle/:userId/:sceneId', async (req, res) => {
  const userId = req.params.userId;
  const sceneId = req.params.sceneId;

  try {
    const userSceneRef = ref(dbRef, `users/${userId}/scenes/${sceneId}`);

    const snapshot = await get(userSceneRef);
    const scene = snapshot.val();

    if (scene) {
      // Toggle the isActive property
      scene.isActive = !scene.isActive;

      // Update the scene in the database
      await set(userSceneRef, scene);

      res.json({ 
        message: `Scene with ID ${sceneId} toggled for user with ID ${userId}.`,
        scene: scene 
      });
    } else {
      res.status(404).send(`Scene with ID ${sceneId} not found.`);
    }
    
  } catch (error) {
    console.error('Error fetching scene:', error);
    res.status(500).send('Internal Server Error');
  }
});


// --------- Add device to scene ---------   
router.post('/:userId/:sceneId/add-device', async (req, res) => {
  const userId = req.params.userId;
  const sceneId = req.params.sceneId;
  const newDevice = req.body;

  const result = await addDevice('scenes' ,userId, sceneId, newDevice);

  if (result.success) {
    res.status(201).json({ message: result.message, scene: result.scene });
  } else {
    res.status(400).json({ error: result.message });
  }
});

// --------- Remove device from scene ---------   
router.post('/:userId/:sceneId/:macAddress', async (req, res) => {
  const userId = req.params.userId;
  const sceneId = req.params.sceneId;
  const macAddress = req.params.macAddress;

  try {
    const result = await deleteDevice('scenes', userId, sceneId, macAddress);
    res.status(201).json({ message: result.message, scene: result.scene });
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      console.error('Error removing device from scene:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});


    

module.exports = router