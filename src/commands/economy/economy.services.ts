import userRecord from '../../models/user.model';

class economyServices {
  static instance: economyServices;

  public static getInstance() {
    if (!economyServices.instance) {
      economyServices.instance = new economyServices();
    }

    return economyServices.instance;
  }

  async createUser(id: string) {
    const user = new userRecord({ id, balance: 0, nextDaily: new Date(0) });
    return await user.save();
  }

  async getUser(id: string) {
    return (await userRecord.findOne({ id })) ?? this.createUser(id);
  }
}

export default economyServices.getInstance();
