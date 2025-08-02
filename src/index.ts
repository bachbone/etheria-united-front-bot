import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import path from "path";
import fs from "fs";

import DISCORD_CONFIG from "@/config/discord.config";
import {
  DiscordClientWithCommands,
  DiscordCommand,
  DiscordEvent,
} from "@/types/discord.types";
import { DISCORD_BOT_NAME } from "@/constants/discord.constants";
import { COMMANDS_PATH, EVENTS_PATH } from "@/constants/paths.constants";

import GoogleSheetsServices from "@/services/google-sheets.services";

const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember,
  ],
}) as DiscordClientWithCommands;

// add a commands property to the discordClient
discordClient.commands = new Collection<string, DiscordCommand>();

const commandFiles = fs
  .readdirSync(COMMANDS_PATH)
  .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

console.log(`Loading ${commandFiles.length} commands...`);

for (const file of commandFiles) {
  const filePath = path.join(COMMANDS_PATH, file);
  const command: DiscordCommand = require(filePath).default;

  if (command.disabled) {
    console.warn(`Command ${command.name} is disabled and will not be loaded.`);
    continue;
  }

  console.log(`Loading command: ${command.name}`);

  discordClient.commands.set(command.name, command);
}

const eventFiles = fs
  .readdirSync(EVENTS_PATH)
  .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

console.log(`Loading ${eventFiles.length} events...`);

for (const file of eventFiles) {
  const filePath = path.join(EVENTS_PATH, file);
  const event: DiscordEvent = require(filePath).default;

  console.log(`Loading event: ${event.name}`);

  if (event.once) {
    discordClient.once(event.name, (...args) => event.execute(...args));
  } else {
    discordClient.on(event.name, (...args) => event.execute(...args));
  }
}

const start = async () => {
  try {
    await GoogleSheetsServices.getClient();

    console.log("Google Sheets Client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Google Sheets client:", error);
  }

  try {
    await discordClient.login(DISCORD_CONFIG.DISCORD_TOKEN);
    console.log(`${DISCORD_BOT_NAME} is online!`);
  } catch (error) {
    console.error("Failed to login to Discord:", error);
  }
}

start().catch((error) => {
  console.error("An error occurred during startup:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

export default start;
