import mongoose from 'mongoose';

export interface IUser {
  id: string;
  balance: number;
}

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
