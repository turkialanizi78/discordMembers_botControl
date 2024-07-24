// const { Client, GatewayIntentBits } = require('discord.js');
// const { token } = require('./config.json');

// const client = new Client({
//     intents: [
//         GatewayIntentBits.Guilds,
//         GatewayIntentBits.GuildMembers,
//         GatewayIntentBits.GuildMessages,
//         GatewayIntentBits.GuildMessageReactions,
//         GatewayIntentBits.MessageContent,
//         GatewayIntentBits.GuildVoiceStates
//     ]
// });

// client.once('ready', () => {
//     console.log(`Logged in as ${client.user.tag}!`);
// });

// client.on('messageCreate', async message => {
//     if (message.content.startsWith('!members')) {
//         const members = await message.guild.members.fetch();
//         members.forEach(member => {
//             message.channel.send(`${member.user.username} - ${member.user.displayAvatarURL()}`);
//         });
//     }

//     if (message.content.startsWith('!ban')) {
//         if (!message.member.permissions.has('BAN_MEMBERS')) return message.reply('You do not have permissions to ban members!');
//         const user = message.mentions.users.first();
//         if (user) {
//             const member = message.guild.members.resolve(user);
//             if (member) {
//                 await member.ban();
//                 message.channel.send(`${user.tag} was banned.`);
//             } else {
//                 message.channel.send('User not found in the guild.');
//             }
//         } else {
//             message.channel.send('You need to mention a user to ban.');
//         }
//     }

//     if (message.content.startsWith('!mute')) {
//         if (!message.member.permissions.has('MUTE_MEMBERS')) return message.reply('You do not have permissions to mute members!');
//         const user = message.mentions.users.first();
//         if (user) {
//             const member = message.guild.members.resolve(user);
//             if (member) {
//                 const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
//                 if (!muteRole) return message.channel.send('Mute role not found.');
//                 await member.roles.add(muteRole);
//                 message.channel.send(`${user.tag} was muted.`);
//             } else {
//                 message.channel.send('User not found in the guild.');
//             }
//         } else {
//             message.channel.send('You need to mention a user to mute.');
//         }
//     }

//     if (message.content.startsWith('!addrole')) {
//         const args = message.content.split(' ');
//         const roleName = args.slice(2).join(' ');
//         const user = message.mentions.users.first();
//         if (user) {
//             const member = message.guild.members.resolve(user);
//             if (member) {
//                 const role = message.guild.roles.cache.find(role => role.name === roleName);
//                 if (role) {
//                     await member.roles.add(role);
//                     message.channel.send(`${roleName} role added to ${user.tag}.`);
//                 } else {
//                     message.channel.send(`Role ${roleName} not found.`);
//                 }
//             } else {
//                 message.channel.send('User not found in the guild.');
//             }
//         } else {
//             message.channel.send('You need to mention a user to add a role.');
//         }
//     }
// });

// client.login(token);
