import mongoose from 'mongoose';

export interface IUser {
  userId: string;
  balance: number;
  nextDaily: Date;
}

const userSchema = new mongoose.Schema(
  {
    userId: {
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
