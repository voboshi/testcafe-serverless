import Lambda from 'aws-sdk/clients/lambda'

import retry from './retry'

const invokeLambda = async ({ region, lambdaArn, payload }) => {
  const lambda = new Lambda({ region })

  const { Payload, FunctionError } = await lambda
    .invoke({
      InvocationType: 'RequestResponse',
      FunctionName: lambdaArn,
      Payload: JSON.stringify(payload)
    })
    .promise()

  if (FunctionError != null) {
    const error = JSON.parse(Payload.toString())
    return ['error', error]
  }

  return ['ok', JSON.parse(Payload.toString())]
}

export default retry(invokeLambda, { count: 10, delay: 1000 })
