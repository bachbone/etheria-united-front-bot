import {
  ChatInputCommandInteraction,
  Client,
  Collection,
  SlashCommandBuilder,
} from "discord.js";

export interface DiscordEvent {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => void | Promise<void>;
}

export interface DiscordCommand {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface DiscordClientWithCommands extends Client {
  commands: Collection<string, DiscordCommand>;
}
