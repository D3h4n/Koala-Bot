import mongoose from 'mongoose';
import config from './config';

export default async function initMongoose() {
  return await mongoose
    .connect(config.dbURI!, {
      user: config.dbUser,
      pass: config.dbPass,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
}
