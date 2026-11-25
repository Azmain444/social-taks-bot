/*CMD
  command: /depbinance
CMD*/
// /depbinance — Binance Pay deposit: ask the amount first
User.setProperty("await", "dep_amount", "string");
User.setProperty("dep_method", "binance", "string");
Bot.sendInlineKeyboard(
  [[{ title: "❌ Cancel", command: "/deposit" }]],
  "💰 BINANCE PAY (UID) DEPOSIT\n\nHow much would you like to deposit?\nSend the amount in USDT.\n\nMinimum: 0.01 USDT"
);
