import { Schema, model } from 'mongoose';

export interface IWinner {
  userId: string;
  earnings: number;
}

export interface ILotto {
  endDate: Date;
  guesses: string[];
  done: boolean;
  winners: IWinner[];
}

const lottoSchema = new Schema(
  {
    endDate: {
      type: Date,
      required: true,
    },
    guesses: {
      type: [String],
      required: true,
    },
    done: {
      type: Boolean,
      required: true,
    },
    winners: {
      type: [
        {
          userId: String,
          earnings: Number,
        },
      ],
      required: false,
    },
  },
  { timestamps: true }
);

export default model<ILotto>('Lotto', lottoSchema);
