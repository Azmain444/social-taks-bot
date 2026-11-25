/*CMD
  command: /proofsend2
CMD*/
// /proofsend2 — continuation of /proofsend.
var L = Libs.socialtaks;
var res = L.fbRes();
if (!res.ok) {
  Bot.sendMessage("⚠️ Database error: " + (res.error || "try again later."));
  return;
}
var vals = res.values || {};
var taskId = parseInt(User.getProperty("proof_task") || "0");
var photos = [];
try { photos = JSON.parse(User.getProperty("proof_photos") || "[]"); } catch (e) {}
if (!taskId || photos.length === 0) {
  Bot.sendMessage("Send a proof screenshot first!");
  return;
}
var list = L.asList(vals["subs"]);
for (var i = 0; i < list.length; i++) {
  if (list[i].userId === user.id && list[i].taskId === taskId && list[i].status === "pending") {
    Bot.sendMessage("⏳ Already submitted — waiting for review.");
    return;
  }
}
User.setProperty("await", "", "string");
User.setProperty("proof_photos", "[]", "string");
User.setProperty("proof_first_photo", photos[0], "string");
User.setProperty("proof_task_id", String(taskId), "string");
// The submission carries its reward (spec §3) — the admin panel
// credits sub.reward on approval, so a missing reward would pay 0.
var task = L.getTaskFrom(vals["tasks"], taskId);
var reward = task ? task.reward : 0;
L.fbCreate("subs", { userId: user.id, taskId: taskId, photos: photos, status: "pending", reward: reward }, "/proofsend3");
