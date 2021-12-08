import mongoose from 'mongoose';

export interface IUser {
   username: string;
   discordId: string;
   balance: number;
   nextDaily: Date;
}

const userSchema = new mongoose.Schema(
   {
      username: {
         type: String,
         required: true,
      },
      discordId: {
         type: String,
         required: true,
      },
      balance: {
         type: Number,
         required: true,
      },
      nextDaily: {
         type: Date,
         required: true,
      },
   },
   { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
