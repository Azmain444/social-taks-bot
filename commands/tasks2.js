/*CMD
  command: /tasks2
CMD*/
// /tasks2 — continuation of /tasks: render the task card.
var L = Libs.socialtaks;
var res = L.fbRes();
if (!res.ok) {
  Bot.sendMessage("⚠️ Database error: " + (res.error || "try again later."));
  return;
}
var filter = User.getProperty("task_filter") || "ALL";
var idx = parseInt(User.getProperty("task_idx") || "0");
var vals = res.values || {};
var all = L.tasksList(vals["tasks"], filter);
if (all.length === 0) {
  Bot.sendInlineKeyboard([
    [{ title: "🔄 Platform: " + filter, command: "/taskfilter" }],
    [{ title: "🏠 Home", command: "/menu" }]
  ], "😔 NO TASKS RIGHT NOW\n\nPlatform filter: " + filter + "\nNew tasks arrive often. You will get a notification!");
} else {
  idx = ((idx % all.length) + all.length) % all.length;
  User.setProperty("task_idx", String(idx), "string");
  var t = all[idx];
  Bot.sendInlineKeyboard([
    [{ title: "🔗 Open Task", url: t.link || t.url }],
    [{ title: "📸 Submit Proof", command: "/proof " + t.id },
     { title: "⏭ Next Task", command: "/tasknext" }],
    [{ title: "🔄 Platform: " + filter, command: "/taskfilter" },
     { title: "🏠 Home", command: "/menu" }]
  ], L.taskText(t));
}
