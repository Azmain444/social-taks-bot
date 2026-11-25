/*CMD
  command: /notif
CMD*/
// /notif — notification toggles (stored per user)
var s = {};
try { s = JSON.parse(User.getProperty("notif") || "{}"); } catch (e) {}
var on = function (v) { return v === false ? "🔕 OFF" : "🔔 ON"; };
Bot.sendInlineKeyboard([
  [{ title: "🆕 New task alerts: " + on(s.newTask), command: "/notif1" }],
  [{ title: "📢 Announcements: " + on(s.ann), command: "/notif2" }],
  [{ title: "📅 Check-in reminders: " + on(s.checkin), command: "/notif3" }],
  [{ title: "👤 My Profile", command: "/profile" }]
], "🔔 Notification Settings\n\nTap any item to turn it on or off.");
