import path from 'path'
import fs from 'fs'

import uploadToS3 from './upload-to-s3'
import archiveDir from './archive-dir'
import invokeLambda from './invoke-lambda'

const bucketName = 'testcafe-serverless-bucket'

const testcafeLauncherName = 'testcafe-launcher-lambda'
const testcafeBuilderName = 'testcafe-builder-lambda'

const run = async ({
  region,
  accountId,
  testcafeDir,
  concurrency,
  testPattern,
  skipJsErrors,
  skipUncaughtErrors,
  selectorTimeout,
  assertionTimeout,
  pageLoadTimeout,
  speed,
  stopOnFirstFail
}) => {
  const testcafeArchive = path.join(process.cwd(), `archive-${Date.now()}.zip`)

  await archiveDir({
    inputDirectory: testcafeDir,
    outputArchive: testcafeArchive
  })

  const testcafeArchiveKey = `testcafe-app-${Date.now()}-${Math.floor(
    Math.random() * 1000000000000
  )}`

  await uploadToS3({
    file: testcafeArchive,
    region,
    bucketName,
    fileKey: testcafeArchiveKey
  })

  fs.unlinkSync(testcafeArchive)

  console.log(`Uploaded to key "${testcafeArchiveKey}"`)

  console.log('Installing started')

  const [builtStatus, builtResult] = await invokeLambda({
    region,
    lambdaArn: `arn:aws:lambda:${region}:${accountId}:function:${testcafeBuilderName}`,
    payload: {
      fileKey: testcafeArchiveKey,
      region
    }
  })

  if (builtStatus !== 'ok') {
    throw new Error(
      `Build testcafe app failed: ${JSON.stringify(builtResult, null, 2)}`
    )
  }

  const { outputFileKey: builtFileKey, installLog } = builtResult

  console.log(installLog)

  console.log('Installing succeeded')

  console.log(`Installed app saved at key "${builtFileKey}"`)

  console.log('Testcafe started')

  const [testcafeStatus, testcafeResult] = await invokeLambda({
    region,
    lambdaArn: `arn:aws:lambda:${region}:${accountId}:function:${testcafeLauncherName}`,
    payload: {
      fileKey: builtFileKey,
      concurrency,
      region,
      accountId,
      testPattern,
      skipJsErrors,
      skipUncaughtErrors,
      selectorTimeout,
      assertionTimeout,
      pageLoadTimeout,
      speed,
      stopOnFirstFail
    }
  })

  if (testcafeStatus !== 'ok') {
    throw new Error(
      `Run testcafe app failed: ${JSON.stringify(testcafeResult, null, 2)}`
    )
  }

  console.log('Testcafe succeeded')

  console.log(JSON.stringify(testcafeResult, null, 2))
}

export default run
