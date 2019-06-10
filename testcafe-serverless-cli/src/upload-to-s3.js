import fs from 'fs'
import S3 from 'aws-sdk/clients/s3'

import retry from './retry'

const uploadAssetToS3 = async ({ file, region, bucketName, fileKey }) => {
  console.log(
    `uploading file "${file}" to S3 as "${bucketName}/${fileKey}" started`
  )

  const s3 = new S3({ region })

  const stream = fs.createReadStream(file)

  const S3ItemOptions = {
    ACL: 'public-read',
    Bucket: bucketName,
    Key: fileKey
  }

  try {
    await s3
      .upload({
        ...S3ItemOptions,
        Body: stream,
        ContentType: 'application/octet-stream'
      })
      .promise()
  } catch (error) {
    console.log(
      `uploading file "${file}" to S3 as "${bucketName}/${fileKey}" failed ${error.message}`
    )
    throw error
  }

  console.log(
    `uploading file "${file}" to S3 as "${bucketName}/${fileKey}" succeeded`
  )

  return S3ItemOptions
}

export default retry(uploadAssetToS3, { count: 5, delay: 1000 })
