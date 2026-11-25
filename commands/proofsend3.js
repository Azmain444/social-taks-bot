/*CMD
  command: /proofsend3
CMD*/
// /proofsend3 — continuation of /proofsend2: submission created.
var L = Libs.socialtaks;
var res = L.fbRes();
if (!res.ok || !res.id) {
  Bot.sendMessage("⚠️ Could not save the submission. Please try again.");
  return;
}
var taskId = parseInt(User.getProperty("proof_task_id") || "0");
var photo = User.getProperty("proof_first_photo") || "";
Bot.sendMessage("✅ Proof sent to admin for review!\n\nSubmission #" + res.id + " (Task #" + taskId + ")");
L.adminPhoto(photo, "📄 New submission #" + res.id +
  "\nTask #" + taskId +
  "\nUser: " + user.id + " (@" + (user.username || "—") + ")" +
  "\nApprove: /subok " + res.id + " | Decline: /subno " + res.id);
