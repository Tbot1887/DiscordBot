/**
	Project Name: Tbot's Discord Bot
	@author Thomas Ruigrok

    @copyright Copyright 2019-2021 By Thomas Ruigrok.

	This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.

    This Source Code Form is "Incompatible With Secondary Licenses", as
    defined by the Mozilla Public License, v. 2.0.
*/



/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////
//Variable declarations below this line                        //
////////////////////////////////////////////////////////////////


//Declare Discord Integration variables
const Discord = require('discord.js');
const client = new Discord.Client();

//Declare other integration variables
const fs = require('fs');
const ConnectionCheck = require('internet-available');

//Declare other const variables
const KEY_FILE_NAME = "/home/pi/DiscordBot/DiscordLoginToken.key";
const LOG_FILE_PATH = "/home/pi/DiscordBot/logs/CmdLog.log";
const ERROR_FILE_PATH = "/home/pi/DiscordBot/logs/Errors.log";

// Declare Bot const variables
const BOT_VERSION = '2.1.5';
const BOT_NAME = "Squishy Overlord Bot";
const ADMIN_ROLE_NAME = "BotAdmin";
const AUTHOR = "Thomas Ruigrok #8086";
const CMD_PREFIX = '!!';
const AdminCmdPrefix = '*!';

// Other vars
const MC_ENABLED = false;
//Music Channel ID (For Music Command Moderation)
const MUSIC_CHANNEL_ID = "[REDACTED]";

// Declare one-time assignment variables
var DISCORD_LOGIN_TOKEN = 'TOKEN-AUTO-INJECTED-FROM-INIT';

// Commands Arrays
const CMDS = ['!!help', '!!Version', '!!ping', '!!cookie', '!!marco', '!!mcServer'];
const CMDS_DESCRP = ["Srsly Becky? It's pretty obvious m8", "Displays the currently running Bot Version", "Pong!", "Give a cookie, Get a Cookie!", "Polo!", "Minecraft Server IPs"];
const ADMINCMDS = ['*!reset', '*!shutdown', '*!ban', '*!mute'];
const ADMINCMDS_DESCRP = ["Restarts the bot", "Stops the bot", "Bans a user", "Mutes a user"];


/////////////////////////////////////////////////////////////////
//MAIN                                                         //
////////////////////////////////////////////////////////////////


//Load Discord Login Token from file & Login to discord
Init();

// On Client Ready, Send message to console
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// When a message is received, check against available commands
client.on('message', msg => {

    //Verify bot is not sending the message
    if (msg.author.id != client.user.id) {

        //Set msg to lowercase for command Checking
        msg = ConvertToLowercase(msg);

        //Moderation
        Moderation(msg);
        //Command Checking
        CheckForCommand(msg);
    }
});


/////////////////////////////////////////////////////////////////
//END MAIN                                                     //
////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
//INITIALIZATION functions below this line                     //
////////////////////////////////////////////////////////////////


/**
 * Initialization Function to load application variables
 */
function Init() {
    console.log(GetBotInfo());
    ConnectionCheck().then(function() {
        if (ReadKeyFromFile()) {
            //login to client
            client.login(DISCORD_LOGIN_TOKEN);
        } else {
            Error_log("Can't load discord key token. Aborting...", -100, exitScript);
        }
    }).catch(function() {
        Error_log("Internet Connection unavailable. Aborting...", -404, exitScript);
    });
}

/**
 * Reads the discord Login Token from file
 * @return keyLoaded
 */
function ReadKeyFromFile() {
    var keyLoaded = true;

    var keyFileData;
    fileArray = [];

    //Read token from file
    try {
        //Read login token from key file
        keyFileData = fs.readFileSync(KEY_FILE_NAME);
        //Split file data at new line char
        fileArray = keyFileData.toString().split(/\r?\n/);
        //Set login token to 3rd line of file
        DISCORD_LOGIN_TOKEN = fileArray[2];
    } catch (err) {
        console.log("Error getting token from file. Terminating...");
        keyLoaded = false
    }

    return keyLoaded;
}


/////////////////////////////////////////////////////////////////
//Cammand Functions below this line                            //
////////////////////////////////////////////////////////////////


/**
 * Run Moderation functions
 * @param {object} msg - Discord.js Message Object
 */
function Moderation(msg) {
    MusicCommands(msg);
}


/**
 * Check for a valid command
 * @param {object} msg - Discord.js Message Object
 */
