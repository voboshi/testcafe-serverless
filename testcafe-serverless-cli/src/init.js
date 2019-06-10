import path from 'path'

import createS3Bucket from './create-s3-bucket'
import uploadToS3 from './upload-to-s3'
import createLambda from './create-lambda'
import dropOnS3 from './drop-on-s3'

const bucketName = 'testcafe-serverless-bucket'

const testcafeLauncherName = 'testcafe-launcher-lambda'
const testcafeWorkerName = 'testcafe-worker-lambda'
const testcafeBuilderName = 'testcafe-builder-lambda'

const testcafeLauncherFile = path.join(
  __dirname,
  '..',
  'lambdas',
  'testcafe-launcher-lambda.zip'
)
const testcafeWorkerFile = path.join(
  __dirname,
  '..',
  'lambdas',
  'testcafe-worker-lambda.zip'
)
const testcafeBuilderFile = path.join(
  __dirname,
  '..',
  'lambdas',
  'testcafe-builder-lambda.zip'
)

const getPolicyContent = ({ region, accountId, lambdaName }) => [
  {
    Effect: 'Allow',
    Action: ['lambda:InvokeFunction', 'lambda:InvokeAsync'],
    Resource: `arn:aws:lambda:${region}:${accountId}:function:${testcafeWorkerName}`
  },
  {
    Effect: 'Allow',
    Action: ['s3:*'],
    Resource: `arn:aws:s3:::${bucketName}/*`
  },
  {
    Effect: 'Allow',
    Action: ['logs:PutLogEvents', 'logs:CreateLogStream'],
    Resource: [
      `arn:aws:logs:${region}:${accountId}:log-group:/aws/lambda/${lambdaName}`,
      `arn:aws:logs:${region}:${accountId}:log-group:/aws/lambda/${lambdaName}:*`
    ]
  },
  {
    Effect: 'Allow',
    Action: 'logs:CreateLogGroup',
    Resource: `arn:aws:logs:${region}:${accountId}:log-group:/aws/lambda/*`
  }
]

const init = async ({ region, accountId }) => {
  await createS3Bucket({ region, bucketName })

  await Promise.all([
    uploadToS3({
      file: testcafeLauncherFile,
      region,
      bucketName,
      fileKey: testcafeLauncherName
    }),
    uploadToS3({
      file: testcafeWorkerFile,
      region,
      bucketName,
      fileKey: testcafeWorkerName
    }),
    uploadToS3({
      file: testcafeBuilderFile,
      region,
      bucketName,
      fileKey: testcafeBuilderName
    })
  ])

  await Promise.all([
    createLambda({
      functionName: testcafeLauncherName,
      bucketName,
      fileKey: testcafeLauncherName,
      region,
      policyContent: getPolicyContent({
        region,
        accountId,
        lambdaName: testcafeLauncherName
      }),
      memorySize: 128
    }),
    createLambda({
      functionName: testcafeWorkerName,
      bucketName,
      fileKey: testcafeWorkerName,
      region,
      policyContent: getPolicyContent({
        region,
        accountId,
        lambdaName: testcafeWorkerName
      }),
      memorySize: 1600
    }),
    createLambda({
      functionName: testcafeBuilderName,
      bucketName,
      fileKey: testcafeBuilderName,
      region,
      policyContent: getPolicyContent({
        region,
        accountId,
        lambdaName: testcafeBuilderName
      }),
      memorySize: 1600
    })
  ])

  await Promise.all([
    dropOnS3({
      region,
      bucketName,
      fileKey: testcafeLauncherName
    }),
    dropOnS3({
      region,
      bucketName,
      fileKey: testcafeWorkerName
    }),
    dropOnS3({
      region,
      bucketName,
      fileKey: testcafeBuilderName
    })
  ])
}

export default init
