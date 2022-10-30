import { model, Schema } from "mongoose";

export interface IGuess {
  userId: string;
  lottoId: string;
  guess: number[];
}

const lottoGuessSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  lottoId: {
    type: String,
    required: true,
  },
  guess: {
    type: [Number],
    required: true,
  },
});

export default model<IGuess>("LottoGuess", lottoGuessSchema);
