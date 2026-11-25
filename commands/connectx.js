/*CMD
  command: /connectx
CMD*/
// /connectx — start X account connect: ask for the username
User.setProperty("await", "x_username", "string");
Bot.sendInlineKeyboard(
  [[{ title: "❌ Cancel", command: "/earn" }]],
  "🔗 Connect Your X Account\n\nEnter your X account's username (without @):"
);
