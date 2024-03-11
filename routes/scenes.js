const express = require('express')
const router = express.Router()

const { onValue, ref, push, set } = require('firebase/database');
const { dbRef } = require('../firebase');


// --------- Routes only with userID --------- 
router
    .route('/:userId')

    // --------- Get all the scenes for a user --------- 
    .get(async (req, res) => {
      const userId = req.params.userId;
      try {
        const usersRef = ref(dbRef, `users/${userId}`);

        onValue(usersRef, (snapshot) => {
          const user = snapshot.val();
          if (user) {
            const scenes = user.scenes;
            res.json(scenes);
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
        if (!devices || !isActive || !sceneName) {
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
    
            res.json(resultScenes);
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
            res.json(scene);
          } else {
            res.status(404).send(`Scene with ID ${sceneId} not found.`);
          }
        });
      } catch (error) {
        console.error('Error fetching scene:', error);
        res.status(500).send('Internal Server Error');
      }
    })

    .put((req, res) => {
      res.send("Update scene with the id " + req.params.sceneId + " for the user with the id " + req.params.userId )
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
    
            console.log(scenes);
    
            // Update db
            set(ref(dbRef, `users/${userId}/scenes`), scenes);
    
            return res.json({ message: `Scene with ID ${sceneId} deleted for user with ID ${userId}.` });
          } else {
            return res.status(404).send(`Scene with ID ${sceneId} not found for user with ID ${userId}.`);
          }
        });
      } catch (error) {
        console.error('Error deleting scene:', error);
        return res.status(500).send('Internal Server Error');
      }
    });
    

module.exports = router