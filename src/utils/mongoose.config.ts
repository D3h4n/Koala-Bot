import mongoose from 'mongoose';
import config from './config';

export default async function initMongoose(): Promise<void> {
   if (!config.dbURI) {
      console.error('ERROR: no mongoDB URI found');
      return;
   }

   const options = {
      user: config.dbUser,
      pass: config.dbPass,
      useNewUrlParser: true,
      useUnifiedTopology: true,
   };

   mongoose.connect(config.dbURI, options).catch((error) => {
      console.error(error);
      return null;
   });
}
