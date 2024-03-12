const express = require('express')
const router = express.Router()

const { onValue, ref, push, set, get } = require('firebase/database');
const { dbRef } = require('../firebase');
const { addDevice } = require('./func/addDevice')
const { deleteDevice } = require('./func/removeDevice')


// --------- Routes only with userID --------- 
router
    .route('/:userId')

    // --------- Get all the schedules for a user --------- 
    .get(async (req, res) => {
      const userId = req.params.userId;
      try {
        const usersRef = ref(dbRef, `users/${userId}/schedules`);

        onValue(usersRef, (snapshot) => {
          const schedules = snapshot.val();
          if (schedules) {
            res.json({
              message: "Schedules data found successfully",
              schedules: schedules
            });
          } else {
            res.status(404).send(`User with ID ${userId} not found.`);
          }
        });
      } catch (error) {
        console.error('Error fetching user schedules:', error);
        res.status(500).send('Internal Server Error');
      }
    })

    // --------- Create a new schedule for a user --------- 
    .post(async (req, res) => {
        try {
            const userId = req.params.userId;
            const { devices, isActive, scheduleName, from, until, days } = req.body;

            // Validate body
            if (!devices || isActive === undefined || !scheduleName || !from || !until || !days) {
                return res.status(400).json({ error: 'Invalid request body' });
            }

            const userSchedulesRef = ref(dbRef, `users/${userId}/schedules`);

            // Generate unique Id
            const newScheduleRef = push(userSchedulesRef);

            const schedule = {
                scheduleId: newScheduleRef.key,
                devices,
                isActive,
                scheduleName,
                from,
                until,
                days
            };
            await set(newScheduleRef, schedule);

            res.status(201).json({ message: 'Schedule created successfully', schedule });
        } catch (error) {
            console.error('Error creating schedule:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })


// --------- Get top 3 schedules --------- 
router.get('/top3/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const usersRef = ref(dbRef, `users/${userId}/schedules`);

    onValue(usersRef, (snapshot) => {
      const schedules = snapshot.val();

      if (schedules) {

        // Get first 3 active schedules
        const activeSchedules = Object.values(schedules).filter((schedule) => schedule.isActive).slice(0, 3);

        // Complete with inactive schedules if needed
        const inactiveSchedules = Object.values(schedules).filter((schedule) => !schedule.isActive);
        const resultSchedules = activeSchedules.concat(inactiveSchedules.slice(0, Math.max(0, 3 - activeSchedules.length)));

        res.json({
          message: "Top 3 schedules found successfully",
          schedules: resultSchedules
        });
      } else {
        res.status(404).send(`User with ID ${userId} not found or has no schedules.`);
      }
    });
  } catch (error) {
    console.error('Error fetching user schedules:', error);
    res.status(500).send('Internal Server Error');
  }
});
    

// --------- Routes with userID and scheduleId --------- 
router
    .route('/:userId/:scheduleId')
    .get((req, res) => {
      const userId = req.params.userId;
      const scheduleId = req.params.scheduleId;

      try {
        const usersRef = ref(dbRef, `users/${userId}/schedules/${scheduleId}`);

        onValue(usersRef, (snapshot) => {
          const schedule = snapshot.val();
          if (schedule) {
            res.json({
              message: "Schedule found successfully",
              schedule: schedule
            });
          } else {
            res.status(404).send(`Schedule with ID ${scheduleId} not found.`);
          }
        });
      } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).send('Internal Server Error');
      }
    })

    .put(async (req, res) => {
        const userId = req.params.userId;
        const scheduleId = req.params.scheduleId;
        const { devices, isActive, scheduleName, from, until, days } = req.body;
      
        // Validate request body
        if (!devices || isActive === undefined || !scheduleName || !from || !until || !days) {
          return res.status(400).json({ error: 'Invalid request body' });
        }
      
        try {
          const userSchedulesRef = ref(dbRef, `users/${userId}/schedules`);
      
          const snapshot = await get(userSchedulesRef);
          const schedules = snapshot.val();
      
          if (schedules && schedules[scheduleId]) {
            schedules[scheduleId] = {
              scheduleId,
              devices,
              isActive,
              scheduleName,
              from,
              until,
              days
            };
      
            await set(userSchedulesRef, schedules);
            res.json({ 
              message: `Schedule with ID ${scheduleId} updated for user with ID ${userId}.`,
              schedule: schedules[scheduleId] 
            });
          } else {
            res.status(404).send(`Schedule with ID ${scheduleId} not found for user with ID ${userId}.`);
          }
        } catch (error) {
          console.error('Error updating schedule:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
    })
      
    .patch(async (req, res) => {
        const userId = req.params.userId;
        const scheduleId = req.params.scheduleId;
        const { isActive, scheduleName, devices, from, until, days } = req.body;
        
        // Check if any field is provided in the request body
        if (isActive === undefined && scheduleName === undefined && devices === undefined && from === undefined && until === undefined && days === undefined) {
            return res.status(400).json({ error: 'Invalid request body' });
        }
        
        try {
            const userSchedulesRef = ref(dbRef, `users/${userId}/schedules`);
        
            const snapshot = await get(userSchedulesRef);
            const schedules = snapshot.val();
        
            if (schedules && schedules[scheduleId]) {
            // Update fields if provided in the request body
            if (isActive !== undefined) {
                schedules[scheduleId].isActive = isActive;
            }
        
            if (scheduleName !== undefined) {
                schedules[scheduleId].scheduleName = scheduleName;
            }
        
            if (devices !== undefined) {
                schedules[scheduleId].devices = devices;
            }
        
            if (from !== undefined) {
                schedules[scheduleId].from = from;
            }
        
            if (until !== undefined) {
                schedules[scheduleId].until = until;
            }
        
            if (days !== undefined) {
                schedules[scheduleId].days = days;
            }
        
            await set(userSchedulesRef, schedules);
        
            res.json({ 
                message: `Schedule with ID ${scheduleId} updated for user with ID ${userId}.`,
                schedule: schedules[scheduleId] 
            });
            } else {
            res.status(404).send(`Schedule with ID ${scheduleId} not found for user with ID ${userId}.`);
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })
      
    .delete((req, res) => {
      const userId = req.params.userId;
      const scheduleId = req.params.scheduleId;
    
      try {
        const usersRef = ref(dbRef, `users/${userId}/schedules`);
    
        onValue(usersRef, (snapshot) => {
          const schedules = snapshot.val();
    
          if (schedules && schedules[scheduleId]) {
            delete schedules[scheduleId];
    
            // Update db
            set(ref(dbRef, `users/${userId}/schedules`), schedules);
    
            if (!res.headersSent) {
              res.json({ message: `Schedule with ID ${scheduleId} deleted for user with ID ${userId}.` });
            }
          } else {
            if (!res.headersSent) {
              res.status(404).send(`Schedule with ID ${scheduleId} not found for user with ID ${userId}.`);
            }
          }
        });
      } catch (error) {
        console.error('Error deleting schedule:', error);
        if (!res.headersSent) {
          res.status(500).send('Internal Server Error');
        }
      }
    });
    

// --------- Toggle schedule on/off ---------   
router.post('/toggle/:userId/:scheduleId', async (req, res) => {
  const userId = req.params.userId;
  const scheduleId = req.params.scheduleId;

  try {
    const userScheduleRef = ref(dbRef, `users/${userId}/schedules/${scheduleId}`);

    const snapshot = await get(userScheduleRef);
    const schedule = snapshot.val();

    if (schedule) {
      // Toggle the isActive property
      schedule.isActive = !schedule.isActive;

      // Update the schedule in the database
      await set(userScheduleRef, schedule);

      res.json({ 
        message: `Schedule with ID ${scheduleId} toggled for user with ID ${userId}.`,
        schedule: schedule 
      });
    } else {
      res.status(404).send(`Schedule with ID ${scheduleId} not found.`);
    }
    
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).send('Internal Server Error');
  }
});


// --------- Add device to schedule ---------   
router.post('/:userId/:scheduleId/add-device', async (req, res) => {
  const userId = req.params.userId;
  const scheduleId = req.params.scheduleId;
  const newDevice = req.body;

  const result = await addDevice('schedules' ,userId, scheduleId, newDevice);

  if (result.success) {
    res.status(201).json({ message: result.message, schedule: result.schedule });
  } else {
    res.status(400).json({ error: result.message });
  }
});

// --------- Remove device from schedule ---------   
router.post('/:userId/:scheduleId/:macAddress', async (req, res) => {
  const userId = req.params.userId;
  const scheduleId = req.params.scheduleId;
  const macAddress = req.params.macAddress;

  try {
    const result = await deleteDevice('schedules', userId, scheduleId, macAddress);
    res.status(201).json({ message: result.message, schedule: result.schedule });
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      console.error('Error removing device from schedule:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});


    

module.exports = router