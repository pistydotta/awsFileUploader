const fs = require('fs')
const AWS = require('aws-sdk')
const fsPromises = fs.promises
const moment = require('moment')

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const uploadImages = async (images) => {
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
        await uploadImages(workingImages)
        res.send("Uploading images: " + req.params.imageCount)
    },


    teste: async (req, res) => {

        console.log(data.slice(0, 10))
        res.send("Testando")
    }
}