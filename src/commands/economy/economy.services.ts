import userRecord from '../../models/user.model';
import Lotto from '../../models/lotto.model';
import Guess from '../../models/lotto-guess.model';

class economyServices {
  static instance: economyServices;

  public static getInstance() {
    if (!economyServices.instance) {
      economyServices.instance = new economyServices();
    }

    return economyServices.instance;
  }

  async createUser(userId: string) {
    const user = new userRecord({ userId, balance: 0, nextDaily: new Date(0) });
    return await user.save();
  }

  async getUser(userId: string) {
    return (await userRecord.findOne({ userId })) ?? this.createUser(userId);
  }

  async getLotto(id?: string) {
    if (id) {
      const lotto = await Lotto.findById(id);
      return lotto;
    }

    return Lotto.findOne().sort({ createdAt: -1 });
  }

  async createLotto(endDate: Date) {
    const lotto = new Lotto({ endDate, done: false, guesses: [], users: [] });
    return await lotto.save();
  }

  async addGuess(lottoId: string, userId: string, nums: number[]) {
    // get lotto
    const lotto = await Lotto.findById(lottoId);

    if (!lotto) {
      throw '`Lotto not found`';
    }

    // check if user already made guess
    if (lotto.guesses.includes(userId)) {
      throw '`You already made a guess`';
    }

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
