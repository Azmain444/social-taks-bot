/*CMD
  command: /star3
CMD*/
// /star3 — bridge continuation: the task / withdrawal record now
// exists in Firebase; debit the user's balance, then /star4.
//   ct_created — task created, debit the user
//   wd_created — withdrawal created, debit the user
var L = Libs.socialtaks;
var res = L.fbRes();
var tag = L.fbCtx().tag || "";
if (!res.ok || !res.id) {
  Bot.sendMessage("⚠️ Could not save. Please try again — you were not charged.");
  return;
}
if (tag === "ct_created") {
  User.setProperty("ct_task_id", String(res.id), "string");
  var cu = {};
  try { cu = JSON.parse(User.getProperty("ct_user") || "{}"); } catch (e) {}
  L.fbSet("users/" + user.id, cu, "/star4", "ct_done");
  return;
}
if (tag === "wd_created") {
  User.setProperty("wd_id", String(res.id), "string");
  var wu = {};
  try { wu = JSON.parse(User.getProperty("wd_user") || "{}"); } catch (e) {}
  L.fbSet("users/" + user.id, wu, "/star4", "wd_done");
  return;
}
