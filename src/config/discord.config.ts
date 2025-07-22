import dotenv from "dotenv";

dotenv.config();

const config = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN || "",
  DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID || "",
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "",
  DISCORD_ALLOWED_USER_IDS: (process.env.DISCORD_ALLOWED_USER_IDS || "").split(",").map(id => id.trim()),
};

export default config;