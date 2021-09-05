import { CommandInteraction } from 'discord.js';

export interface Command {
  name: String,
  executor: (interaction: CommandInteraction) => void | Promise<void>,
}

export interface FirestoreCommand {
  content: string,
  name: string,
  description: string,
  ephemeral: boolean,
}