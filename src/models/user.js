import mongoose, { Schema } from 'mongoose';
import * as plugins from './plugins';
import { email } from '../utils';
import bcrypt from 'bcrypt';
import ms from 'ms';

const saltRounds = 10;

const UserSchema = new Schema({
  firstName: { type: String, default: '', trim: true },
  lastName: { type: String, default: '', trim: true },
  login: {
    email: { type: String, unique: true, trim: true },
    password: { type: String, trim: true },
    newPassword: { type: String },  // When pre save, convert to password via bcrypt
    verified: { type: Boolean, default: false },
    verifiedDateTime: { type: Date, dafault: null },
    verifyCode: { type: String, default: '', trim: true },
    verifyExpires: { type: Date, dafault: null },
    lastLoginDateTime: { type: Date, dafault: null },
  },
});

UserSchema.plugin(plugins.createAndModify);
UserSchema.plugin(plugins.simplePropertyUpdate);
UserSchema.plugin(plugins.listUpdate);

UserSchema.pre('save', function (next) {
  if (!this.login.newPassword) return next();

  bcrypt.hash(this.login.newPassword, saltRounds, (err, password) => {
    this.login.password = password;
    this.login.newPassword = '';
    next();
  });
});

UserSchema.statics.get = function (address) {
  return this.findOne({ 'login.email': address });
};

UserSchema.statics.register = async function (data) {
  const user = await this.get(data.email);
  if (user) return 'emailAlreadyUsed';

  const verifyCode = email.generateVerifyCode();
  data.login = {
    email: data.email,
    newPassword: data.password,
    verifyCode,
    verifyExpires: new Date(Date.now() + ms('1day')),
  };
  await email.sendVerifyEmail(data.email, verifyCode);

  return (await this.create(data)).save();
};

UserSchema.statics.registerEmailCheck = async function (code) {
  const user = await this.findOne({ 'login.verifyCode': code });

  const currentDate = new Date();
  // invalid code?
  if (!user || user.login.verifyExpires < currentDate) return 'invalidCode';

  user.login.verified = true;
  user.login.verifiedDateTime = currentDate;
  return user.save();
};

UserSchema.statics.login = async function (address, password) {
  const user = await this.get(address);

  if (!user) return 'userNotFound';  // user not found?
  if (!user.login.verified) return 'emailNotVerify';  // email not verify?

  // invalid password?
  const passed = await new Promise(resolve =>
    bcrypt.compare(
      password,
      user.login.password,
      (err, pass) => resolve(pass),
    )
  );
  if (!passed) return 'invalidPassword';

  user.login.lastLoginDatetime = new Date();
  return user.save();
};

UserSchema.methods.updateInfo = function (data) {
  return this.updateSimpleProperty(data, {
    stringProp: ['firstName', 'lastName'],
  }, true);
};

UserSchema.methods.clearResponse = function () {
  return {
    _id: this._id.toString(),
    firstName: this.firstName,
    lastName: this.lastName,
    login: {
      email: this.login.email,
      verified: this.login.verified,
      verifiedDateTime: this.login.verifiedDateTime,
    },
  };
};

delete mongoose.models.User;
delete mongoose.modelSchemas.User;
mongoose.model('User', UserSchema);
