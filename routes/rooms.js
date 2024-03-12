const express = require('express')
const router = express.Router()

const { onValue, ref, push, set, get } = require('firebase/database');
const { dbRef } = require('../firebase');
const { addSimpleDevice } = require('./func/addSimpleDevice')
const { deleteSimpleDevice } = require('./func/removeSimpleDevice')


// --------- Routes only with userID --------- 
router
    .route('/:userId')

    // --------- Get all the rooms for a user --------- 
    .get(async (req, res) => {
      const userId = req.params.userId;
      try {
        const usersRef = ref(dbRef, `users/${userId}/rooms`);

        onValue(usersRef, (snapshot) => {
          const rooms = snapshot.val();
          if (rooms) {
            res.json({
              message: "Rooms data found successfully",
              rooms: rooms
            });
          } else {
            res.status(404).send(`User with ID ${userId} not found.`);
          }
        });
      } catch (error) {
        console.error('Error fetching user rooms:', error);
        res.status(500).send('Internal Server Error');
      }
    })

    // --------- Create a new room for a user --------- 
    .post(async (req, res) => {
      try {
        const userId = req.params.userId;
        const { devices, roomName } = req.body;
    
        // Validate body
        if (!devices || !roomName) {
          return res.status(400).json({ error: 'Invalid request body' });
        }
    
        const userRoomsRef = ref(dbRef, `users/${userId}/rooms`);
    
        // Generate unique Id
        const newRoomRef = push(userRoomsRef);
    
        const room = {
          roomId: newRoomRef.key,
          devices,
          roomName
        };
        
        // Set the new room in the database
        await set(newRoomRef, room);
    
        // Send response after setting the room
        res.status(201).json({ message: 'Room created successfully', room });
      } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })
    
    

// --------- Routes with userID and roomId --------- 
router
    .route('/:userId/:roomId')
    .get((req, res) => {
      const userId = req.params.userId;
      const roomId = req.params.roomId;

      try {
        const usersRef = ref(dbRef, `users/${userId}/rooms/${roomId}`);

        onValue(usersRef, (snapshot) => {
          const room = snapshot.val();
          if (room) {
            res.json({
              message: "Room found successfully",
              room: room
            });
          } else {
            res.status(404).send(`Room with ID ${roomId} not found.`);
          }
        });
      } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).send('Internal Server Error');
      }
    })

    .put(async (req, res) => {
      const userId = req.params.userId;
      const roomId = req.params.roomId;
      const { devices, roomName } = req.body;
    
      if (!devices || !roomName) {
        return res.status(400).json({ error: 'Invalid request body' });
      }
    
      try {
        const userRoomsRef = ref(dbRef, `users/${userId}/rooms`);
    
        const snapshot = await get(userRoomsRef);
        const rooms = snapshot.val();
    
        if (rooms && rooms[roomId]) {
          rooms[roomId] = {
            roomId,
            devices,
            roomName
          };
    
          await set(userRoomsRef, rooms);
          res.json({ 
            message: `Room with ID ${roomId} updated for user with ID ${userId}.`,
            room: rooms[roomId] 
          });
        } else {
          res.status(404).send(`Room with ID ${roomId} not found for user with ID ${userId}.`);
        }
      } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    .patch(async (req, res) => {
      const userId = req.params.userId;
      const roomId = req.params.roomId;
      const { roomName, devices } = req.body;
    
      if (roomName === undefined && devices === undefined) {
        return res.status(400).json({ error: 'Invalid request body' });
      }
    
      try {
        const userRoomsRef = ref(dbRef, `users/${userId}/rooms`);
    
        const snapshot = await get(userRoomsRef);
        const rooms = snapshot.val();
    
        if (rooms && rooms[roomId]) {
          if (roomName !== undefined) {
            rooms[roomId].roomName = roomName;
          }
    
          if (devices !== undefined) {
            rooms[roomId].devices = devices;
          }
    
          await set(userRoomsRef, rooms);
    
          res.json({ 
            message: `Room with ID ${roomId} updated for user with ID ${userId}.`,
            room: rooms[roomId] 
          });
        } else {
          res.status(404).send(`Room with ID ${roomId} not found for user with ID ${userId}.`);
        }
      } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })
    
    .delete((req, res) => {
      const userId = req.params.userId;
      const roomId = req.params.roomId;
    
      try {
        const usersRef = ref(dbRef, `users/${userId}/rooms`);
    
        onValue(usersRef, (snapshot) => {
          const rooms = snapshot.val();
    
          if (rooms && rooms[roomId]) {
            delete rooms[roomId];
    
            // Update db
            set(ref(dbRef, `users/${userId}/rooms`), rooms);
    
            if (!res.headersSent) {
              res.json({ message: `Room with ID ${roomId} deleted for user with ID ${userId}.` });
            }
          } else {
            if (!res.headersSent) {
              res.status(404).send(`Room with ID ${roomId} not found for user with ID ${userId}.`);
            }
          }
        });
      } catch (error) {
        console.error('Error deleting room:', error);
        if (!res.headersSent) {
          res.status(500).send('Internal Server Error');
        }
      }
    });
    


// --------- Add device to room ---------   
router.post('/:userId/:roomId/add-device', async (req, res) => {
  const userId = req.params.userId;
  const roomId = req.params.roomId;
  const newDevice = req.body;

  const result = await addSimpleDevice('rooms', userId, roomId, newDevice);

  if (result.success) {
    res.status(201).json({ message: result.message, room: result.room });
  } else {
    res.status(400).json({ error: result.message });
  }
});

// --------- Remove device from room ---------   
router.post('/:userId/:roomId/:macAddress', async (req, res) => {
  const userId = req.params.userId;
  const roomId = req.params.roomId;
  const macAddress = req.params.macAddress;

  try {
    const result = await deleteSimpleDevice('rooms', userId, roomId, macAddress);
    res.status(201).json({ message: result.message, room: result.room });
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      console.error('Error removing device from room:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});


    

module.exports = router