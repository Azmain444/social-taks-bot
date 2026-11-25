/*CMD
  command: /invite2
CMD*/
// /invite2 — continuation of /invite.
// Bonus / percent come from /settings (admin panel editor).
var L = Libs.socialtaks;
var res = L.fbRes();
if (!res.ok) {
  Bot.sendMessage("⚠️ Database error: " + (res.error || "try again later."));
  return;
}
var vals = res.values || {};
var settings = L.loadSettings(vals["settings"]);
var ref = L.referralStatsFrom(vals["users"], user.id);
var link = "https://t.me/" + L.BOT_USERNAME + "?start=ref_" + user.id;
Bot.sendInlineKeyboard([
  [{ title: "📤 Share Link", url: "https://t.me/share/url?url=" + link }],
  [{ title: "🏠 Home", command: "/menu" }]
], "👥 INVITE FRIENDS\n\n" +
  "🎁 Joining bonus: " + settings.referral.joinBonus + " USDT per friend\n" +
  "➕ Plus " + settings.referral.pct + "% of every task they complete\n\n" +
  "👥 Friends: " + ref.count + "\n" +
  "💰 Earned from friends: " + L.money(ref.earned) + " USDT\n\n" +
  "🔗 Your link:\n" + link + "\n\n" +
  "📣 SOCIAL TAKS\n" +
  "PERFORM SIMPLE TG, IG, TikTok & X TASKS TO EARN $USDT AND WITHDRAW IT INSTANTLY!\n" +
  "📢 OFFICIAL CHANNEL: @test9191929");
