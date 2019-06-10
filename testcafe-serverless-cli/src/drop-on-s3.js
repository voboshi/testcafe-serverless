import S3 from 'aws-sdk/clients/s3'

import retry from './retry'

const dropOnS3 = async ({ region, bucketName, fileKey }) => {
  const s3 = new S3({ region })
  console.log(`dropping file on S3 "${bucketName}/${fileKey}" started`)
  try {
    await s3
      .deleteObject({
        Bucket: bucketName,
        Key: fileKey
      })
      .promise()
  } catch (error) {
    console.log(
      `dropping file on S3 "${bucketName}/${fileKey}" failed ${error.message}`
    )
    throw error
  }

  console.log(`dropping file on S3 "${bucketName}/${fileKey}" succeeded`)
}

export default retry(dropOnS3, { count: 5, delay: 1000 })
