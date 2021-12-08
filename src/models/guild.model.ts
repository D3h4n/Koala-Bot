import { Schema, model } from 'mongoose';

export interface IGuild {
   guildId: string;
   guildName?: string;
   runLotto?: boolean;
   lottoChannelId?: string;
   lottoFrequency?: number;
   runPostureCheck?: boolean;
   postureCheckChannelId?: string;
   postureCheckMessage?: string | null;
   postureCheckFrequency?: number;
}

const guildSchema = new Schema({
   guildId: {
      type: String,
      required: true,
   },
   guildName: {
      type: String,
      required: false,
   },
   runLotto: {
      type: Boolean,
      required: false,
      default: false,
   },
   lottoChannelId: {
      type: String,
      required: false,
   },
   lottoFrequency: {
      type: Number,
      required: true,
      default: 7.2e6,
   },
   runPostureCheck: {
      type: Boolean,
      required: false,
      default: false,
   },
   postureCheckChannelId: {
      type: String,
      required: false,
   },
   postureCheckMessage: {
      type: String,
      required: false,
      default: '‼ WEEE WOOO WEE WOO POSTURE CHECK ‼',
   },
   postureCheckFrequency: {
      type: Number,
      required: true,
      default: 3.6e6,
   },
});

export default model<IGuild>('Guild', guildSchema);
