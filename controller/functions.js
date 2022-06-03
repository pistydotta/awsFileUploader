const fs = require('fs')
const AWS = require('aws-sdk')
const fsPromises = fs.promises
const path = require('path')
const moment = require('moment');
const _ = require('lodash')

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
        data.Contents.forEach(o => {
            let fileName = o.Key.split('/')[o.Key.split('/').length - 1]
            console.log(fileName)
            let readStream = s3.getObject({Bucket: process.env.AWS_BUCKET_NAME, Key: o.Key}).createReadStream()
            let writeStream = fs.createWriteStream(path.join(__dirname, `../results/${fileName}`))
            readStream.pipe(writeStream)
        })
        // console.log(data)
        res.send("Arquivos baixados")
    },

    analyzeResults: async (req, res) => {
        res.send("Analyzing results")
    }
 }