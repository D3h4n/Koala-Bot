import { Queue, Song } from "distube";
import config from "../../utils/config";
import Command from "../../utils/common.commands.config";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
} from "discord.js";
import { distube } from "../../index";

export default class queueCommand extends Command {
  constructor() {
    super("queue", "Display the song queue");

    this.addNumberOption((option) =>
      option.setName("page").setDescription("The page you want to start on")
    );
  }

  async action(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    const queue = distube.getQueue(interaction);

    if (!queue || !queue.songs?.length) {
      // check that the queue has songs
      interaction.editReply("`The queue is empty`");
      return;
    }

    try {
      const numPages = Math.ceil(
        queue.songs.length / config.queuePageLength,
      );
      let pageNumber = interaction.options.getNumber("page") || 1; // set pageNumber

      pageNumber = pageNumber < 1
        ? 1
        : pageNumber > numPages
        ? numPages
        : pageNumber;

      let components: ActionRowBuilder<ButtonBuilder>[] | undefined = undefined;

      if (numPages > 1) {
        components = [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId("left")
              .setStyle(ButtonStyle.Primary)
              .setLabel("back")
              .setEmoji("◀"),
            new ButtonBuilder()
              .setCustomId("right")
              .setStyle(ButtonStyle.Primary)
              .setLabel("next")
              .setEmoji("▶"),
          ),
        ];
      }

      // Reply with queue and add interactive buttons
      const sentMsg = (await interaction.editReply({
        embeds: [this.generateResponse(queue, pageNumber)],
        components,
      })) as Message;

      if (numPages <= 1) return;

      // add reaction collector for message
      const collector = sentMsg.createMessageComponentCollector({
        // filter reactions to ignore bot reactions and other reactions
        filter: (i) =>
          (i.customId === "left" || i.customId === "right") && !i.user.bot,
        // set the time limit
        time: config.queueTimeLimit,
      });

      // TODO: Figure out disabling buttons
      collector
        .on("collect", async ({ customId }) => {
          switch (customId) {
            case "left":
              if (pageNumber > 1) {
                pageNumber--;
              }
              break;

            case "right":
              if (pageNumber < numPages) {
                pageNumber++;
              }
              break;

            default:
              console.error("Invalid button id");
          }

          // update queue and buttons
          sentMsg.edit({
            embeds: [this.generateResponse(queue, pageNumber)],
          });
        })
        .on("end", () => {
          // remove buttons
          sentMsg.edit({
            components: [],
          });
        });
    } catch (error) {
      console.error(error);
    }
  }

  generateResponse(queue: Queue, pageNumber: number): EmbedBuilder {
    const songs = queue.songs; // list of songs
    const numPages = Math.ceil(songs.length / config.queuePageLength); // number of pages

    const nowPlaying = songs[0]; // get the currently playing song

    // set the display for the currently playing song
    let description = `__Now Playing:__\n` +
      `[${nowPlaying.name}](${nowPlaying.url}) - ${nowPlaying.formattedDuration} - \`${nowPlaying.member?.displayName}\`\n\n`;

    if (songs.length > 1) {
      let startIndex = (pageNumber - 1) * config.queuePageLength; // starting index of songs on page

      // set startIndex to 0 if page number is too large
      if (startIndex > songs.length) {
        startIndex = 0;
      }

      // last index of songs on page
      const endIndex = Math.min(
        startIndex + config.queuePageLength,
        songs.length,
      );

      //  Add the display for all the songs on the page
      description += "__Up Next:__\n";
      songs
        // gets the up next songs on the page. If startIndex is 0 start at 1 instead
        .slice(startIndex || 1, endIndex)
        // generate display for each song
        .forEach((song, idx) => {
          description += `${(startIndex || 1) + idx}. ` +
            this.generateSongDescription(song) +
            "\n";
        });
    }

    // set up the embedded message
    const response = new EmbedBuilder({
      title: "Queue",
      description,
      footer: {
        text: `Page: ${pageNumber}/${numPages}` +
          "\u2800".repeat(30) +
          `${songs.length} ${
            songs.length === 1 ? "song" : "songs"
          } in Queue | Total Length: ${queue.formattedDuration}`,
      },
      color: config.mainColor,
    }).setThumbnail(nowPlaying.thumbnail ?? "");

    return response;
  }

  generateSongDescription(song: Song): string {
    return `[${song.name}](${song.url}) - ${song.formattedDuration} - \`${song.member?.displayName}\``;
  }
}
