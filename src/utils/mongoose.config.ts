import mongoose from 'mongoose';
import config from './config';

export default async function initMongoose(): Promise<void> {
   if (!config.dbURI) {
      console.error('ERROR: no mongoDB URI found');
      return;
   }

   mongoose
      .connect(config.dbURI, {
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
