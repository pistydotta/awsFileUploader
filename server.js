require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const { uploadImages, teste } = require('./controller/functions.js')


app.get('/upload/:imageCount', uploadImages)
app.get('/teste', teste)



app.listen(PORT, () => {
    console.log("App listening on port: ", PORT)
})