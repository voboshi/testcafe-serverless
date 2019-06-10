import fs from 'fs'
import path from 'path'
import S3 from 'aws-sdk/clients/s3'

const downloadFromS3 = ({ region, bucketName, fileKey }) => {
  return new Promise((resolve, reject) => {
    const s3 = new S3({ region })

    const tmpFileName = path.join(
      '/tmp',
      `${bucketName}-${fileKey}-${Date.now()}`
    )

    const output = fs.createWriteStream(tmpFileName)

    const fileStream = s3
      .getObject({
        Bucket: bucketName,
        Key: fileKey
      })
      .createReadStream()

    fileStream.on('end', resolve.bind(null, tmpFileName))
    fileStream.on('close', resolve.bind(null, tmpFileName))
    fileStream.on('error', reject)

    fileStream.pipe(output)
  })
}

export default downloadFromS3
