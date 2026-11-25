/*CMD
  command: /create
CMD*/
// /create — Create Task (X / Twitter only)
Bot.sendInlineKeyboard([
  [{ title: "🐦 X (Twitter)", command: "/ctact_choose" }],
  [{ title: "🏠 Home", command: "/menu" }]
], "📝 CREATE TASK\n\nWhat would you like to boost?");
