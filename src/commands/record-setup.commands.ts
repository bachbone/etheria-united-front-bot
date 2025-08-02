import { ANIMUS_NAMES } from "@/constants/etheria-restart.constants";
import { DiscordCommand } from "@/types/discord.types";
import axios from "axios";
import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";

class RecordSetupCommands implements DiscordCommand {
  public name = "record-setup";
  public description = "Records a character's setup in the current UF sheet";
  public disabled = true;

  public data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;

  constructor() {

    const characterChoices = ANIMUS_NAMES.map((name) => ({
      name,
      value: name,
    }));

    this.data = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) =>
        option
          .setName("character")
          .setDescription("Name of the character to record")
          .setRequired(true)
          .addChoices(characterChoices)
      )
      .addAttachmentOption((option) =>
        option
          .setName("image")
          .setDescription("Image of the character's setup")
          .setRequired(true)
      )
  }

  public async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply({  flags: MessageFlags.Ephemeral });

    const imageAttachment = interaction.options.getAttachment('image');

    if (!imageAttachment?.contentType) {
      await interaction.editReply('Please upload a valid image file.');
      return;
    }

    if (!imageAttachment.contentType.startsWith('image/')) {
      await interaction.editReply('Please upload a valid image file.');
    }

    try {
      const response = await axios.get(imageAttachment.url, { responseType: 'arraybuffer' });

      const imageBuffer = Buffer.from(response.data);

      await interaction.editReply({
          content: `Received image: \`${imageAttachment.name}\`. It has been successfully downloaded for processing.`,
          files: [{ attachment: imageBuffer, name: `processed_${imageAttachment.name}` }]
      });
    }
    catch (error) {
      console.error('Error processing the image:', error);
      await interaction.editReply('There was an error processing the image.');
      return;
    }
  }
}
export default new RecordSetupCommands();