/*CMD
  command: *
CMD*/
// * — catch-all: handles plain-text replies and photos for the
// multi-step flows (X connect, proof, deposit, withdraw, create
// task). Commands (starting with /) never reach this file.
// Firebase reads/writes go through the bridge; their continuations
// live in /star2, /star3, /star4 (fb_ctx "tag" says which step).
var L = Libs.socialtaks;
var awaitState = User.getProperty("await") || "";

// ---------- PHOTOS ----------
if (message.photo) {
  var fileId = message.photo[message.photo.length - 1].file_id;

  if (awaitState === "x_photo") {
    var xname = User.getProperty("x_username") || "";
    User.setProperty("await", "", "string");
    User.setProperty("x_photo_id", fileId, "string");
    L.fbCreate("accounts",
      { userId: user.id, username: xname, photo: fileId, status: "pending" },
      "/star2", "x_photo");
    return;
  }

  if (awaitState === "proof") {
    var photos = [];
    try { photos = JSON.parse(User.getProperty("proof_photos") || "[]"); } catch (e) {}
    photos.push(fileId);
    User.setProperty("proof_photos", JSON.stringify(photos), "string");
    Bot.sendInlineKeyboard([
      [{ title: "✅ Yes", command: "/proofyes" }, { title: "❌ No", command: "/proofno" }],
      [{ title: "➕ Add more photo", command: "/proofadd" }, { title: "🗑 Delete photo", command: "/proofdel" }],
      [{ title: "📤 Send to admin", command: "/proofsend" }, { title: "✖️ Cancel", command: "/proofcancel" }]
    ], "📸 Proof photo " + photos.length + " added.\n\nYou want to send it?");
    return;
  }

  if (awaitState === "dep_photo") {
    var method = User.getProperty("dep_method") || "bep20";
    var amount = parseFloat(User.getProperty("dep_amount") || "0");
    User.setProperty("await", "", "string");
    User.setProperty("dep_photo_id", fileId, "string");
    L.fbCreate("deps",
      { userId: user.id, method: method, amount: amount, photo: fileId, status: "pending" },
      "/star2", "dep_photo");
    return;
  }

  Bot.sendMessage("📸 Got your photo — use the menu to continue.");
  L.mainMenu();
  return;
}

// ---------- TEXT ----------
var text = (message.text || "").trim();
if (!text) return;

if (awaitState === "x_username") {
  if (text.indexOf(" ") !== -1 || text.length > 50) {
    Bot.sendMessage("❌ Enter a valid X username (without @, no spaces).");
    return;
  }
  User.setProperty("x_username", text.replace("@", ""), "string");
  User.setProperty("await", "x_photo", "string");
  Bot.sendMessage("📸 Send a screenshot of your profile showing your followers.\n\n⚠️ Minimum 20 followers required.");
  return;
}

if (awaitState === "ct_link") {
  if (text.indexOf("https://") !== 0) {
    Bot.sendMessage("❌ Send a full link starting with https:// — or /menu to cancel.");
    return;
  }
  User.setProperty("ct_link", text, "string");
  User.setProperty("await", "ct_count", "string");
  var action = User.getProperty("ct_action") || "like";
  var quality = User.getProperty("ct_quality") || "standard";
  var price = L.ACTION_PRICES[action] * (quality === "premium" ? 2.5 : 1);
  Bot.sendMessage("📦 HOW MANY?\n\nPrice per action: " + L.money(price) + " USDT\nMinimum: 3\n\nSend the number of actions you want (example: 50).");
  return;
}

if (awaitState === "ct_count") {
  var count = parseInt(text);
  if (isNaN(count)) { Bot.sendMessage("❌ Send a number, e.g. 50 — or /menu to cancel."); return; }
  if (count < 3) { Bot.sendMessage("❌ Minimum is 3 actions."); return; }
  User.setProperty("ct_count_val", String(count), "string");
  User.setProperty("await", "", "string");
  L.fbGet("users/" + user.id, "/star2", "ct_count");
  return;
}

if (awaitState === "dep_amount") {
  var amt = parseFloat(text);
  if (isNaN(amt)) { Bot.sendMessage("❌ Send the amount in USDT, e.g. 1.50 — or /menu to cancel."); return; }
  if (amt < L.MIN_DEPOSIT) { Bot.sendMessage("❌ Minimum deposit is " + L.money(L.MIN_DEPOSIT) + " USDT."); return; }
  var m = User.getProperty("dep_method") || "bep20";
  User.setProperty("dep_amount", String(amt), "string");
  User.setProperty("await", "dep_photo", "string");
  if (m === "bep20") {
    Bot.sendMessage("🏦 BEP20 WALLET DEPOSIT\n\n💰 Amount: " + L.money(amt) + " USDT\n🌐 Network: BEP20 (BNB Smart Chain)\n\n1️⃣ Send exactly " + L.money(amt) + " USDT to this address:\n" + L.DEPOSIT_ADDRESS + "\n(tap it to copy)\n\n⚠️ Use only the BEP20 network. Other networks are lost.\n\n2️⃣ Then send me the screenshot of the transfer.");
  } else {
    Bot.sendMessage("🟡 BINANCE PAY DEPOSIT\n\n💰 Amount: " + L.money(amt) + " USDT\n\n1️⃣ Open Binance → Pay → Send → enter this UID:\n" + L.BINANCE_UID + "\n(tap it to copy)\n\nSend exactly " + L.money(amt) + " USDT (no fee, Binance internal transfer).\n\n2️⃣ Then send me the screenshot of the transfer.");
  }
  return;
}

if (awaitState === "wd_bep20") {
  if (!L.validBep20(text)) {
    Bot.sendMessage("❌ That doesn't look like a BEP20 address. It must start with 0x and be 42 characters.");
    return;
  }
  User.setProperty("await", "wd_amount", "string");
  L.fbSet("users/" + user.id + "/bep20", text, "/fbnoop");
  Bot.sendMessage("✅ Address saved. Now type the amount to withdraw.");
  return;
}

if (awaitState === "wd_amount") {
  var wamt = parseFloat(text);
  if (isNaN(wamt)) { Bot.sendMessage("❌ Type a number, e.g. 1.50 — or /menu to cancel."); return; }
  User.setProperty("wd_amount_val", String(wamt), "string");
  User.setProperty("await", "", "string");
  L.fbGet("users/" + user.id, "/star2", "wd_amount");
  return;
}

// No pending input — show the menu
Bot.sendMessage("👋 Use the menu below to get started.");
L.mainMenu();
