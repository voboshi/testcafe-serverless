import S3 from 'aws-sdk/clients/s3'

import retry from './retry'

const createS3Bucket = async ({ region, bucketName }) => {
  const s3 = new S3({ region })

  return await s3
    .createBucket({
      Bucket: bucketName,
      ACL: 'public-read'
    })
    .promise()
}

export default retry(createS3Bucket, { count: 5, delay: 1000 })
