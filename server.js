require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const { uploadImages, teste, downloadResultsFromS3, analyzeResults } = require('./controller/functions.js')


app.get('/upload/:imageCount', uploadImages)
app.get('/downloadResultsFromS3/:path', downloadResultsFromS3)
app.get('/analyzeResults', analyzeResults)
app.get('/teste', teste)



app.listen(PORT, () => {
    console.log("App listening on port: ", PORT)
})