const express = require('express');
const router = express.Router();
const { ref, push, set, get, remove } = require('firebase/database');
const { dbRef } = require('../firebase');


// Get all devices
router.get('/', async (req, res) => {
    try {
        const devicesRef = ref(dbRef, 'devices');
        const snapshot = await get(devicesRef);
        const devices = snapshot.val() || {};
        return res.status(200).json(devices);
    } catch (error) {
        console.error('Error fetching devices:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Create a new device
router.post('/', async (req, res) => {
    try {
        const { deviceMAC, hubMac, name, type } = req.body;
        if (!deviceMAC || !hubMac || !name || !type) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        const devicesRef = ref(dbRef, `devices/${deviceMAC}`);
        
        // Check if the device already exists
        const snapshot = await get(devicesRef);
        if (snapshot.exists()) {
            return res.status(400).json({ error: `Device with MAC address ${deviceMAC} already exists` });
        }

        const deviceData = {
            deviceMAC,
            hubMac,
            name,
            type
        };
        await set(devicesRef, deviceData);

        return res.status(201).json({ message: 'Device created successfully', device: deviceData });
    } catch (error) {
        console.error('Error creating device:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})


router.post('/not-in', async (req, res) => {
    try {
        const devicesRef = ref(dbRef, 'devices');
        const snapshot = await get(devicesRef);
        const allDevices = snapshot.val() || {};

        const devices = req.body;
        const allDeviceKeys = Object.keys(allDevices).filter(key => allDevices[key] !== null);

        const notDevicesKeys = allDeviceKeys.filter(device => !devices.some(d => d && d === device));
        const notDevices = notDevicesKeys.map(key => allDevices[key]);

        return res.status(200).json({
            message: "Devices found successfully",
            devices: notDevices
        });
    } catch (error) {
        console.error('Error fetching devices:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

router
    .route('/:deviceMAC')
    .get(async (req, res) => {
        try {
            const deviceMAC = req.params.deviceMAC;
            const devicesRef = ref(dbRef, `devices/${deviceMAC}`);
            const snapshot = await get(devicesRef);
            const device = snapshot.val();
            if (device) {
                return res.status(200).json(device);
            } else {
                return res.status(404).json({ error: 'Device not found' });
            }
        } catch (error) {
            console.error('Error fetching device:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    })

    .patch(async (req, res) => {
        try {
            const deviceMAC = req.params.deviceMAC;
            const { hubMac, name, type } = req.body;
            const devicesRef = ref(dbRef, `devices/${deviceMAC}`);
            const snapshot = await get(devicesRef);
            const device = snapshot.val();
            if (device) {
                // Exclude deviceMAC from the update
                const updatedDevice = {
                    ...device,
                    hubMac: hubMac || device.hubMac,
                    name: name || device.name,
                    type: type || device.type
                };
                await set(devicesRef, updatedDevice);
                return res.json({ message: 'Device patched successfully', device: updatedDevice });
            } else {
                return res.status(404).json({ error: 'Device not found' });
            }
        } catch (error) {
            console.error('Error patching device:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    })
    
    .delete(async (req, res) => {
        try {
            const deviceMAC = req.params.deviceMAC;
            const devicesRef = ref(dbRef, `devices/${deviceMAC}`);
            const snapshot = await get(devicesRef);
            const device = snapshot.val();
            if (device) {
                await remove(devicesRef);
                return res.json({ message: 'Device deleted successfully', device });
            } else {
                return res.status(404).json({ error: 'Device not found' });
            }
        } catch (error) {
            console.error('Error deleting device:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    })

module.exports = router;
