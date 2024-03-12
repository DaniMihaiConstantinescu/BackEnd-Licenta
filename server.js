const express = require('express')
const app = express()
const port = 5000

const sceneRouter = require('./routes/scenes')
const roomRouter = require('./routes/rooms')
const hubRouter = require('./routes/hubs')

app.use(express.json());

app.use('/scenes', sceneRouter)
app.use('/rooms', roomRouter)
app.use('/hubs', hubRouter)

app.listen(port, () => console.log(`Server started on port ${port}`))