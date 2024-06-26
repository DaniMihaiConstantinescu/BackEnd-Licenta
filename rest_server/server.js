const express = require('express')

const app = express()
const port = 5000

const hubRouter = require('./routes/hubs')
const roomRouter = require('./routes/rooms')
const sceneRouter = require('./routes/scenes')
const scheduleRouter = require('./routes/schedules')
const deviceRouter = require('./routes/devices')


app.use(express.json());


app.use('/hubs', hubRouter)
app.use('/rooms', roomRouter)
app.use('/scenes', sceneRouter)
app.use('/schedules', scheduleRouter)
app.use('/devices', deviceRouter)


app.listen(port, "0.0.0.0", () => console.log(`Server started on port ${port}`))