/*CMD
  command: /withdraw2
CMD*/
// /withdraw2 — continuation of /withdraw.
var L = Libs.socialtaks;
var res = L.fbRes();
if (!res.ok) {
  Bot.sendMessage("⚠️ Database error: " + (res.error || "try again later."));
  return;
}
var vals = res.values || {};
var me = vals["users/" + user.id] || { earnings: 0, deposit: 0, bep20: "" };
var done = L.approvedTaskCountFrom(vals["subs"], user.id);
if (done < L.WITHDRAW_TASKS_NEEDED) {
  Bot.sendMessage("❌ Complete " + L.WITHDRAW_TASKS_NEEDED + " approved tasks first. Done: " + done);
  Bot.runCommand("/wallet");
  return;
}
if (!me.bep20) {
  User.setProperty("await", "wd_bep20", "string");
  Bot.sendMessage("🏦 Enter your BEP20 wallet address first:\nStarts with 0x, 42 characters.");
} else {
  User.setProperty("await", "wd_amount", "string");
  Bot.sendMessage("💸 Withdraw via BEP20\n\nBalance: " + L.money(L.totalBal(me)) + " USDT\nMinimum: 0.05 USDT | Fee: 0.01 USDT\n\nType the amount to withdraw.");
}
