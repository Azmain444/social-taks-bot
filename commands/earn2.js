/*CMD
  command: /earn2
CMD*/
// /earn2 — continuation of /earn.
var L = Libs.socialtaks;
var res = L.fbRes();
if (!res.ok) {
  Bot.sendMessage("⚠️ Database error: " + (res.error || "try again later."));
  return;
}
var acc = L.approvedAccountFrom(res.value, user.id);
if (!acc) {
  Bot.sendInlineKeyboard([
    [{ title: "🔗 Connect Your X Account", command: "/connectx" }],
    [{ title: "🏠 Home", command: "/menu" }]
  ], "🎯 Earn Tasks\n\nTo do X tasks, first connect your X account.\nYour account will be reviewed by an admin.");
} else {
  Bot.sendInlineKeyboard([
    [{ title: "▶️ Show Me Tasks", command: "/tasks" }],
    [{ title: "🏠 Home", command: "/menu" }]
  ], "🎯 Ready to earn?\n\nConnected X: @" + acc.username + " ✅\nTap below to see available tasks.");
}
