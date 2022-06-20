const fs = require('fs')
const AWS = require('aws-sdk')
const fsPromises = fs.promises
const path = require('path')
const moment = require('moment');
const _ = require('lodash');
const { start } = require('repl');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const uploadToAWS = async (images) => {
    const startTime = moment().unix()
    console.log("COMECANDO OS UPLOADS EM: " + moment().unix())
    images.forEach(async o => {
        let fileContent = fs.readFileSync(process.env.IMAGE_DIRECTORY + o)
        // console.log(`Imagem ${o} começou em ${moment()}`)
        s3.upload({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'testando/' + o,
            Body: fileContent
        }).promise().then(
            function (data) {
                console.log(`${moment().unix()}`)
                // console.log(data)
            },
            function (err) {
                console.log("Erro ao uploadar a imagem: ")
                console.log(err)
            }
        )
    })
    return startTime
}
// let fileContent = fs.readFileSync('/home/dotta/dev/images/00000.png')

module.exports = {
    uploadImages: async (req, res) => {
        if(!req.body.imageQnt) return res.send("Your body should have a key named imageQnt representing the number of images to be uploaded")
        let images = await fsPromises.readdir(process.env.IMAGE_DIRECTORY)
        let workingImages = images.slice(0, req.body.imageQnt)
        const startTime = await uploadToAWS(workingImages)
        res.send("Start time: " + startTime)
    },


    teste: async (req, res) => {

        console.log(data.slice(0, 10))
        res.send("Testando")
    },
    
    downloadResultsFromS3: async (req, res) => {
        if(!req.body.dirPath) return res.send("Your body should have a key named dirPath representing path from S3 you want to download")
        const dirPath = req.body.dirPath
        // console.log(dirPath)
        const data = await s3.listObjectsV2({
            Bucket: process.env.AWS_BUCKET_NAME,
            Prefix: dirPath
        }).promise()
        // console.log(data)
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