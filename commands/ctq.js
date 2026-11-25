/*CMD
  command: /ctq
CMD*/
// /ctq <standard|premium> — save quality, ask for the link
User.setProperty("ct_quality", (params || "standard").trim(), "string");
User.setProperty("await", "ct_link", "string");
Bot.sendInlineKeyboard(
  [[{ title: "❌ Cancel", command: "/menu" }]],
  "🔗 SEND THE LINK\n\nSend the X link of your post or profile\n(full link starting with https://)"
);
