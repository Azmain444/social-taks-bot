/*CMD
  command: /accounts2
CMD*/
// /accounts2 — continuation of /accounts.
var L = Libs.socialtaks;
var res = L.fbRes();
if (!res.ok) {
  Bot.sendMessage("⚠️ Database error: " + (res.error || "try again later."));
  return;
}
var x = null;
var list = L.asList(res.value);
for (var i = list.length - 1; i >= 0; i--) {
  if (list[i].userId === user.id) { x = list[i]; break; }
}
var line = "🐦 X (Twitter): not linked";
if (x) {
  var icon = x.status === "approved" ? "✅" : (x.status === "pending" ? "⏳" : "🚫");
  line = "🐦 X (Twitter): " + icon + " @" + x.username;
}
Bot.sendInlineKeyboard([
  [{ title: "🔗 Link X", command: "/connectx" }],
  [{ title: "👤 My Profile", command: "/profile" }]
], "🔗 MY ACCOUNTS\n\n" + line +
  "\n📸 Instagram: not linked\n🎵 TikTok: not linked\n▶️ YouTube: not linked\n\n" +
  "Link the account you use for each platform. Tasks on that platform need it.");
