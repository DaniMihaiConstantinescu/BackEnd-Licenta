const net = require('net');
const {process_recived} = require('./process_recived')

const ipMacMap = new Map();

const server = net.createServer((socket) => {
  let index = 0;
  console.log('Client connected: ' + socket.remoteAddress);
  
  socket.on('data', (data) => {
    process_recived(JSON.parse(data.toString()), socket, ipMacMap)
  });

  socket.on('end', () => {
    // console.log("Before delete: ", ipMacMap.keys());
    for (const [mac, s] of ipMacMap) {
      if (s === socket) {
          ipMacMap.delete(mac);
          break;
      }
    }
    // console.log("After delete: ", ipMacMap.keys());
    console.log('Client disconnected: ' + socket.remoteAddress);
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

const port = 9090; 
const host = '0.0.0.0'; 

server.listen(port, host, () => {
  console.log(`Server running on ${host}:${port}`);
});

function sendDataToClient(socket, data) {
  try {
    socket.write(data);
    console.log('Data sent to client:', data);
  } catch (err) {
    console.error('Error sending data to client:', err);
  }
}