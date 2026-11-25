/*CMD
  command: /notify2
CMD*/
// /notify2 — continuation of /notify: send the caller's pending
// notifications and mark them sent (max 10 per call — run /notify
// again if there are more).
var L = Libs.socialtaks;
var res = L.fbRes();
if (!res.ok) {
  Bot.sendMessage("⚠️ Database error: " + (res.error || "try again later."));
  return;
}
var all = L.asObj(res.value);
var mine = [];
for (var id in all) {
  var n = all[id];
  if (n && String(n.userId) === String(user.id) && n.status === "pending") {
    mine.push({ id: id, text: String(n.text || "") });
  }
}
if (mine.length === 0) {
  Bot.sendMessage("🔔 No new notifications.");
  return;
}
var writes = {};
var shown = mine.slice(0, 10);
shown.forEach(function (m) {
  if (m.text) Bot.sendMessage(m.text);
  writes["notifs/" + m.id + "/status"] = "sent";
});
L.fbBatch(writes, "/fbnoop");
if (mine.length > 10) {
  Bot.sendMessage("…and " + (mine.length - 10) + " more — run /notify again to see them.");
}
