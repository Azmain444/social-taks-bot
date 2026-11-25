/*CMD
  command: /start3
CMD*/
// /start3 — continuation of /start2: channel gate or main menu.
var L = Libs.socialtaks;
if (User.getProperty("is_verified") === "1") {
  L.mainMenu();
} else {
  Bot.sendInlineKeyboard([
    [{ title: "📢 Join Channel 1", url: L.CHANNEL_URL }],
    [{ title: "✅ I have joined", command: "/joined" }]
  ], "👋 WELCOME!\n🔒 Join all channels below to unlock the bot.\nThen tap ✅ I have joined");
}