function CheckForCommand(msg) {
    if (msg.content === CMD_PREFIX + 'ping') {
        Ping(msg);
    } else if (msg.content === CMD_PREFIX + 'cookie') {
        Cookie(msg);
    } else if (msg.content === CMD_PREFIX + 'marco') {
        Marco_polo(msg);
    } else if (msg.content === CMD_PREFIX + 'mcserver') {
        MinecraftIPs(msg);
    } else if (msg.content === AdminCmdPrefix + 'reset') {
        ResetBot(msg);
    } else if (msg.content === AdminCmdPrefix + 'shutdown') {
        StopBot(msg);
    } else if (msg.content === CMD_PREFIX + 'help') {
        Help(msg);
    } else if (Wildcard(msg.content, '*bubblegum*')) {
        BubbleGum(msg);
    } else if (msg.content === CMD_PREFIX + 'version') {
        GetInfo(msg);
    };
}


/**
 * Checks to see if user is sending a command to Rythem outside of the music channel
 * @param {object} msg - Discord.js Message Object
 */
function MusicCommands(msg) {
    //Array of Common Rythem commands
    const RYTHEM_CMDS = ["!play*", "!stop*", "!skip*", "!fs*"];

    //Channel Tag String
    var channelTag = "<#" + MUSIC_CHANNEL_ID + ">";

    //Reply Message
    var replyMsg = "Music Commands can only be used in the " + channelTag + " Channel!";
    
    //Discord Channel Variables
    var channel = msg.channel;
    var currentChannelID = channel.id;

    //Loop through the Command array checking for a match
    for (i = 0; i < RYTHEM_CMDS.length; i++) {
        if (Wildcard(msg.content, RYTHEM_CMDS[i])) {
            if (currentChannelID != MUSIC_CHANNEL_ID) {
                msg.reply(replyMsg);
            }
        }
    }
}


/**
 * The Help Command - Lists available commands
 * @param {object} msg - Discord.js Message Object 
 */
function Help(msg) {
    //Regular Commands
    response = '\n' + "Available Commands" + '\n' + "-------------------\n";
    for (i = 0; i < CMDS.length; i++) {
        response += CMDS[i] + " - " + CMDS_DESCRP[i] + '\n';
    }

    //Admin Commands
    response += "\n ADMIN Commands" + '\n' + "-------------------\n";
    for (i = 0; i < ADMINCMDS.length; i++) {
        response += ADMINCMDS[i] + " - " + ADMINCMDS_DESCRP[i] + '\n';
    }

    //Reply
    msg.reply(response);
}


/**
 * the Version command - Lists information about the bot (IE. Current Version & Author)
 * @param {object} msg - Discord.js Message Object
 */
function GetInfo(msg) {
    var channel = msg.channel;
    channel.send(GetBotInfo());
}


/**
 * the Ping command - Simple test reply command (First command)
 * @param {object} msg - Discord.js Message Object
 */
function Ping(msg) {
    msg.reply('pong');
}


/**
 * the Cookie Command - Replies with a cookie Emoticon
 * @param {object} msg 
 */
function Cookie(msg) {
    msg.reply(':cookie:');
}


/**
 * the marco command - Replies to 'Marco' with 'Polo!'
 * @param {object} msg - Discord.js Message Object
 */
function Marco_polo(msg) {
    msg.reply('Polo!');
}


/**
 * the MCServer Command - If MC_ENABLED is true. Print the Minecraft server IP(s)
 * @param {object} msg - Discord.js Message Object
 */
function MinecraftIPs(msg) {
    if (MC_ENABLED)
        msg.reply('\n Main MC Server: [REDACTED]');
    else
        msg.reply('NO MC Servers Available');
}


/**
 * First attempt at a game (Not in use)
 * @param {object} msg - Discord.js Message Object
 */
function RockPaperScissors(msg) {

    /* 	if (userChoice ==! 'rock' || userChoice ==! 'paper' || userChoice ==! 'scissors'){
    		msg.reply("Please choose either rock, paper, or scissors (All Lowercase)")
    	}
    	else{
    	} */
}


/**
 * replies to any message containing the word 'bubblegum' with the bubblegum meme
 * @param {object} msg - Discord.js Message Object
 */
function BubbleGum(msg) {
    const BUBBLEGUM_RESPONSE = "shut your bubble gum dumb dumb skin tone chicken bone google chrome no homo flip phone disowned ice cream cone garden gnome extra chromosome metronome dimmadome genome full blown monochrome student loan indiana jones over grown flint stone X and Y Chromosome friend zome sylvester stalone sierra leone auto zone friend zone professionally seen silver patrone big headed ass UP";
    msg.reply(BUBBLEGUM_RESPONSE);
}


/**
 * Admin Command to reset (Restart) the bot
 * @param {object} msg - Discord.js Message Object
 */
function ResetBot(msg) {
    var channel = msg.channel;

    //Create log entry
    AdminCmdLog(msg, "reset");

    //Validate User role
    if (CheckUserRole(msg)) {
        // send channel a message that you're resetting bot
        channel.send('Bot Restarting...')
            .then(msg => client.destroy())
            .then(() => client.login(DISCORD_LOGIN_TOKEN));
    } else {
        msg.reply("You don't have permission to use that command. You must have the role of:  `" + ADMIN_ROLE_NAME + "`");
    }
}


