import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

import GOOGLE_SHEETS_CONFIG from "@/config/google-sheets.config";
import GoogleSheetsServices from "@/services/google-sheets.services";
import { DiscordCommand } from "@/types/discord.types";
import MESSAGES from "@/constants/messages.constants";

class StartUFRecording implements DiscordCommand {
  public name = "start-uf-recording";
  public description = "Creates a new UF sheet for the current week (Monday)";
  public disabled = true;

  public data: SlashCommandBuilder;

  constructor() {
    this.data = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }

  public async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const { success, errorMessage } = await GoogleSheetsServices.createUFSheet(
      GOOGLE_SHEETS_CONFIG.GOOGLE_SPREADSHEET_ID,
    );

    if (!success && errorMessage) {
      await interaction.editReply(errorMessage);
      return;
    }

    await interaction.editReply(MESSAGES.SUCCESS_START_UF_RECORDING);
  }
}

export default new StartUFRecording();
