import AWS from 'aws-sdk'

const awsLogin = async ({ accessKeyId, secretAccessKey }) => {
  if (accessKeyId == null || secretAccessKey == null) {
    throw new Error(`Parameters "accessKeyId" and "secretAccessKey" required`)
  }

  AWS.config.update({
    credentials: {
      accessKeyId,
      secretAccessKey
    },
    httpOptions: { timeout: 300000 }
  })

  const iam = new AWS.IAM()

  const accountId = await iam
    .getUser({})
    .promise()
    .then(({ User: { Arn } }) => Arn.split(':')[4])

  return accountId
}

export default awsLogin
