import mongoose from 'mongoose';
import config from './config';

export async function initMongoose() {
  await mongoose
    .connect(config.dbURI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch(console.error);

  return mongoose;
}
