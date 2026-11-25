/*CMD
  command: /notif1
CMD*/
// /notif1 — toggle new-task alerts
var s = {};
try { s = JSON.parse(User.getProperty("notif") || "{}"); } catch (e) {}
s.newTask = (s.newTask === false);
User.setProperty("notif", JSON.stringify(s), "string");
Bot.runCommand("/notif");
