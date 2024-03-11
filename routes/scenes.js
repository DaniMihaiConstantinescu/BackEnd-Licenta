const express = require('express')
const router = express.Router()

const { onValue, ref } = require('firebase/database');
const { dbRef } = require('../firebase');


// --------- Get all the scenes for a user --------- 
router.get('/:userId', async (req, res) => {
  
  const userId = req.params.userId;
  try {
    const usersRef = ref(dbRef, 'users');

    onValue(usersRef, (snapshot) => {
      const users = snapshot.val();

      const user = users.find((user) => user.id === parseInt(userId));

      if (user) {
        const scenes = user.scenes;
        // console.log(`Scenes for User ID ${userId}: ${JSON.stringify(scenes)}`);
        res.json(scenes); 
      } else {
        // console.log(`User with ID ${userId} not found.`);
        res.status(404).send(`User with ID ${userId} not found.`);
      }
    });
  } catch (error) {
    console.error('Error fetching user scenes:', error);
    res.status(500).send('Internal Server Error');
  }
});


router
    .route('/:userId/:sceneId')
    .get((req, res) => {
      res.send("Get scene with the id " + req.params.sceneId + " for the user with the id " + req.params.userId )
    })
    .put((req, res) => {
      res.send("Update scene with the id " + req.params.sceneId + " for the user with the id " + req.params.userId )
    })
    .delete((req, res) => {
      res.send("Delete scene with the id " + req.params.sceneId + " for the user with the id " + req.params.userId )
    })

module.exports = router