import userRecord from '../models/user.model';
import Lotto from '../models/lotto.model';
import Guess from '../models/lotto-guess.model';
import { isValidObjectId } from 'mongoose';
import guildServices from './guild.services';

class economyServices {
  static instance: economyServices;

  public static getInstance() {
    if (!economyServices.instance) {
      economyServices.instance = new economyServices();
    }

    return economyServices.instance;
  }

  async createUser(discordId: string, username: string) {
    const user = new userRecord({
      username,
      discordId,
      balance: 1000,
      nextDaily: new Date(0),
    });
    return await user.save();
  }

  async getUserById(id: string) {
    return await userRecord.findById(id);
  }

  async getUserByDiscord(discordId: string) {
    return await userRecord.findOne({ discordId });
  }

  async getLotto(id?: string, guildId?: string) {
    if (id && isValidObjectId(id)) {
      const lotto = await Lotto.findById(id);
      return lotto;
    }

    if (guildId) {
      const lotto = await Lotto.findOne({ guildId }).sort({ createdAt: -1 });
      return lotto;
    }

    return Lotto.findOne().sort({ createdAt: -1 });
  }

  async createLotto(guildId: string, endDate: Date) {
    const lotto = new Lotto({
      guildId,
      endDate,
      done: false,
      guesses: [],
      users: [],
    });
    return await lotto.save();
  }

  async addGuess(lottoId: string, userId: string, nums: number[]) {
    // get lotto
    const lotto = await Lotto.findById(lottoId);

    if (!lotto) {
      throw '`Lotto not found`';
    }

    const guild = await guildServices.GetGuild(lotto.guildId);

    if (!guild.runLotto) {
      throw '`Lottos are not running`';
    }
    // check if user already made guess
    if (lotto.users.includes(userId)) {
      throw '`You already made a guess`';
    }

    let numMap = new Map<number, null>();

    nums.forEach((num) => {
      if (numMap.has(num)) {
        throw '`Numbers cannot be repeated`';
      }

      if (num > 30) {
        throw '`Number cannot be greater than 30`';
      }

      if (num < 1) {
        throw '`Number cannot be less than 1`';
      }

      numMap.set(num, null);
    });

    const guess = new Guess({ lottoId, userId, guess: nums });

    lotto.guesses.push(guess.id);
    lotto.users.push(userId);

    guess.save().catch(console.error);
    lotto.save().catch(console.error);

    return guess;
  }

  async getGuesses(lottoId: string) {
    const lotto = await Lotto.findById(lottoId);

    return await Guess.find({ lottoId: lotto?.id });
  }
}

export default economyServices.getInstance();
