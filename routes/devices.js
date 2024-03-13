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
        res.json(devices);
    } catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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

        res.status(201).json({ message: 'Device created successfully', device: deviceData });
    } catch (error) {
        console.error('Error creating device:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router
    .route('/:deviceMAC')
    .get(async (req, res) => {
        try {
            const deviceMAC = req.params.deviceMAC;
            const devicesRef = ref(dbRef, `devices/${deviceMAC}`);
            const snapshot = await get(devicesRef);
            const device = snapshot.val();
            if (device) {
                res.json(device);
            } else {
                res.status(404).json({ error: 'Device not found' });
            }
        } catch (error) {
            console.error('Error fetching device:', error);
            res.status(500).json({ error: 'Internal Server Error' });
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
                res.json({ message: 'Device patched successfully', device: updatedDevice });
            } else {
                res.status(404).json({ error: 'Device not found' });
            }
        } catch (error) {
            console.error('Error patching device:', error);
            res.status(500).json({ error: 'Internal Server Error' });
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
                res.json({ message: 'Device deleted successfully', device });
            } else {
                res.status(404).json({ error: 'Device not found' });
            }
        } catch (error) {
            console.error('Error deleting device:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })

module.exports = router;
