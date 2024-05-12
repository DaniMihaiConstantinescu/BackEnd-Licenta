const net = require('net');
const readline = require('readline');
const os = require('os');


function getMacAddress() {
    const networkInterfaces = os.networkInterfaces();

    let ethernetMac;
    let wifiMac;

    Object.entries(networkInterfaces).forEach(([interfaceName, interfaceDetails]) => {
        if (interfaceName.startsWith('Ethernet') && !ethernetMac) {
            ethernetMac = interfaceDetails.find(addressInfo => !addressInfo.internal && addressInfo.mac);
        } else if (interfaceName.startsWith('Wi-Fi') && !wifiMac) {
            wifiMac = interfaceDetails.find(addressInfo => !addressInfo.internal && addressInfo.mac);
        }
    });

    return ethernetMac ? ethernetMac.mac : (wifiMac ? wifiMac.mac : null);
}




const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = new net.Socket();

// Connect to the server
const PORT = 9090; 
const HOST = 'localhost'; 
client.connect(PORT, HOST, () => {
  console.log(`Connected to server ${HOST}:${PORT}`);

  // initialization message
  client.write(JSON.stringify({
    "messageType": "initialize",
    "mac": getMacAddress().toString()
  }))

  rl.prompt();
});

client.on('data', (data) => {
  console.log('Received:', data.toString());
});

client.on('error', (error) => {
  console.error('Error:', error.message);
  client.destroy(); // Close the connection
});

client.on('close', () => {
  console.log('Connection closed');
});


rl.on('line', (input) => {
  const number = parseInt(input);
  if (!isNaN(number)) {
    handleInput(number);
  } else {
    console.log('Please enter a valid number');
  }
  rl.prompt();
});

rl.on('SIGINT', () => {
  client.end(); 
  rl.close();
});


function handleInput(nr){
    switch (nr) {
        case 1:
            const message1 = JSON.stringify({
                "device": {"temp": "20"},
                "deviceMac": "1.1.1.1",
                "hubMac": "02:00:00:00:00:00",
                "messageType": "hub"
              });
              
            client.write(message1);
            break;
    
        case 2:
            const message2 = JSON.stringify({
                "device": {"temp": "20"},
                "deviceMac": "1.1.1.1",
                "hubMac": "02:00:00:00:00:00",
                "messageType": "client"
              });
              
            client.write(message2);
            break;

        default:
            break;
    }
}
