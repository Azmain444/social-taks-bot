/*CMD
  command: /help
CMD*/
// /help — Help + Contact Support
var L = Libs.socialtaks;
Bot.sendInlineKeyboard([
  [{ title: "💬 Contact Support", url: L.SUPPORT_URL }],
  [{ title: "🏠 Home", command: "/menu" }]
], "🆘 HELP\n\n" +
  "1️⃣ 🎯 Earn Money: open a task, do it, send screenshots.\n" +
  "2️⃣ Admin checks it. Approved = you get paid.\n" +
  "3️⃣ For X tasks, link your X account first.\n" +
  "4️⃣ 📝 Create Task: pay to grow your own page.\n" +
  "5️⃣ 💰 My Wallet: deposit and withdraw.\n" +
  "6️⃣ 👥 Invite Friends: earn bonus.");
