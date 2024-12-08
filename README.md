# DM log & Messaging

Only users with the roles specified in `config.json` can use these commands.

- Sends logs of DMs it receives to the `logChannel` ID from the `guildId` server in config.

`<prefix>sendmsg #channel <content>` - Sends text message to specified channel  
`<prefix>senddm @user <content>` - Sends DM to specified user.  
`/sendmsgembed` - Sends embed message to specified channel  
`/senddmembed` - Sends embed DM to specified user

# Register slash commands
Run `register.js` to get /slash commands registered.

# TO DO
- Add message.reply log to channel `senddm` or `senddmembed` was used in to show DM was successful or not.
- Add title link
- Add author link
- Add text command versions of embed slash commnads
- Whenever a footer or footerimg is specified, don't use hardcoded footer/footerimg, only used when both are
 not specified.
- Use role IDs instead of role names?
