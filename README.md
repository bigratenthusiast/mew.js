# mew.js

simple discord bot that uses webhooks to replace messages containing certain patterns with new messages ‼️

## installation

- made sure u have [`nodejs`](https://nodejs.org/en/download/package-manager) installed
- `git clone` this repo then navigate to it with ur terminal of choice
- install the node modules with `npm i`

## setup
- create a [discord bot account](https://discord.com/developers/applications) and copy the token to add to `config.json`
- make sure to select "message content intent" (THIS IS RLY IMPORTANT OTHERWISE THE BOT CANNOT READ MESSAGES)
- invite the bot to the server (if u dont know how its just this link `https://discord.com/oauth2/authorize?client_id=INSERT_CLIENT_ID_HERE&scope=bot&permissions=8` but replace `INSERT_CLIENT_ID_HERE` with ur bots client id)
- copy your servers id (make sure you have developer mode on on discord) and add it to the list of guilds in `config.json`
- u can also copy the ids of any channels u want the bot not to touch
- head into `patterns.json` and add whatever patterns you want to. go wild. have fun!!
- run the bot with `node index.js`

kthx bye :)))
