/*CMD
  command: /deposit
CMD*/
// /deposit — Binance Pay (UID) or USDT BEP20 only (no xRocket)
Bot.sendInlineKeyboard([
  [{ title: "🟡 Binance Pay (UID)", command: "/depbinance" }],
  [{ title: "🏦 USDT BEP20 Wallet", command: "/depbep20" }],
  [{ title: "💰 My Wallet", command: "/wallet" }]
], "📥 DEPOSIT\n\nChoose how you want to deposit:\n🟡 Binance Pay: send USDT to the Binance UID, checked by admin\n🏦 USDT BEP20 Wallet: checked by admin");
