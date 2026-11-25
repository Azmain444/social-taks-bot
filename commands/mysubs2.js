/*CMD
  command: /mysubs2
CMD*/
// /mysubs2 — continuation of /mysubs.
var L = Libs.socialtaks;
var res = L.fbRes();
if (!res.ok) {
  Bot.sendMessage("⚠️ Database error: " + (res.error || "try again later."));
  return;
}
var vals = res.values || {};
var list = L.asList(vals["subs"]).filter(function (s) { return s.userId === user.id; });
var lines = ["📄 MY SUBMISSIONS\n"];
if (list.length === 0) {
  lines.push("No submissions yet.");
} else {
  list.slice(-10).reverse().forEach(function (s) {
    var t = L.getTaskFrom(vals["tasks"], s.taskId);
    var icon = s.status === "approved" ? "✅" : (s.status === "pending" ? "⏳" : "❌");
    lines.push(icon + " #" + s.id + " (" + (t ? t.title : "task " + s.taskId) + ") — " + s.status);
  });
}
lines.push("\n⏳ pending  ✅ approved  ❌ rejected");
Bot.sendInlineKeyboard(
  [[{ title: "👤 My Profile", command: "/profile" }]],
  lines.join("\n")
);
