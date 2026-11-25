/*CMD
  command: /notif3
CMD*/
// /notif3 — toggle check-in reminders
var s = {};
try { s = JSON.parse(User.getProperty("notif") || "{}"); } catch (e) {}
s.checkin = (s.checkin === false);
User.setProperty("notif", JSON.stringify(s), "string");
Bot.runCommand("/notif");
