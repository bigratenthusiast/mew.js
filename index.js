const { Client, Events, IntentsBitField, WebhookClient} = require("discord.js");
const sqlite3 = require('sqlite3').verbose();

const { token, guilds, blacklist } = require("./config.json");
const patterns  = require("./patterns.json");

const client = new Client({ intents: new IntentsBitField(3276799)});

let db = new sqlite3.Database('./webhooks.db');

Object.keys(patterns).forEach(id => {
	if (patterns[id].chance == undefined) patterns[id].chance = 1.0;
	if (patterns[id].bounded == undefined) patterns[id].bounded = true;
	if (patterns[id].unidirectional == undefined) patterns[id].unidirectional = false;

	if ("word" in patterns[id]) {
		var bound = (patterns[id].bounded ? "\\b" : "");
		patterns[id].word_pattern = new RegExp(`${bound}${escape(patterns[id].word)}${bound}`, "gi");
		patterns[id].opposite_pattern = new RegExp(`${bound}${escape(patterns[id].opposite)}${bound}`, "gi");
	} else {
		patterns[id].pattern = new RegExp(patterns[id].pattern, "gi");
		if (patterns[id].substitutes == undefined && !patterns[id].special) {
			patterns[id].substitutes = [{"substitute": patterns[id].substitute, "share": 1.0}];
			patterns[id].special = false;
		}
	}
});

client.on(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.username}`);
	db.run('CREATE TABLE IF NOT EXISTS Webhooks(channel varchar(128), user varchar(128), webhook varchar(128), token varchar(128))', (err) => { if(err) console.log(err); });
})
client.on(Events.MessageCreate, message => {
	if (guilds.includes(message.guildId)) {
		
		if (message.webhookId) return;
		if (message.author.bot) return;
		if (blacklist.includes(message.channelId)) return;

		
		db.get("SELECT 1 FROM Webhooks WHERE channel = ? AND user = ? LIMIT 1", [message.channelId, message.author.id], (err, row) => {
			if (!row) {
				message.channel.createWebhook({name: `${message.author.username} [BOT]`, avatar: message.author.avatarURL(), channel: message.channelId}).then(webhook => {
					db.run("INSERT INTO Webhooks (channel, user, webhook, token) VALUES (?, ?, ?, ?)", [message.channelId, message.author.id, webhook.id, webhook.token], (err) => {
						if (err) console.log(err); else console.log("Created webhook for " + message.author.username + " in " +  message.channelId);
					})
				});
			}
		})


		var content = message.content.replace(/​/g, ""); // strip of zwsp
		var fun_value = (Math.floor(Math.random() * 110) / 100); // 0.0 - 1.0 (inclusive) 

		Object.keys(patterns).forEach(id => {
			
			// match its random
			if (patterns[id].chance >= fun_value) {
				// check if its a basic word or pattern
				if ("word" in patterns[id]) {
					// main way
					content = content.replace(patterns[id].word_pattern, zip(patterns[id].opposite))
					if (patterns[id].unidirectional == undefined || patterns[id].unidirectional == false) {
						content = content.replace(patterns[id].opposite_pattern, zip(patterns[id].word)); // other way
					}
				} else {
					if (!patterns[id].special) {
						var degree = (Math.floor(Math.random() * 110) / 100);
						var sub = patterns[id].substitutes[0].substitute;
						
						for (let i = 0; i < patterns[id].substitutes.length; i++) {
							if (patterns[id].substitutes[i].share <= degree) {
								degree -= patterns[id].substitutes[i].share;
							} else {
								sub = patterns[id].substitutes[i].substitute;
							}
						}
						content = content.replace(patterns[id].pattern, zip(sub));
					} else {
						content = content.replace(patterns[id].pattern, (match) => eval(patterns[id].eval));
					}
				}
			}
		});

		var flag = content.indexOf("​") >= 0;
		content = unzip(content);

		
		console.log(`${message.author.username} | ${content}`);

		// webhook
		if (flag) {
			message.delete();
			db.get("SELECT * FROM Webhooks WHERE channel = ? AND user = ?", [message.channelId, message.author.id], (err, row) => {
				if (row !== undefined) {
					// there shouldnt be more than one row so we chillin
					// and it prolly exists like cmon be so fr
					var webhook = new WebhookClient({id: row.webhook, token: row.token})
					webhook.send({
						content: content,
						username: message.author.username,
						avatarURL: message.author.avatarURL()
					})
				}
			})
		}
	}
})


function zip(str) {
	return "​" + Buffer.from(str).toString('base64') + "​";
}

function unzip(str) {
	return str.replace(/​(.*?)​/gi, (match) => Buffer.from(match.replace("​", ""), "base64"))
}

function escape(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
client.login(token);
