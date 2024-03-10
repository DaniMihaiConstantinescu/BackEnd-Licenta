const express = require('express')
const app = express()
const port = 5000

const userRouter = require('./routes/scenes')

app.use('/scenes', userRouter)
app.listen(port)
