const fs = require('fs')
const AWS = require('aws-sdk')
const fsPromises = fs.promises
const path = require('path')
const moment = require('moment');
const _ = require('lodash');
const { split } = require('lodash');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const uploadTesting = async (images, start, finish, iterations) => {
    let count = 0;
    let imagesToUpload = finish - start;
    // console.log("Chamando funcao de uploadar")
    // console.log("Images to upload: " + imagesToUpload)
    // console.log("Iteration: " + iterations)
    for (i = start; i < finish; i++) {
        let fileContent = fs.readFileSync(process.env.IMAGE_DIRECTORY + images[i])
        s3.upload({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'images/' + images[i],
            Body: fileContent
        }).promise().then(
            async function (data) {
                await count++;
                // console.log(count)
                if (count == imagesToUpload && iterations == 0) {
                    uploadTesting(images, 500, 999, 1)
                }
                if (count == 499 && iterations == 1) console.log(moment().unix())
            },
            function (err) {
                console.log(err)
                console.log("Erro na imagem: " + i)
            }
        )
    }
}

const uploadToAWS = async (images) => {
    let successCount = 0
    let errorCount = 0
    const startTime = moment().unix()

    console.log("Comecou os uploads em: " + moment().unix())
    // uploadTesting(images, 0, 500, iterations)
    images.forEach(async o => {
        let fileContent = fs.readFileSync(process.env.IMAGE_DIRECTORY + o)
        // console.log(`Imagem ${o} começou em ${moment()}`)
        s3.upload({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'images/' + o,
            Body: fileContent
        }).promise().then(
            async function (data) {
               console.log(`${moment().unix()}\n`)
            },
            function (err) {
                errorCount++;
                if ((successCount - errorCount) == images.length) console.log(`Terminou em ${moment().unix()}\n${successCount} e ${errorCount}`)
                console.log("erro ao subir imagem" + o)
            }
        )
    })
    return startTime
}

