const fs = require('fs')
const AWS = require('aws-sdk')
const fsPromises = fs.promises
const path = require('path')
const moment = require('moment');
const _ = require('lodash');
const { Console } = require('console');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const uploadToAWS = async (images) => {
    console.log("COMECANDO OS UPLOADS EM: " + moment())
    images.forEach(async o => {
        let fileContent = fs.readFileSync(process.env.IMAGE_DIRECTORY + o)
        console.log(`Imagem ${o} começou em ${moment()}`)
        s3.upload({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'images/' + o,
            Body: fileContent
        }).promise().then(
            function (data) {
                console.log(`Imagem ${o} terminou em ${moment()}`)
                // console.log(data)
            },
            function (err) {
                console.log("ALgo de errado aconteceu")
                console.log(err)
            }
        )
    })
}
// let fileContent = fs.readFileSync('/home/dotta/dev/images/00000.png')

module.exports = {
    uploadImages: async (req, res) => {
        let images = await fsPromises.readdir(process.env.IMAGE_DIRECTORY)
        let workingImages = images.slice(0, req.params.imageCount)
        uploadToAWS(workingImages)
        res.send("Uploading images: " + req.params.imageCount)
    },


    teste: async (req, res) => {

        console.log(data.slice(0, 10))
        res.send("Testando")
    },
    
    downloadResultsFromS3: async (req, res) => {
        const pieces = req.params.path.split("_")
        const dirPath = pieces.join('/')
        console.log(dirPath)
        const data = await s3.listObjectsV2({
            Bucket: process.env.AWS_BUCKET_NAME,
            Prefix: dirPath
        }).promise()
        console.log(data)
        for (const obj of data.Contents) {
            let fileName = obj.Key.split('/')[obj.Key.split('/').length - 1]
            console.log(fileName)
            let readStream = await s3.getObject({Bucket: process.env.AWS_BUCKET_NAME, Key: obj.Key}).createReadStream()
            let writeStream = await fs.createWriteStream(path.join(__dirname, `../results/${fileName}`))
            readStream.pipe(writeStream)
        }
        res.send("Arquivos baixados")
    },

    analyzeResults: async (req, res) => {
        const resultsData = []
        dirPath = './results/'
        const results = await fsPromises.readdir(dirPath)
        for (const file of results) {
            const data = await fsPromises.readFile(dirPath + file, {encoding: 'utf8'})
            resultsData.push(data)
        }
        totalExecTime = 0
        largestTime = 0
        smallestTime = resultsData[0].split('\n')[1]
        for (o of resultsData) {
            totalExecTime += Number(o.split('\n')[3])
            if (o.split('\n')[2] > largestTime) largestTime = o.split('\n')[2]
            if (o.split('\n')[1] < smallestTime) smallestTime = o.split('\n')[1]
        }
        console.log(totalExecTime)
        console.log(moment.unix(smallestTime).format('DD/MM/YYYY HH:mm:ss SSS'))
        console.log(moment.unix(largestTime).format('DD/MM/YYYY HH:mm:ss SSS'))
        res.send("Analyzing results")
    }
 }