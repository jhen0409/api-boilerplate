import mongoose from 'mongoose';
import { returnCode, res } from '../utils';

export const mustLogin = () => async (ctx, next) => {
  if (!ctx.session.user) {
    res.err(returnCode.err.mustLogin);
  }
  const User = mongoose.model('User');
  ctx.user = await User.findById(ctx.session.user._id);
  if (!ctx.user) {
    res.err(returnCode.err.invalidUser);
  }
  return next();
};
