export const err = {
  // -999: Undefined error
  undefine: { code: -999, message: 'undefined error' },

  // -1xx: general errors
  schemaNotMatch: { code: -100, message: 'schema not match' },

  // -2xx: user group errors
  invalidUser: { code: -200, message: 'invalid user' },
  invalidCode: { code: -201, message: 'invalid code' },
  emailAlreadyUsed: { code: -202, message: 'email already used' },
  mustLogin: { code: -203, message: 'must login' },
  userNotFound: { code: -204, message: 'user not found' },
  emailNotVerify: { code: -205, message: 'email not verify' },
  invalidPassword: { code: -206, message: 'invalid password' },

};

export const valid = {
  success: { code: 0, message: 'success' },
};
