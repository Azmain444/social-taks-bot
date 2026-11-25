/*CMD
  command: /profile2
CMD*/
// /profile2 — continuation of /profile.
var L = Libs.socialtaks;
var res = L.fbRes();
if (!res.ok) {
  Bot.sendMessage("⚠️ Database error: " + (res.error || "try again later."));
  return;
}
var vals = res.values || {};
var me = vals["users/" + user.id] || { firstName: "", earnings: 0 };
var approved = L.approvedTaskCountFrom(vals["subs"], user.id);
var ref = L.referralStatsFrom(vals["users"], user.id);
Bot.sendInlineKeyboard([
  [{ title: "🔗 My Accounts", command: "/accounts" }, { title: "📄 My Submissions", command: "/mysubs" }],
  [{ title: "🔔 Notifications", command: "/notif" }, { title: "💰 My Wallet", command: "/wallet" }],
  [{ title: "🏆 Leaderboard", command: "/board" }, { title: "🏠 Home", command: "/menu" }]
], "👤 MY PROFILE\n——————————\n👤 " + (me.firstName || "null") +
  "\n🆔 " + user.id +
  "\n💰 Earnings: " + L.money(me.earnings || 0) + " USDT" +
  "\n✅ Approved tasks: " + approved +
  "\n👥 Friends invited: " + ref.count);
