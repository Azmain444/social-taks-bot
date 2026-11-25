/*CMD
  command: /ctact_choose
CMD*/
// /ctact_choose — pick an X action (create-task flow)
Bot.sendInlineKeyboard([
  [{ title: "👍 Like • $0.015", command: "/ctact like" }],
  [{ title: "💬 Comment • $0.025", command: "/ctact comment" }],
  [{ title: "➕ Follow • $0.015", command: "/ctact follow" }],
  [{ title: "🔁 Retweet • $0.015", command: "/ctact retweet" }],
  [{ title: "🔖 Bookmark • $0.015", command: "/ctact bookmark" }],
  [{ title: "↩️ Back", command: "/create" }, { title: "❌ Cancel", command: "/menu" }]
], "🐦 X (TWITTER) TASKS\n\nTap an action. The price shown is per action.");
