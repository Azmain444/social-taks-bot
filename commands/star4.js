/*CMD
  command: /star4
CMD*/
// /star4 — bridge continuation: balance debited, confirm to the user.
//   ct_done — task live
//   wd_done — withdrawal requested, notify the admin
var L = Libs.socialtaks;
var res = L.fbRes();
var tag = L.fbCtx().tag || "";
if (!res.ok) {
  Bot.sendMessage("⚠️ Saved, but the balance update failed — please contact support.");
  return;
}
if (tag === "ct_done") {
  var act = User.getProperty("ct_action") || "like";
  var q = User.getProperty("ct_quality") || "standard";
  var count = User.getProperty("ct_count_val") || "0";
  var total = User.getProperty("ct_total") || "0";
  Bot.sendMessage("✅ Task created! 🎉\n\nTask #" + User.getProperty("ct_task_id") +
    " — " + act + " x" + count + " (" + q + ")\nCost: " + L.money(parseFloat(total)) + " USDT\nIt is now live for earners.");
  return;
}
if (tag === "wd_done") {
  var wamt = parseFloat(User.getProperty("wd_amount_val") || "0");
  var fee = parseFloat(User.getProperty("wd_fee") || "0");
  var wdId = User.getProperty("wd_id") || "";
  Bot.sendMessage("✅ Withdrawal requested (#" + wdId + ")\n\nAmount: " + L.money(wamt) + " USDT | Fee: " + L.money(fee) + " USDT\nThe admin will pay it shortly.");
  L.adminMsg("💸 Withdrawal request #" + wdId +
    "\nUser: " + user.id + " (@" + (user.username || "—") + ")" +
    "\nMethod: BEP20 | Amount: " + L.money(wamt) + " USDT | Fee: " + L.money(fee) +
    "\n\nMark paid: /wdok " + wdId + "\nDecline: /wdno " + wdId);
  return;
}
