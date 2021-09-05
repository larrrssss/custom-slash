import 'dotenv/config';
import { Client, Intents } from 'discord.js';
import { join } from 'path';
import fs from 'fs';

import { Command, FirestoreCommand } from './types';
import { commands as dbCommands } from './lib/firestore';

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] });
const commands: Command[] = [];

client.on('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}`);

  const files = await fs.promises.readdir(join(__dirname, 'commands'));
  for (const f of files) {
    commands.push({
      name: f.split('.')[0],
      executor: (await import(join(__dirname, 'commands', f))).default,
    });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  for (const cmd of commands) {
    if (cmd.name === interaction.commandName) {
      cmd.executor(interaction);
    }
  }
  
  const guildCommands = await dbCommands
    .where('name', '==', interaction.commandName)
    .get();

  if (guildCommands.size !== 0) {
    const guildCmd = guildCommands.docs[0];    
    interaction.reply({
      content: guildCmd.get('content'),
      ephemeral: guildCmd.get('ephemeral'),
    });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);