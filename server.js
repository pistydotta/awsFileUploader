require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const { uploadImages, teste, downloadResultsFromS3, analyzeServerlessResults, analyzeLocalResults, createFolders, getResults } = require('./controller/functions.js')
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


app.post('/uploadImages', uploadImages)
app.post('/downloadResultsFromS3', downloadResultsFromS3)
app.get('/analyzeServerlessResults', analyzeServerlessResults)
app.get('/analyzeLocalResults', analyzeLocalResults)
app.get('/createFolders', createFolders)
app.get('/teste', teste)
app.get('/getResults', getResults)


app.listen(PORT, () => {
    console.log("App listening on port: ", PORT)
})