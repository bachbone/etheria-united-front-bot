import { Events, Interaction } from "discord.js";
import { DiscordClientWithCommands, DiscordEvent } from "@/types/discord.types";

class InteractionCreateEvent implements DiscordEvent {
  public name = Events.InteractionCreate;
  public once = false;

  public execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const commands = interaction.client as DiscordClientWithCommands;

    const command = commands.commands.get(interaction.commandName);

    if (!command) return;

    command.execute(interaction);
  }
}

export default new InteractionCreateEvent();
