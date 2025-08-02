import { Events, GuildMember } from "discord.js";
import { DiscordEvent } from "@/types/discord.types";

import discordConfig from "@/config/discord.config";

class GuildMemberAdd implements DiscordEvent {
  public name = Events.GuildMemberAdd;
  public once = false;

  public async execute(member: GuildMember) {
    if (!member.guild.available) return;

    const visitorRole = member.guild.roles.cache.get(discordConfig.DISCORD_VISITOR_ROLE_ID);

    if (!visitorRole) {
      console.error(`Visitor role with ID ${discordConfig.DISCORD_VISITOR_ROLE_ID} not found in guild ${member.guild.id}`);
      return;
    }

    try {
      await member.roles.add(visitorRole);
      console.log(`Assigned visitor role to ${member.user.tag} in guild ${member.guild.name}`);
    } catch (error) {
      console.error(`Failed to assign visitor role to ${member.user.tag} in guild ${member.guild.name}:`, error);
    }
  }
}

export default new GuildMemberAdd();