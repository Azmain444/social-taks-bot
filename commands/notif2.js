/*CMD
  command: /notif2
CMD*/
// /notif2 — toggle announcements
var s = {};
try { s = JSON.parse(User.getProperty("notif") || "{}"); } catch (e) {}
s.ann = (s.ann === false);
User.setProperty("notif", JSON.stringify(s), "string");
Bot.runCommand("/notif");
