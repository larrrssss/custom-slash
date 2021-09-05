import { CommandInteraction } from 'discord.js';

import { commands, db } from '../lib/firestore';
import { baseUrl, defaultEmbed, rest } from '../lib/discord';

export default async function executor(interaction: CommandInteraction) {
  const name = interaction.options.get('name')?.value;

  try {
    const cmds = await commands.where('name', '==', name).get();
    if (cmds.size === 0) {
      return interaction.reply({ embeds: [defaultEmbed()
        .setColor('RED')
        .setDescription('Command does not exist')] 
      });
    }    

    await Promise.all([
      rest.delete(
        `${baseUrl(interaction.guild?.id || '')}/${cmds.docs[0].get('discord_slash_command_id')}` as `/${string}`
      ),
      db.doc(`/commands/${cmds.docs[0].id}`).delete(),
    ]);

    return interaction.reply({ embeds: [defaultEmbed()
      .setColor('GREEN')
      .setDescription('Command deleted!')] 
    });
  } catch (e) {
    interaction.reply({ embeds: [defaultEmbed()
      .setColor('RED')
      .setDescription('Oopss, something went wrong')] 
    });
  }
}