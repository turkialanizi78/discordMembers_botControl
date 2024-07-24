const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits  } = require('discord.js');
const { token ,guildId} = require('./config.json');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        
       
    ]
    
});
client.options.restRequestTimeout = 60000; // 60 seconds
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
 
// عرض جميع الأعضاء بدون البوتات
function getFriendlyPresenceStatus(status) {
    switch (status) {
        case 'online':
            return 'متصل';
        case 'idle':
            return 'بالخارج';
        case 'dnd':
            return 'مشغول';
        case 'offline':
            return 'غير متصل';
        default:
            return 'غير معروف';
    }
}

function getUserBadges(user) {
    const badges = [];
    if (user.flags) {
        const userFlags = user.flags.toArray();
        userFlags.forEach(flag => {
            switch (flag) {
                case 'DISCORD_EMPLOYEE':
                    badges.push('Employee');
                    break;
                case 'PARTNERED_SERVER_OWNER':
                    badges.push('Partnered Server Owner');
                    break;
                case 'HYPESQUAD_EVENTS':
                    badges.push('HypeSquad Events');
                    break;
                case 'BUGHUNTER_LEVEL_1':
                    badges.push('Bug Hunter Level 1');
                    break;
                case 'HOUSE_BRAVERY':
                    badges.push('House of Bravery');
                    break;
                case 'HOUSE_BRILLIANCE':
                    badges.push('House of Brilliance');
                    break;
                case 'HOUSE_BALANCE':
                    badges.push('House of Balance');
                    break;
                case 'EARLY_SUPPORTER':
                    badges.push('Early Supporter');
                    break;
                case 'TEAM_USER':
                    badges.push('Team User');
                    break;
                case 'SYSTEM':
                    badges.push('System');
                    break;
                case 'BUGHUNTER_LEVEL_2':
                    badges.push('Bug Hunter Level 2');
                    break;
                case 'VERIFIED_BOT':
                    badges.push('Verified Bot');
                    break;
                case 'EARLY_VERIFIED_BOT_DEVELOPER':
                    badges.push('Early Verified Bot Developer');
                    break;
                default:
                    break;
            }
        });
    }
    return badges;
}

const { setTimeout } = require('timers/promises');

app.get('/members', async (req, res) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 5000; // 5 seconds

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const guild = await client.guilds.fetch(guildId);
            const members = await guild.members.fetch({ cache: false, force: true });

        const filteredMembers = members.filter(member => !member.user.bot);
        const memberData = filteredMembers.map(member => {
            const presence = member.presence || {};
            const activities = presence.activities || [];
            const activity = activities.length > 0 ? activities[0].name : 'None';
            const joinDate = member.joinedAt ? member.joinedAt.toISOString().split('T')[0] : 'Unknown';
            const creationDate = member.user.createdAt ? member.user.createdAt.toISOString().split('T')[0] : 'Unknown';
            const lastMessageTime = member.lastMessage ? member.lastMessage.createdAt.toISOString().split('T')[0] : 'Unknown';
            const presenceStatus = getFriendlyPresenceStatus(presence.status || 'offline');
            const highestRole = member.roles.highest.name;
            const voiceChannel = member.voice.channel ? member.voice.channel.name : 'None';
            const badges = getUserBadges(member.user);

            return {
                username: member.user.username,
                tag: member.user.tag,
                id: member.id,
                nickname:member.nickname,
                avatar: member.user.displayAvatarURL(),
                roles: member.roles.cache.map(role => role.name),
                presence: presenceStatus,
                activity,
                joinedAt: joinDate,
                createdAt: creationDate,
                lastMessageTime,
                numRoles: member.roles.cache.size,
                highestRole,
                voiceChannel,
                badges,
                isBooster: member.premiumSince ? true : false,
            };
        });

        res.json(memberData);
        return; // Success, exit the function
    } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === MAX_RETRIES) {
            res.status(500).send('Internal Server Error: Unable to fetch members after multiple attempts');
            return;
        }
        await setTimeout(RETRY_DELAY);
    }
}
});





app.get('/guild-info', async (req, res) => {
    try {
        const guild = await client.guilds.fetch(guildId);
        const memberCount = guild.memberCount;
        const guildName = guild.name;
        res.json({ guildName, memberCount });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/send-message', async (req, res) => {
    const { memberId, message } = req.body;
    try {
        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(memberId);

        if (!member) {
            return res.status(404).json({ message: 'Member not found.' });
        }

        await member.send(message);
        res.status(200).json({ message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message.' });
    }
});



app.post('/edit-member', async (req, res) => {
    const { memberId, newName } = req.body;
    try {
        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(memberId);
        if (member) {
            await member.setNickname(newName);
            res.status(200).send('Member name updated');
        } else {
            res.status(404).send('Member not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/roles', async (req, res) => {
    try {
        const guild = await client.guilds.fetch(guildId);
        const roles = guild.roles.cache.map(role => ({
            id: role.id,
            name: role.name
        }));
        res.json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/member-roles', async (req, res) => {
    const { memberId, action } = req.query;
    try {
        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(memberId);
        const allRoles = guild.roles.cache.map(role => ({
            id: role.id,
            name: role.name
        }));
        if (action === 'remove') {
            const memberRoles = member.roles.cache.map(role => ({
                id: role.id,
                name: role.name
            }));
            res.json({ roles: memberRoles });
        } else {
            const memberRolesIds = member.roles.cache.map(role => role.id);
            res.json({ allRoles, memberRolesIds });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/ban', async (req, res) => {
    const { memberId } = req.body;
    try {
        const guild = await client.guilds.fetch(guildId);
        const member = guild.members.resolve(memberId);
        if (member) {
            await member.ban();
            res.status(200).send('Member banned');
        } else {
            res.status(404).send('Member not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/add-roles', async (req, res) => {
    const { memberId, roleIds } = req.body;
    try {
        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(memberId);
        const rolesToAdd = roleIds.map(roleId => guild.roles.resolve(roleId));
        await member.roles.add(rolesToAdd);
        res.status(200).send('Roles added');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/add-role', async (req, res) => {
    const { memberId, roleId } = req.body;
    try {
        const guild = await client.guilds.fetch(guildId);
        const member = guild.members.resolve(memberId);
        const role = guild.roles.resolve(roleId);
        if (member && role) {
            await member.roles.add(role);
            res.status(200).send('Role added');
        } else {
            res.status(404).send('Member or role not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/remove-roles', async (req, res) => {
    const { memberId, roleIds } = req.body;
    try {
        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(memberId);
        const rolesToRemove = roleIds.map(roleId => guild.roles.resolve(roleId));
        await member.roles.remove(rolesToRemove);
        res.status(200).send('Roles removed');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/remove-role', async (req, res) => {
    const { memberId, roleId } = req.body;
    try {
        const guild = await client.guilds.fetch(guildId);
        const member = guild.members.resolve(memberId);
        const role = guild.roles.resolve(roleId);
        if (member && role) {
            await member.roles.remove(role);
            res.status(200).send('Role removed');
        } else {
            res.status(404).send('Member or role not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/delete-member', async (req, res) => {
    const { memberId } = req.body;
    try {
        const guild = await client.guilds.fetch(guildId);
        const member = guild.members.resolve(memberId);
        if (member) {
            await member.kick();
            res.status(200).send('Member deleted');
        } else {
            res.status(404).send('Member not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

client.login(token);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
