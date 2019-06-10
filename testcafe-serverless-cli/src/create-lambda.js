import Lambda from 'aws-sdk/clients/lambda'

import retry from './retry'
import createRole from './create-role'

const createFunction = async ({
  functionName,
  bucketName,
  fileKey,
  region,
  policyContent,
  memorySize
}) => {
  console.log(`create function "${functionName}" started`)

  const lambda = new Lambda({ region })

  const roleArn = await createRole({
    region,
    roleName: `${functionName}-role`,
    roleService: 'lambda.amazonaws.com',
    policyName: `${functionName}-policy`,
    policyContent
  })

  try {
    await lambda
      .updateFunctionConfiguration({
        FunctionName: functionName,
        Handler: 'index.handler',
        Role: roleArn,
        Runtime: 'nodejs8.10',
        Timeout: 60 * 15,
        MemorySize: memorySize
      })
      .promise()
  } catch (error) {
    if (error.code !== 'ResourceNotFoundException') {
      console.error(
        `create function "${functionName}" failed on lambda.updateFunctionConfiguration`
      )
      throw error
    }
  }

  try {
    await lambda
      .updateFunctionCode({
        FunctionName: functionName,
        Publish: true,
        S3Bucket: bucketName,
        S3Key: fileKey
      })
      .promise()
  } catch (error) {
    if (error.code !== 'ResourceNotFoundException') {
      console.error(
        `create function "${functionName}" failed on lambda.updateFunctionCode`
      )
      throw error
    }
  }

  try {
    await lambda
      .createFunction({
        FunctionName: functionName,
        Handler: 'index.handler',
        Role: roleArn,
        Runtime: 'nodejs8.10',
        Code: {
          S3Bucket: bucketName,
          S3Key: fileKey
        },
        Timeout: 60 * 15,
        MemorySize: memorySize
      })
      .promise()
  } catch (error) {
    if (error.code !== 'ResourceConflictException') {
      throw error
    }
  }

  try {
    const lambdaFunction = await lambda
      .getFunction({
        FunctionName: functionName
      })
      .promise()

    console.log(`create function "${functionName}" succeeded`)

    return lambdaFunction
  } catch (error) {
    console.error(`create/update function "${functionName}" failed`)
    throw error
  }
}

export default retry(createFunction, { count: 5, delay: 3000 })
