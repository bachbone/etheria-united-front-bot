import { Client, Events, ActivityType } from "discord.js";
import { DiscordEvent } from "@/types/discord.types";

class ReadyEvent implements DiscordEvent {
  public name = Events.ClientReady;
  public once = true;

  public execute(client: Client) {
    client.user?.setActivity("Etheria: Restart", {
      type: ActivityType.Playing,
    });
  }
}

export default new ReadyEvent();