/*CMD
  command: /tasknext
CMD*/
// /tasknext — next task in the list
var idx = parseInt(User.getProperty("task_idx") || "0");
User.setProperty("task_idx", String(idx + 1), "string");
Bot.runCommand("/tasks");
