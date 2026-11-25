/*CMD
  command: /taskfilter
CMD*/
// /taskfilter — cycle the platform filter: ALL → X → TG → IG
var order = ["ALL", "X", "TG", "IG"];
var cur = User.getProperty("task_filter") || "ALL";
var nxt = order[(order.indexOf(cur) + 1) % order.length];
User.setProperty("task_filter", nxt, "string");
User.setProperty("task_idx", "0", "string");
Bot.runCommand("/tasks");
