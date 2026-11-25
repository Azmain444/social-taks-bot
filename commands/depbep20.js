/*CMD
  command: /depbep20
CMD*/
// /depbep20 — BEP20 deposit: ask the amount first
User.setProperty("await", "dep_amount", "string");
User.setProperty("dep_method", "bep20", "string");
Bot.sendInlineKeyboard(
  [[{ title: "❌ Cancel", command: "/deposit" }]],
  "💰 USDT BEP20 WALLET DEPOSIT\n\nHow much would you like to deposit?\nSend the amount in USDT.\n\nMinimum: 0.01 USDT"
);
