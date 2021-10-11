import IAM from 'aws-sdk/clients/iam'

import { temporaryErrors } from './constants'

const createRole = async ({
  region,
  roleName,
  roleService,
  policyName,
  policyContent
}) => {
  const iam = new IAM({ region })

  let isRoleCreated = false

  console.log(`create role "${roleName}" started`)
  while (true) {
    try {
      const assumeRolePolicyDocument = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: roleService
            },
            Action: 'sts:AssumeRole'
          }
        ]
      }

      try {
        await iam
          .updateAssumeRolePolicy({
            RoleName: roleName,
            PolicyDocument: JSON.stringify(assumeRolePolicyDocument)
          })
          .promise()

        isRoleCreated = true
      } catch (error) {
        if (error.code !== 'NoSuchEntity') {
          console.error(
            `create role "${roleName}" failed on iam.updateAssumeRolePolicy`
          )
          throw error
        }
      }

      try {
        await iam
          .createRole({
            RoleName: roleName,
            AssumeRolePolicyDocument: JSON.stringify(assumeRolePolicyDocument)
          })
          .promise()

        isRoleCreated = true
      } catch (error) {
        if (error.code !== 'EntityAlreadyExists') {
          console.error(`create role "${roleName}" failed on iam.createRole`)
          throw error
        }
      }

      console.log(`create role "${roleName}" succeeded`)

      console.log(`put role policy "${roleName}" / "${policyName}" started`)

      try {
        await iam
          .putRolePolicy({
            RoleName: roleName,
            PolicyName: policyName,
            PolicyDocument: JSON.stringify({
              Version: '2012-10-17',
              Statement: policyContent
            })
          })
          .promise()
      } catch (error) {
        console.error(`put role policy "${roleName}" / "${policyName}" failed`)
        throw error
      }

      console.log(`put role policy "${roleName}" / "${policyName}" succeeded`)
    } catch (error) {
      if (temporaryErrors.includes(error.code)) {
        continue
      }

      throw error
    }

    break
  }

  if (!isRoleCreated) {
    console.error(`create role "${roleName}" failed`)
    throw new Error(`create role "${roleName}" failed`)
  }

  while (true) {
    try {
      const { Role } = await iam
        .getRole({
          RoleName: roleName
        })
        .promise()

      return Role.Arn
    } catch (error) {}
  }
}

export default createRole
