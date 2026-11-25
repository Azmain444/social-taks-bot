/*CMD
  command: /proof2
CMD*/
// /proof2 — continuation of /proof.
var L = Libs.socialtaks;
var res = L.fbRes();
if (!res.ok) {
  Bot.sendMessage("⚠️ Database error: " + (res.error || "try again later."));
  return;
}
var taskId = parseInt(User.getProperty("proof_task") || "0");
var list = L.asList(res.value);
for (var i = 0; i < list.length; i++) {
  if (list[i].userId === user.id && list[i].taskId === taskId && list[i].status === "pending") {
    Bot.sendMessage("⏳ You already have a pending submission for this task.");
    return;
  }
}
User.setProperty("await", "proof", "string");
User.setProperty("proof_photos", "[]", "string");
Bot.sendInlineKeyboard(
  [[{ title: "❌ Cancel", command: "/tasks" }]],
  "📸 Submit Proof\n\nSend your proof screenshot(s) now."
);
