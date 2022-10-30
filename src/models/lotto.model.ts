import { model, Schema } from "mongoose";

export interface ILotto {
  guildId: string;
  endDate: Date;
  guesses: string[];
  users: string[];
  done: boolean;
}

const lottoSchema = new Schema(
  {
    guildId: {
      type: String,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    guesses: {
      type: [String],
      required: true,
    },
    users: {
      type: [String],
      required: true,
    },
    done: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
);

export default model<ILotto>("Lotto", lottoSchema);