module.exports = {
    uploadImages: async (req, res) => {
        if (!req.body.imageQnt) return res.send("Your body should have a key named imageQnt representing the number of images to be uploaded")
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
        if (!req.body.dirPath) return res.send("Your body should have a key named dirPath representing path from S3 you want to download")
        const dirPath = req.body.dirPath
        const fileNum = dirPath.split('/')[2]
        console.log("fileNum: " + fileNum)
        for (i = 0; i < 10; i++) {
            const data = await s3.listObjectsV2({
                Bucket: process.env.AWS_BUCKET_NAME,
                Prefix: `${dirPath}${i}/`
            }).promise()
            console.log(data.Contents.length)
            for (const obj of data.Contents) {
                let fileName = obj.Key.split('/')[obj.Key.split('/').length - 1]
                console.log(fileName)
                let readStream = await s3.getObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: obj.Key }).createReadStream()
                let writeStream = await fs.createWriteStream(path.join(__dirname, `../results/${fileNum}/${i}/${fileName}`))
                readStream.pipe(writeStream)
            }
        }

        res.send("Arquivos baixados")
    },

    analyzeServerlessResults: async (req, res) => {
        let vet = [1, 100, 500, 999]
        for (qnt of vet) {
            console.log(qnt + "\n")
            let processingRuntime = 0
            let totalRuntime = 0
            let uploadTime = 0
            let billingTime = 0
            for (i = 0; i < 10; i++) {
                let resultsData = []
                let dirPath = `./results/${qnt}/${i}/`
                let resultPath = `./upload${qnt}.txt`
                const uploadTimes = await fsPromises.readFile(resultPath, { encoding: 'utf8' })
                let workingUploadTimes = uploadTimes.split('\n')
                const results = await fsPromises.readdir(dirPath)
                for (const file of results) {
                    const data = await fsPromises.readFile(dirPath + file, { encoding: 'utf8' })
                    resultsData.push(data)
                }
                let totalExecTime = 0
                let largestTime = 0
                let smallestTime = resultsData[0].split('\n')[1]
                for (o of resultsData) {
                    totalExecTime += Number(o.split('\n')[3])
                    if (o.split('\n')[2] > largestTime) largestTime = o.split('\n')[2]
                    if (o.split('\n')[1] < smallestTime) smallestTime = o.split('\n')[1]
                }
                // console.log(i)
                // console.log("Total_exec_time: " + totalExecTime)
                // console.log("Smallest_time: " + smallestTime)
                // console.log("Largest_time: " + largestTime)
                // console.log((largestTime - smallestTime))
                processingRuntime += parseFloat(largestTime - smallestTime)
                totalRuntime += parseFloat(largestTime - workingUploadTimes[i].split(' ')[0])
                uploadTime += parseFloat(workingUploadTimes[i].split(' ')[1] - workingUploadTimes[i].split(' ')[0])
                billingTime += parseFloat(totalExecTime)
                // console.log("Starting_Upload_time: " + workingUploadTimes[i].split(' ')[0])
                // console.log("Finishing_Upload_time: " + workingUploadTimes[i].split(' ')[1])
                // console.log((workingUploadTimes[i].split(' ')[1] - workingUploadTimes[i].split(' ')[0]))
                // console.log((largestTime - workingUploadTimes[i].split(' ')[0]))
                console.log((smallestTime - workingUploadTimes[i].split(' ')[1]))
            }
            // console.log(`${processingRuntime/10} ${totalRuntime/10} ${uploadTime/10} ${billingTime/10}`)
        }


        res.send("Analyzing results")
    },
    analyzeLocalResults: async (req, res) => {
        let vet = [1, 100, 500, 999]
        // let vet = []
        let singleUploadTimePath = "./uploadResultLocalSingle.txt"
        let singleUploadTimes = await fsPromises.readFile(singleUploadTimePath, { encoding: 'utf8' })
        singleUploadTimes = singleUploadTimes.split('\n')
        let batchUploadTimePath = "./uploadResultLocalBatch.txt"
        let batchUploadTimes = await fsPromises.readFile(batchUploadTimePath, { encoding: 'utf8' })
        batchUploadTimes = batchUploadTimes.split('\n')
        let j = 0

        for (qnt of vet) {
            let runTimeSum = 0
            let uploadSingleSum = 0
            let uploadBatchSum = 0
            console.log(qnt)
            for (i = 0; i < 10; i++) {
                let resultsData = []
                let dirPath = `./results/${qnt}/${i}/`
                const results = await fsPromises.readdir(dirPath)
                for (const file of results) {
                    const data = await fsPromises.readFile(dirPath + file, { encoding: 'utf8' })
                    resultsData.push(data)
                }
                let largestTime = 0
                let smallestTime = resultsData[0].split('\n')[1]
                for (o of resultsData) {
                    if (o.split('\n')[2] > largestTime) largestTime = o.split('\n')[2]
                    if (o.split('\n')[1] < smallestTime) smallestTime = o.split('\n')[1]
                }
                // console.log(i)
                // console.log("Smallest_time: " + smallestTime)
                // console.log("Largest_time: " + largestTime)
                console.log((largestTime - smallestTime))
                // runTimeSum += parseFloat(largestTime - smallestTime)
                // console.log(singleUploadTimes[i + j].split(' ')[1])
                // uploadSingleSum += parseFloat(singleUploadTimes[i + j].split(' ')[1])
                // console.log(batchUploadTimes[i + j].split(' ')[1])
                // uploadBatchSum += parseFloat(batchUploadTimes[i + j].split(' ')[1])
            }
            // runTimeSum /= 10
            // uploadSingleSum /= 10
            // uploadBatchSum /= 10
            // console.log(`${runTimeSum} ${uploadSingleSum} ${uploadBatchSum}`)

            j += 10
        }

        res.send("analyzing results")
    },

    createFolders: async (req, res) => {
        for (i = 0; i < 10; i++) {
            let dir1 = `/home/dotta/dev/upload-images-aws/results/999/${i}`
            // let dir2 = `/home/dotta/dev/upload-images-aws/results/500/batch/${i}`
            fs.mkdir(dir1, { recursive: true }, (err) => {
                if (err) console.log(err)
                else console.log("Deu certo")
            })

            // fs.mkdir(dir2, { recursive: true });

        }


        res.send("Creating folders")
    },

    getResults: async (req, res) => {
        const filePath = '/home/dotta/MEGA/Faculdade/TCC/Resultados_Local.txt'
        const data = await fsPromises.readFile(filePath, { encoding: 'utf8' })
        const splittedData = data.split('\n')
        for (o of splittedData) {
            let tmp = o.split(':')
            if (tmp.length > 1) {
                if(tmp[0] == 'Runtime') console.log(_.replace(tmp[1], '.', ','))
            }
        }
        // console.log(splittedData)
        res.send("Blah")
    }
}