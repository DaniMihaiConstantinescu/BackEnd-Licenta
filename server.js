const express = require('express')
const https = require('https');
const fs = require('fs');

const app = express()
const port = 5000

const hubRouter = require('./routes/hubs')
const roomRouter = require('./routes/rooms')
const sceneRouter = require('./routes/scenes')
const scheduleRouter = require('./routes/schedules')
const deviceRouter = require('./routes/devices')

app.use(express.json());

app.get('/test', (req, res) =>{
    res.json({"message": "Hello"})
})

app.use('/hubs', hubRouter)
app.use('/rooms', roomRouter)
app.use('/scenes', sceneRouter)
app.use('/schedules', scheduleRouter)
app.use('/devices', deviceRouter)


app.listen(port, "0.0.0.0", () => console.log(`Server started on port ${port}`))

// HTTPS
// const options = {
//     key: fs.readFileSync('certs/private.key', 'utf8'),
//     cert: fs.readFileSync('certs/certificate.pem', 'utf8'),
//     passphrase: 'parola' 
// };

//   const server = https.createServer(options, app);
//   server.listen(443, '0.0.0.0', () => {
//     console.log('Server running on https://0.0.0.0:443/');
//   });