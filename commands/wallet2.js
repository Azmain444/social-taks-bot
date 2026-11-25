/*CMD
  command: /wallet2
CMD*/
// /wallet2 — continuation of /wallet.
var L = Libs.socialtaks;
var res = L.fbRes();
if (!res.ok) {
  Bot.sendMessage("⚠️ Database error: " + (res.error || "try again later."));
  return;
}
var me = res.value || { earnings: 0, deposit: 0 };
Bot.sendInlineKeyboard([
  [{ title: "📥 Deposit", command: "/deposit" }, { title: "💸 Withdraw", command: "/withdraw" }],
  [{ title: "🏠 Home", command: "/menu" }]
], "💰 MY WALLET\n\n💵 Earnings: " + L.money(me.earnings || 0) + " USDT\n📥 Deposit: " + L.money(me.deposit || 0) + " USDT");
