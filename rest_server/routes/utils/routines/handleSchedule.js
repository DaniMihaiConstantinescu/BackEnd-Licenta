const net = require('net');
const { ref, get } = require('firebase/database');
const { dbRef } = require('../../../firebase');

const removeSchedule = async (schedule) => {
    const client = new net.Socket();

    // Connect to the server
    const PORT = 7070; 
    const HOST = 'localhost'; 

    client.connect(PORT, HOST, async () => {
        try{
        // console.log(`Connected to server ${HOST}:${PORT}`);

        // after connecting send the command
        client.write(JSON.stringify({
            "remove": schedule.scheduleId
        }))

        client.end();
    } catch (error) {
        console.error("Error: ", error);
        client.destroy();
    }

    });

    client.on('error', (error) => {
        console.error('Error:', error.message);
        client.destroy(); // Close the connection
    });

}

const addSchedule = async (schedule) => {

    const client = new net.Socket();

    // Connect to the server
    const PORT = 7070; 
    const HOST = 'localhost'; 

    client.connect(PORT, HOST, async () => {
        try{
        // console.log(`Connected to server ${HOST}:${PORT}`);

        // after connecting send the command
        for ( const device of schedule.devices ) {
            const hubMac = await getHubMAC(device.macAddress)
            if (hubMac) {
                client.write(JSON.stringify({
                    "schedule_id": schedule.scheduleId,
                    "hubMac": hubMac,
                    "device":{
                        "settings": device.settings,
                        "deviceMac": device.macAddress,
                    },
                    "days": schedule.days,
                    "from": schedule.from,
                    "until": schedule.until
                })); 
            }
        };

        client.end();
    } catch (error) {
        console.error("Error: ", error);
        client.destroy();
    }

    });

    client.on('error', (error) => {
        console.error('Error:', error.message);
        client.destroy(); // Close the connection
    });
}

const getHubMAC = async (deviceMac) => {
    const devicesRef = ref(dbRef, `devices/${deviceMac}/hubMac`);
    const snapshot = await get(devicesRef);
    const hubMac = snapshot.val();
    if (hubMac) {
        return hubMac;
    } else {
        return null;
    }
}


const getAllActiveHubs = async(res) => {

    try {
        const usersRef = ref(dbRef, 'users');
        const snapshot = await get(usersRef);
        const usersData = snapshot.val();
    
        if (!usersData) {
          return res.send([]);
        }
    
        const schedulesArray = [];
    
        for (const userId of Object.keys(usersData)) {
          const userSchedules = await fetchUserSchedules(userId, dbRef);
          if (userSchedules) {
            const activeSchedules = await extractActiveSchedulesWithDevices(userSchedules);
            schedulesArray.push(...activeSchedules);
          }
        }
    
        return res.send(schedulesArray);
      } catch (error) {
        console.error('Error fetching all active schedules:', error);
        return res.status(500).send('Internal Server Error');
      }

}

async function fetchUserSchedules(userId, dbRef) {
    const scheduleRef = ref(dbRef, `users/${userId}/schedules`);
    const scheduleSnapshot = await get(scheduleRef);
    return scheduleSnapshot.val();
}

async function extractActiveSchedulesWithDevices(scheduleData) {
    const schedulesArray = [];

    for (const scheduleId in scheduleData) {
        const schedule = scheduleData[scheduleId];
        if (schedule.isActive && schedule.hasOwnProperty('devices')) {
            for(const device of schedule.devices){
                const hubMac = await getHubMAC(device.macAddress)
                if (hubMac) {
                    schedulesArray.push({
                        "schedule_id": schedule.scheduleId,
                        "hubMac": hubMac, 
                        "device": device,
                        "days": schedule.days,
                        "from": schedule.from,
                        "until": schedule.until
                    });
                }
            }
        }
    }

    return schedulesArray;
}

module.exports = {addSchedule, removeSchedule, getAllActiveHubs}