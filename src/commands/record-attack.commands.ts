import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import { format } from "date-fns";

import GOOGLE_SHEETS_CONFIG from "@/config/google-sheets.config";
import GoogleSheetsServices from "@/services/google-sheets.services";
import { DiscordCommand } from "@/types/discord.types";
import { RowData } from "@/types/google-sheets.types";
import { collectorFilter } from "@/utils/discord.utils";

import MESSAGES from "@/constants/messages.constants";
import { DATE_WITH_TIME_FORMAT } from "@/constants/date-formats.constants";

class RecordAttackCommand implements DiscordCommand {
  public name = "record-attack";
  public description = "Records an attack attempt in the current UF sheet";
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

    // add button for 1 - 5 attempts
    const attemptsRow = new ActionRowBuilder<ButtonBuilder>();

    new Array(5).fill(null).forEach((_, index) => {
      const button = new ButtonBuilder()
        .setCustomId(`attempt_${index + 1}`)
        .setLabel(`${index + 1} Attempt${index > 0 ? "s" : ""}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);
      attemptsRow.addComponents(button);
    });

    const response = await interaction.reply({
      content: MESSAGES.ATTEMPTS_COUNT_MESSAGE,
      components: [attemptsRow],
      withResponse: true,
      flags: MessageFlags.Ephemeral,
    });

    if (!response?.resource?.message) {
      await interaction.editReply({
        content: MESSAGES.FAILED_CONFIRMATION_MESSAGE,
        components: [],
      });
      return;
    }


    let confirmation;

    try {
      confirmation = await response?.resource?.message.awaitMessageComponent({
        filter: collectorFilter(interaction),
        time: 60_000,
      });
      if (!confirmation) {
        await interaction.editReply({
          content: MESSAGES.CANCELLED_CONFIRMATION_MESSAGE,
          components: [],
        });
        return;
      }
    } catch {
      await interaction.editReply({
        content: MESSAGES.FAILED_CONFIRMATION_MESSAGE,
        components: [],
      });
      return;
    }

    try {
      const attempts = parseInt(confirmation.customId.split("_")[1], 10);
      
      const guildMember = interaction.guild?.members.cache.get(
        interaction.user.id,
      );

      const payload: RowData = {
        name: guildMember?.displayName || interaction.user.username,
        attempts,
        date: format(new Date(), DATE_WITH_TIME_FORMAT),
      };

      const spreadsheet = await GoogleSheetsServices.getSpreadsheet(
        GOOGLE_SHEETS_CONFIG.GOOGLE_SPREADSHEET_ID,
      );

      const { success, errorMessage } = await GoogleSheetsServices.createUFAttackRecord(
        spreadsheet,
        payload,
      );

      if (!success) {
        await interaction.editReply({
          content: errorMessage || MESSAGES.FAILED_CONFIRMATION_MESSAGE,
          components: [],
        });
        return;
      }

      await interaction.editReply({
        content: MESSAGES.SUCCESS_CONFIRMATION_MESSAGE,
        components: [],
      });

    } catch {
      await interaction.editReply({
        content: MESSAGES.FAILED_CONFIRMATION_MESSAGE,
        components: [],
      });
      return;
    }
  }
}

export default new RecordAttackCommand();
