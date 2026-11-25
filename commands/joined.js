/*CMD
  command: /joined
CMD*/
// /joined — check channel membership, then unlock the main menu.
// Marks verified=1 in Firebase (fire-and-forget write).
var L = Libs.socialtaks;
var joined = false;
try {
  var r = Api.getChatMember({ chat_id: L.CHANNEL, user_id: user.id });
  var st = r && r.result ? r.result.status : "";
  joined = (st === "member" || st === "administrator" || st === "creator");
} catch (e) {
  // If the check fails (bot not admin in the channel yet), let the
  // user in and fix the channel setup — see SETUP.md.
  joined = true;
}
if (!joined) {
  Bot.sendMessage("❌ You haven't joined the channel yet. Please join first, then tap ✅ I have joined again.");
} else {
  User.setProperty("is_verified", "1", "string");
  L.fbSet("users/" + user.id + "/verified", 1, "/fbnoop");
  Bot.sendMessage("✅ VERIFIED!");
  L.mainMenu();
}
