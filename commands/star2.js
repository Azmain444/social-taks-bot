/*CMD
  command: /star2
CMD*/
// /star2 — bridge continuation for star.js flows.
// fb_ctx "tag" tells which step just finished:
//   x_photo   — X account created, notify the admin
//   dep_photo — deposit created, notify the admin
//   ct_count  — user record read, check balance + create the task
//   wd_amount — user record read, check balance + create withdrawal
var L = Libs.socialtaks;
var res = L.fbRes();
var tag = L.fbCtx().tag || "";
if (!res.ok) {
  Bot.sendMessage("⚠️ Database error: " + (res.error || "try again later."));
  return;
}

if (tag === "x_photo") {
  var xname = User.getProperty("x_username") || "";
  var photo = User.getProperty("x_photo_id") || "";
  Bot.sendMessage("⏳ Your X account @" + xname + " is under review.\nYou'll be notified once the admin approves it.");
  L.adminPhoto(photo, "🔗 New X account to review (#" + res.id + ")" +
    "\nUser: " + user.id + " (@" + (user.username || "—") + ")" +
    "\nX username: @" + xname +
    "\n(min 20 followers required)" +
    "\nApprove: /accok " + res.id + " | Decline: /accno " + res.id);
  return;
}

if (tag === "dep_photo") {
  var method = User.getProperty("dep_method") || "bep20";
  var amount = parseFloat(User.getProperty("dep_amount") || "0");
  var dphoto = User.getProperty("dep_photo_id") || "";
  Bot.sendMessage("✅ Screenshot received! Deposit #" + res.id + " is under review.\nThe admin will check it and credit your balance.");
  L.adminPhoto(dphoto, "💰 Deposit #" + res.id + " to review" +
    "\nMethod: " + method + " | Amount: " + L.money(amount) + " USDT" +
    "\nUser: " + user.id + " (@" + (user.username || "—") + ")" +
    "\nApprove: /depok " + res.id + " | Decline: /depno " + res.id);
  return;
}

if (tag === "ct_count") {
  var me = res.value;
  if (!me) { Bot.sendMessage("⚠️ User not found. Send /start first."); return; }
  var act = User.getProperty("ct_action") || "like";
  var q = User.getProperty("ct_quality") || "standard";
  var count = parseInt(User.getProperty("ct_count_val") || "0");
  // 3-decimal money (spec §3): a premium price like 0.015 x 2.5 =
  // 0.0375 is stored as 0.038, exactly like the admin panel rounds.
  var unit = Math.round(L.ACTION_PRICES[act] * (q === "premium" ? 2.5 : 1) * 1000) / 1000;
  var total = Math.round(unit * count * 10000) / 10000;
  if (L.totalBal(me) < total - 0.000000001) {
    Bot.sendInlineKeyboard([
      [{ title: "📥 Deposit", command: "/deposit" }],
      [{ title: "❌ Cancel", command: "/menu" }]
    ], "❌ Not enough balance.\nNeeded: " + L.money(total) + " USDT\nYou have: " + L.money(L.totalBal(me)) + " USDT");
    return;
  }
  var debited = L.debitTotal(me, total);
  User.setProperty("ct_user", JSON.stringify(debited), "string");
  User.setProperty("ct_total", String(total), "string");
  // Spec-format task (ADMIN_PANEL_SPEC.md §3). Reward is the price
  // actually charged (premium x2.5 included), like the TPY bot.
  L.fbCreate("tasks",
    { action: act, link: User.getProperty("ct_link"), reward: unit,
      slots: count, used: 0, status: "active",
      creator: user.id, premium: q === "premium", platform: "x" },
    "/star3", "ct_created");
  return;
}

if (tag === "wd_amount") {
  var wu = res.value;
  if (!wu) { Bot.sendMessage("⚠️ User not found. Send /start first."); return; }
  var wamt = parseFloat(User.getProperty("wd_amount_val") || "0");
  var fee = L.WITHDRAW_FEE;
  var totalNeed = wamt + fee;
  if (wamt < L.WITHDRAW_MIN) { Bot.sendMessage("❌ Minimum withdrawal is " + L.money(L.WITHDRAW_MIN) + " USDT."); return; }
  if (L.totalBal(wu) < totalNeed - 0.000000001) {
    Bot.sendMessage("❌ Not enough balance. You have " + L.money(L.totalBal(wu)) + " USDT (need " + L.money(totalNeed) + " with fee).");
    return;
  }
  var wdebited = L.debitTotal(wu, totalNeed);
  User.setProperty("wd_user", JSON.stringify(wdebited), "string");
  User.setProperty("wd_fee", String(fee), "string");
  L.fbCreate("wds",
    { userId: user.id, amount: wamt, fee: fee, address: wu.bep20 || "", status: "pending" },
    "/star3", "wd_created");
  return;
}
