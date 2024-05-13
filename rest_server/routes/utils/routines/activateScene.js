const net = require('net');
const { ref, get } = require('firebase/database');
const { dbRef } = require('../../../firebase');

const activateScene = async (scene) => {

    const client = new net.Socket();

    // Connect to the server
    const PORT = 9090; 
    const HOST = 'localhost'; 
    client.connect(PORT, HOST, async () => {

        try{
        // console.log(`Connected to server ${HOST}:${PORT}`);

        // after connecting send the command
        const devicesList = []  
        for ( const device of scene.devices ) {
            const hubMac = await getHubMAC(device.macAddress)
            if (hubMac) {
                devicesList.push({
                    "settings": device.settings,
                    "deviceMac": device.macAddress,
                    "hubMac": hubMac
                });
            }
        };
        client.write(JSON.stringify({
            "devices": devicesList,
            "messageType": "client"
        }));

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

module.exports = { activateScene }