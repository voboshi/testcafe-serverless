import AWS from 'aws-sdk'

const awsLogin = async () => {
  var accountId
  var credentials = new AWS.SharedIniFileCredentials({
    profile: process.env.AWS_PROFILE,
  })

  AWS.config.credentials = credentials

  AWS.config.update({
    httpOptions: { timeout: 300000 },
  })

  var sts = new AWS.STS()

  sts.getCallerIdentity({}, function (err, data) {
    if (err) {
      console.log('Error getting caller identity from STS: ', err)
    } else {
      accountId = JSON.stringify(data.Account)
    }
  })

  return accountId
}

export default awsLogin
