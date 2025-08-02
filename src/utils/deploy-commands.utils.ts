import dotenv from "dotenv";
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import path from "path";
import fs from "fs";
import { COMMANDS_PATH } from "@/constants/paths.constants";
import { DiscordCommand } from "@/types/discord.types";

dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

const deployCommands = async () => {
  if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !DISCORD_GUILD_ID) {
    throw new Error(
      "Missing required environment variables for command deployment.",
    );
  }

  // sonarqube ignore next
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  const commandFiles = fs
    .readdirSync(COMMANDS_PATH)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(COMMANDS_PATH, file);
    const command: DiscordCommand = require(filePath).default;

    if (!command.data || !command.execute) {
      console.warn(`Command in ${file} does not have data property.`);
      continue;
    }

    if (command.disabled) {
      console.warn(`Command ${command.name} is disabled and will not be deployed.`);
      continue;
    }

    console.log(`Loading command: ${command.name}`);

    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
      { body: commands },
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Error deploying commands:", error);
  }
};

deployCommands()
  .then(() => {
    console.log("Commands deployed successfully!");
  })
  .catch((error) => {
    console.error("Error deploying commands:", error);
  });
