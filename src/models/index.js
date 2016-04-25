import mongoose from 'mongoose';
import { db } from '../configs';

mongoose.connect(`mongodb://${db.host}:${db.port}/${db.name}`);

mongoose.connection.on('error', (err) =>
  console.error('MongoDB Connection Error: ', err)
);

import './user';
