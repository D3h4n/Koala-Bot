import Command from "../../utils/common.commands.config";
import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { distube } from "../../index";

export default class joinCommand extends Command {
  constructor() {
    super("join", "Add bot to voice channel");
  }

  async action(interaction: ChatInputCommandInteraction): Promise<void> {
    // get voice channel of member
    const channel = (interaction.member as GuildMember)?.voice.channel;

    if (channel?.joinable) {
      try {
        distube.voices.join(channel);

        interaction.reply(`Joined channel ${channel.name}`);
      } catch (error) {
        interaction.reply("`Error joining voice channel`");
        console.error(error);
      }
    }
  }
}
