import mongoose from 'mongoose';
import { db } from '../src/configs';

mongoose.connect(`mongodb://${db.host}:${db.port}/${db.name}`);
mongoose.connection.on('error', err => { throw err; });
