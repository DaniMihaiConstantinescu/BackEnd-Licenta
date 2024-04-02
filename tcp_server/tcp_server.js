const net = require('net');

const server = net.createServer((socket) => {
  console.log('Client connected: ' + socket.remoteAddress);

  socket.on('data', (data) => {
    console.log('Received data from client: ' + data.toString());
  });

  socket.on('end', () => {
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
