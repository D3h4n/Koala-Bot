import { Guild } from 'discord.js';
import guildModel, { IGuild } from '../models/guild.model';

class GuildServices {
   private static instance: GuildServices;

   public static GetInstance() {
      if (!GuildServices.instance) {
         GuildServices.instance = new GuildServices();
         return GuildServices.instance;
      }

      return GuildServices.instance;
   }

   public async CreateGuild(guild: Guild) {
      const guildRecord = new guildModel({
         guildId: guild.id,
         guildName: guild.name,
      });

      return await guildRecord.save().catch(console.error);
   }

   public async GetGuild(guildId: string) {
      const guildRecord = await guildModel
         .findOne({ guildId })
         .catch(console.error);

      if (!guildRecord) {
         throw '`Guild not found`';
      }

      return guildRecord;
   }

   public async GetGuilds() {
      return await guildModel.find().sort({ createdAt: -1 });
   }

   public async UpdateGuild(guildInfo: IGuild) {
      const guildRecord = await this.GetGuild(guildInfo.guildId);

      for (let entry of Object.entries(guildInfo)) {
         guildRecord[entry[0]] = entry[1];
      }

      await guildRecord.save().catch(console.error);

      return guildRecord;
   }

   public async DeleteGuild(guildId: string) {
      const guildRecord = await this.GetGuild(guildId);

      await guildRecord.delete().catch((err: Error) => {
         throw err;
      });

      return guildId;
   }
}

export default GuildServices.GetInstance();