/**
 * Admin Command to shutdown the bot
 * @param {object} msg - Discord.js Message Object 
 */
function StopBot(msg) {
    var channel = msg.channel;

    //Create log entry
    AdminCmdLog(msg, "shutdown");

    //Validate User role
    if (CheckUserRole(msg)) {
        // send channel a message that you're stopping bot

        channel.send('Bot Shutting Down...')
            .then(msg => client.destroy())
            .then(() => process.exit(0));

    } else {
        msg.reply("You don't have permission to use that command. You must have the role of:  `" + ADMIN_ROLE_NAME + "`");
    }
}


/////////////////////////////////////////////////////////////////
//Utility Functions below this line                            //
////////////////////////////////////////////////////////////////


/**
 * Utility function to check if a user has a role
 * @param {object} msg - Discord.js Message Object
 * @returns {boolean} true/false depending on if user has role
 */
function CheckUserRole(msg) {
    var returnVar = false;
    //Validate user has sufficient permissions
    /* Discord.js V11.6.4 Code
    if (msg.guild.roles.find(role => role.name === ADMIN_ROLE_NAME)) {
        returnVar = true;
    }
    */

    //Discord.js V12.5.1
    let adminRole = msg.guild.roles.cache.find(role => role.name === ADMIN_ROLE_NAME);

    if(msg.member.roles.cache.has(adminRole.id))
    {
        returnVar = true;
    }

    return returnVar;
}


/**
 * Determines if a message contains the rule specified
 * @param {string} message - Discord Message Contents
 * @param {string} rule - Phrase to match (RegEx)
 * @returns {boolean} True/False
 */
function Wildcard(message, rule) {
    var escapeRegex = (message) => message.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(message);
}


/**
 * Helper Function to combine bot Info into a single string
 * @returns {string} Bot Info String
 */
function GetBotInfo() {
    var returnStr = BOT_NAME + " Version " + BOT_VERSION + '\n' + "Author: " + AUTHOR;
    return returnStr;
}


/**
 * Converts UTC Date to a Local Date
 * @param {Date} date - Date to be converted
 * @returns {Date} UTC Date in Local Date
 */
function ConvertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return newDate;
}


/**
 * Converts a Discord message to lowercase
 * @param {object} msg - Discord.js Message Object
 * @returns {object} Discord.js Message Object converted to lowerCase
 */
function ConvertToLowercase(msg) {
    // Convert msg to lowercase
    msg.content = msg.content.toLowerCase();

    //Return the changed message
    return msg;
}


/**
 * Logs an admin command to a log file & discord channel
 * @param {object} msg - Discord.js Message Object 
 * @param {*} cmdRcvd - The name of the command received
 */
function AdminCmdLog(msg, cmdRcvd) {
    //Declare vars
    var date = new Date();
    var time = TimePad(date.getUTCHours()) + ":" + TimePad(date.getUTCMinutes());
    var localTime = TimePad(date.getHours()) + ":" + TimePad(date.getMinutes());
    var user = msg.member.user.tag;

    //Command Received: 04/04/2020 @ 22:49 (UTC: 04:49) By: tbot1887#1234 -- Command Issued: reset
    var logString = "Command Received: " + TimePad((date.getMonth() + 1)) + "/" + TimePad(date.getDate()) + "/" + date.getFullYear() + " @ " +
        localTime + "(UTC: " + time + ") By: " + user + " -- Command Issued: " + cmdRcvd;

    //Write Logfile to file @ console
    console.log(logString);
    //Open Log File
    try {
        fs.appendFileSync(LOG_FILE_PATH, logString + '\n');
    } catch (error) {
        msg.channel.send("WARNING!!! Log File Creation Failed." + '\n' + error.toString());
    }
}


/**
 * Pads a number with a leading zero
 * @param {number} n - The number to be padded
 * @returns {string} Number padded with leading zero if needed
 */
function TimePad(n) {
    return String("00" + n).slice(-2);
}


/**
 * Logs an error occurrence to a file & sets an exit code
 * @param {string} errorMsg - The error message Text
 * @param {number} errorCode - The Error Code
 * @param {*} callback - Callback function if needed
 */
function Error_log(errorMsg, errorCode, callback) {
    //Set Exit (STOP) Code
    process.exitCode = errorCode;

    //create log string
    var logString = "STOP CODE: " + errorCode + " - Details: " + errorMsg;

    //Write Logfile to file @ console
    console.log(logString);

    //Open Log File & Write too it
    try {
        fs.appendFileSync(ERROR_FILE_PATH, logString + '\n');
    } catch (error) {
        //If writing failed
        console.log("WARNING!!! Log File Creation Failed." + '\n' + error.toString());
    }

    //Callback function
    if (typeof callback == "function")
        callback();
}


/**
 * Function to exit a script.
 */
function exitScript() {
    process.exit();
}
