const express = require('express')
const app = express()
const port = 5000

const userRouter = require('./routes/scenes')

app.use(express.json());
app.use('/scenes', userRouter)
app.listen(port, () => console.log(`Server started on port ${port}`))