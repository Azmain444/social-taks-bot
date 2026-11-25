// ============================================================
// SOCIAL TAKS — shared library for bots.business (BJS) + Firebase
// Library name in bots.business:  socialtaks
// Call it from any command as:    Libs.socialtaks.functionName(...)
// ------------------------------------------------------------
// STORAGE: Firebase Realtime Database, through the Vercel
// bridge (see ../api/bridge.js). BJS can only call
// external HTTP (HTTP.get with a success command, or the older
// ->(url) scenario download), so every Firebase read/write is
// ASYNC: the library issues the HTTP call, the bridge answers,
// and the success command /fbok runs the continuation command
// stored in User property "fb_ctx". The response body lands in
// User property "fb_res" (parsed with L.fbRes()).
//
//   L.fbGet("users/123", "/start2")        // read, then run /start2
//   L.fbMulti(["users/123","tasks"], "/x2")// several reads, one call
//   L.fbSet("users/123", obj, "/fbnoop")  // write, no continuation
//   L.fbBatch({p1:v1, p2:v2}, "/x2")       // several writes, one call
//   L.fbCreate("subs", obj, "/x2")         // new sequential id
//
// ⚠️ SET THESE TWO VALUES FIRST (see SETUP.md):
//   BRIDGE_URL — your deployed Vercel function URL, e.g.
//                https://social-taks-vercell.vercel.app/api/bridge
//   BRIDGE_KEY — the BRIDGE_SECRET you set in Vercel's
//                Environment Variables. Never paste it in a chat
//                or screenshot.
// ------------------------------------------------------------
// DATA SHAPE in Firebase — the SPEC format (ADMIN_PANEL_SPEC.md §3),
// shared with the admin panel website. The Vercel bridge normalizes
// reads to this shape, and this library tolerates the old format too:
//   /users/{tgId}:   {id, username, first_name, earnings, deposit,
//                     ref_by, ref_count, ref_earnings, approved_tasks,
//                     x_approved, verified, bep20}
//                     (firstName/referrer/referralEarnings are kept
//                     as aliases so older code keeps working)
//   /tasks/{id}:     {id, platform:"x", action, link, reward, slots,
//                     used, status:"active"|"paused", creator, premium}
//   /accounts/{id}:  {id, userId, username, photo, status}
//   /subs/{id}:      {id, userId, taskId, photos[], status, reward}
//   /deps/{id}:      {id, userId, method, amount, photo, status}
//   /wds/{id}:       {id, userId, amount, fee, address, status}
//   /notifs/{id}:    {userId, text, status:"pending"|"sent"|"failed"}
//   /settings:       {referral:{joinBonus, pct}, prizes:[10 numbers]}
//   /seq:            {task, account, sub, dep, wd, notif}
// ------------------------------------------------------------
// SYNC FIXES (2026-11-25):
// * Task listing accepts BOTH the spec format and the old seed
//   format (active/slotsLeft/slotsTotal/url/title/quality) — the
//   admin panel's tasks were invisible before because the filter
//   only knew the old fields. normalizeTask() is the single place
//   that maps one to the other.
// * Firebase returns dense integer-keyed collections as JSON arrays
//   ([null, {...}, {...}]) — asObj() now accepts arrays too, and the
//   Vercel bridge normalizes them before they reach the bot.
// * Referral bonus / percent and leaderboard prizes come from
//   /settings (loadSettings, defaults = today's values) so the
//   admin panel's editors sync to the bot live.
// * clearAwait() cancels any in-progress multi-step flow — call it
//   first in /menu, /start and /wallet (the Cancel fix).
// ============================================================

var ADMIN_ID = 6877438123;
var BOT_USERNAME = "bots_test1ng_bot";
var CHANNEL = "@test9191929";
var CHANNEL_URL = "https://t.me/test9191929";
var SUPPORT_URL = "https://t.me/QolbyXov";
var BINANCE_UID = "835989986";
var DEPOSIT_ADDRESS = "0xfE0c7f078E2F045164c3cC8e462bba67730D5584";

// ⚠️ FILL THESE IN (SETUP.md steps 2–4). Placeholders only —
// never put a real secret in a file that leaves your computer.
var BRIDGE_URL = "https://social-taks-vercell.vercel.app/api/bridge";
var BRIDGE_KEY = "48265094d959909fbe70fb4bcac5893ceedb7bac8e482e47c532819e9d87f845";

var JOIN_BONUS = 0.002;
var REFERRAL_RATE = 0.15;
var MIN_DEPOSIT = 0.01;
var WITHDRAW_MIN = 0.05;
var WITHDRAW_FEE = 0.01;
var WITHDRAW_TASKS_NEEDED = 2;

var ACTION_PRICES = { like: 0.015, comment: 0.025, follow: 0.015, retweet: 0.015, bookmark: 0.015 };

// Settings live in /settings (editable from the admin panel website).
// Defaults equal today's hardcoded values, so the bot keeps working
// exactly as before when /settings is absent.
var DEFAULT_SETTINGS = {
  referral: { joinBonus: JOIN_BONUS, pct: 15 },
  prizes: [0.5, 0.4, 0.3, 0, 0, 0, 0, 0, 0, 0]
};

// Read /settings (the raw node value, or null) merged over the
// defaults. Any failure, or any missing/partial field, falls back to
// its default — the bot must never break because settings are absent.
function loadSettings(settingsObj) {
  var out = {
    referral: { joinBonus: DEFAULT_SETTINGS.referral.joinBonus, pct: DEFAULT_SETTINGS.referral.pct },
    prizes: DEFAULT_SETTINGS.prizes.slice()
  };
  var s = (settingsObj && typeof settingsObj === "object" && !Array.isArray(settingsObj)) ? settingsObj : {};
  var r = s.referral;
  if (r && typeof r === "object") {
    var jb = Number(r.joinBonus);
    if (!isNaN(jb) && jb >= 0) out.referral.joinBonus = jb;
    var pc = Number(r.pct);
    if (!isNaN(pc) && pc >= 0) out.referral.pct = pc;
  }
  var pr = s.prizes;
  if (Array.isArray(pr) && pr.length === 10) {
    var arr = [], ok = true;
    for (var i = 0; i < 10; i++) {
      var v = Number(pr[i]);
      if (isNaN(v) || v < 0) { ok = false; break; }
      arr.push(v);
    }
    if (ok) out.prizes = arr;
  }
  return out;
}

// ---------- JSON / money helpers (same names as the old library) ----------
function _j(s) { try { return s ? JSON.parse(s) : {}; } catch (e) { return {}; } }
function _ja(s) { try { return s ? JSON.parse(s) : []; } catch (e) { return []; } }
function _s(o) { return JSON.stringify(o); }
function money(v) { return (Math.round(v * 100) / 100).toFixed(2); }
// 3-decimal money for task rewards (0.012 must show as 0.012, not
// 0.01) — same trimming as the admin panel preview.
function money3(v) {
  var f = Math.round((Number(v) || 0) * 1000) / 1000;
  var s = f.toFixed(3).replace(/\.?0+$/, "");
  return s === "" || s === "-0" ? "0" : s;
}
function totalBal(u) { return (u.earnings || 0) + (u.deposit || 0); }
function validBep20(a) {
  if (!a || a.length !== 42 || a.slice(0, 2) !== "0x") return false;
  for (var i = 2; i < a.length; i++) {
    if ("0123456789abcdefABCDEF".indexOf(a[i]) === -1) return false;
  }
  return true;
}

// ---------- bridge calls ----------
// All of these are async: they store the continuation command in
// User property "fb_ctx", fire HTTP.get, and return immediately.
// On success BJS runs /fbok, which parses `content` into User
// property "fb_res" and runs the continuation command.
// On failure BJS runs /fberr, which tells the user to retry.
function fbCall(url, next, tag) {
  User.setProperty("fb_ctx", _s({ next: next, tag: tag || "" }), "string");
  HTTP.get({
    url: url,
    // NOTE: the spelling "folow_redirects" (one "l") is the real
    // BJS option name — do not "fix" it. It stays true; the
    // Vercel function answers directly with no redirect, so the
    // option is harmless here. (The old Apps Script /exec URL
    // redirected to a one-time script.googleusercontent.com URL,
    // which is why the option mattered there.)
    folow_redirects: true,
    success: "/fbok",
    error: "/fberr"
  });
}

// The single function endpoint takes the operation as a query
// param: ?op=get&key=...&path=...
// (The old Worker used a path: BRIDGE_URL + "/get?key=...".)
function fbUrl(op, params) {
  var q = "key=" + encodeURIComponent(BRIDGE_KEY);
  for (var k in params) q += "&" + k + "=" + encodeURIComponent(params[k]);
  return BRIDGE_URL + "?op=" + op + "&" + q;
}

function fbGet(path, next, tag) {
  fbCall(fbUrl("get", { path: path }), next, tag);
}

function fbMulti(paths, next, tag) {
  fbCall(fbUrl("multi", { paths: paths.join(",") }), next, tag);
}

function fbSet(path, value, next, tag) {
  fbCall(fbUrl("set", { path: path, value: _s(value) }), next || "/fbnoop", tag);
}

function fbBatch(map, next, tag) {
  fbCall(fbUrl("batch", { value: _s(map) }), next || "/fbnoop", tag);
}

function fbCreate(collection, value, next, tag) {
  fbCall(fbUrl("create", { collection: collection, value: _s(value) }), next, tag);
}

function fbSeq(kind, next, tag) {
  fbCall(fbUrl("seq", { kind: kind }), next, tag);
}

// Parsed bridge response from the last /fbok: {ok, value|values|id, error}
function fbRes() {
  return _j(User.getProperty("fb_res"));
}

function fbCtx() {
  return _j(User.getProperty("fb_ctx"));
}

// ---------- pure data helpers (work on plain JS objects) ----------
// Firebase returns objects keyed by id (or null when empty) — but
// dense integer-keyed collections come back as JSON ARRAYS
// ([null, {...}, {...}]). Accept both: arrays become objects keyed
// by each record's id (null slots dropped).
function asObj(v) {
  if (Array.isArray(v)) {
    var out = {};
    for (var i = 0; i < v.length; i++) {
      var it = v[i];
      if (it === null || it === undefined) continue;
      var key = (it && typeof it === "object" && it.id !== undefined && it.id !== null)
        ? String(it.id) : String(i);
      out[key] = it;
    }
    return out;
  }
  return (v && typeof v === "object") ? v : {};
}
function asList(obj) {
  var arr = [];
  obj = asObj(obj);
  for (var id in obj) { var it = obj[id]; it.id = parseInt(id); arr.push(it); }
  arr.sort(function (a, b) { return a.id - b.id; });
  return arr;
}

function getUserFrom(all, id) { return asObj(all)[String(id)] || null; }

// Canonical SPEC task (ADMIN_PANEL_SPEC.md §3). Accepts both the
// spec format and the old seed/bot format, and keeps the old fields
// as aliases so older code keeps working. Returns a NEW object.
function normalizeTask(t) {
  if (!t || typeof t !== "object") return null;
  var slots = (t.slots !== undefined && t.slots !== null)
    ? t.slots
    : (t.slotsTotal !== undefined && t.slotsTotal !== null
      ? t.slotsTotal
      : (t.slotsLeft !== undefined && t.slotsLeft !== null
        ? (Number(t.slotsLeft) || 0) + ((t.used !== undefined && t.used !== null) ? (Number(t.used) || 0) : 0)
        : 0));
  var used = (t.used !== undefined && t.used !== null)
    ? t.used
    : ((t.slotsTotal !== undefined && t.slotsLeft !== undefined)
      ? (t.slotsTotal - t.slotsLeft) : 0);
  var status = t.status || (t.active ? "active" : "paused");
  var link = t.link || t.url || "";
  var premium = (t.premium !== undefined) ? !!t.premium : (t.quality === "premium");
  var nSlots = Number(slots) || 0;
  var nUsed = Number(used) || 0;
  var out = {
    id: t.id,
    platform: String(t.platform || "x").toLowerCase(),
    action: String(t.action || "").toLowerCase(),
    link: link,
    url: link, // legacy alias
    reward: Number(t.reward) || 0,
    slots: nSlots,
    used: nUsed,
    slotsTotal: nSlots, // legacy alias
    slotsLeft: Math.max(0, nSlots - nUsed), // legacy alias
    status: status,
    active: status === "active" ? 1 : 0, // legacy alias
    premium: premium,
    quality: premium ? "premium" : "standard" // legacy alias
  };
  if (t.creator !== undefined) out.creator = t.creator;
  if (t.title) out.title = t.title;
  return out;
}

// Cancel any in-progress multi-step flow (X connect, proof, deposit,
// withdraw, create task). Called FIRST by /menu, /start and /wallet
// so Cancel / Home truly cancels — the await state must not survive
// a trip back to the menu. Flow scratch props are cleared too;
// task_filter / task_idx (preferences) are deliberately kept.
var AWAIT_SCRATCH = ["await", "x_username", "x_photo_id",
  "proof_photos", "proof_task", "proof_first_photo", "proof_task_id",
  "dep_method", "dep_amount", "dep_photo_id",
  "ct_action", "ct_quality", "ct_link", "ct_count_val", "ct_user", "ct_total",
  "wd_amount_val", "wd_user", "wd_fee"];
function clearAwait() {
  for (var i = 0; i < AWAIT_SCRATCH.length; i++) {
    try { User.setProperty(AWAIT_SCRATCH[i], "", "string"); } catch (e) {}
  }
}

// Register-or-update a user inside a /users object (pure — caller
// writes the object back with fbSet/fbBatch). Applies the joining
// bonus from /settings to the referrer when a new user joins via
// ref link. Writes BOTH field spellings (first_name/firstName,
// ref_by/referrer, ref_earnings/referralEarnings) so the admin
// panel website and the bot read the same record.
function ensureUserData(all, id, username, firstName, referrerId, settings) {
  all = asObj(all);
  var st = loadSettings(settings && settings.referral ? settings : null);
  var bonus = st.referral.joinBonus;
  var u = all[String(id)];
  if (!u) {
    u = { id: id, username: username || "", firstName: firstName || "",
          first_name: firstName || "",
          earnings: 0, deposit: 0, referralEarnings: 0, ref_earnings: 0,
          ref_count: 0, approved_tasks: 0, bep20: "",
          referrer: 0, ref_by: null, verified: 0, x_approved: false };
    if (referrerId && referrerId !== id && all[String(referrerId)]) {
      u.referrer = referrerId;
      u.ref_by = referrerId;
      var r = all[String(referrerId)];
      r.earnings = (r.earnings || 0) + bonus;
      r.referralEarnings = (r.referralEarnings || 0) + bonus;
      r.ref_earnings = (r.ref_earnings || 0) + bonus;
      r.ref_count = (r.ref_count || 0) + 1;
      all[String(referrerId)] = r;
    }
    all[String(id)] = u;
  } else {
    u.username = username || u.username;
    u.firstName = firstName || u.firstName;
    u.first_name = firstName || u.first_name || u.firstName;
    if (u.referrer && !u.ref_by) u.ref_by = u.referrer;
    if (u.ref_by && !u.referrer) u.referrer = u.ref_by;
    all[String(id)] = u;
  }
  return { users: all, user: u };
}

function getTaskFrom(tasksObj, id) {
  var t = asObj(tasksObj)[String(id)] || null;
  return t ? normalizeTask(t) : null;
}

function tasksList(tasksObj, filter) {
  var f = String(filter || "ALL").toLowerCase();
  return asList(tasksObj).map(function (t) { return normalizeTask(t); }).filter(function (t) {
    return t && t.status === "active" && (t.slots - t.used) > 0 &&
      (f === "all" || t.platform === f);
  });
}

function approvedAccountFrom(accountsObj, uid) {
  var list = asList(accountsObj);
  for (var i = list.length - 1; i >= 0; i--) {
    if (list[i].userId === uid && list[i].status === "approved") return list[i];
  }
  return null;
}

function approvedTaskCountFrom(subsObj, uid) {
  var n = 0;
  var list = asList(subsObj);
  for (var i = 0; i < list.length; i++) {
    if (list[i].userId === uid && list[i].status === "approved") n++;
  }
  return n;
}

function referralStatsFrom(usersObj, uid) {
  var all = asObj(usersObj), count = 0;
  for (var id in all) {
    if (all[id].referrer === uid || all[id].ref_by === uid) count++;
  }
  var me = all[String(uid)];
  var earned = me ? (me.referralEarnings || me.ref_earnings || 0) : 0;
  return { count: count, earned: earned };
}

// Leaderboard: approved task rewards per user (top 10).
// NOTE: Firebase stores no timestamps on subs in this version, so
// this is all-time earnings ranked — the weekly window is applied
// by the admin when paying the #1 / #2 / #3 bonus. A submission's
// own reward is used when present (spec subs carry it), else the
// task's reward.
function leaderboardFrom(subsObj, tasksObj, usersObj) {
  var totals = {};
  var list = asList(subsObj);
  for (var i = 0; i < list.length; i++) {
    if (list[i].status !== "approved") continue;
    var rw = (list[i].reward !== undefined && list[i].reward !== null)
      ? Number(list[i].reward)
      : (function () { var t = getTaskFrom(tasksObj, list[i].taskId); return t ? t.reward : 0; })();
    totals[list[i].userId] = (totals[list[i].userId] || 0) + rw;
  }
  var rows = [];
  var all = asObj(usersObj);
  for (var uid in totals) {
    var u = all[String(uid)];
    rows.push({ id: uid, name: (u && (u.username || u.firstName || u.first_name)) || String(uid), earned: totals[uid] });
  }
  rows.sort(function (a, b) { return b.earned - a.earned; });
  return rows.slice(0, 10);
}

// Approve a submission (pure): marks it approved, uses one task
// slot, credits the reward to the user and the referral percent
// (from /settings) to their referrer.
// The reward comes from the submission itself when present (spec
// subs carry it — same rule the admin panel uses), else the task.
// Slots are consumed in BOTH spellings (used + 1, slotsLeft - 1)
// so spec readers and legacy readers agree.
// Returns {subs, tasks, users, reward} or null if not pending.
function approveSubmissionData(subsObj, tasksObj, usersObj, subId, settings) {
  var subs = asObj(subsObj), tasks = asObj(tasksObj), users = asObj(usersObj);
  var sub = subs[String(subId)];
  if (!sub || sub.status !== "pending") return null;
  sub.status = "approved";
  subs[String(subId)] = sub;
  var t = tasks[String(sub.taskId)];
  var nt = t ? normalizeTask(t) : null;
  var reward = (sub.reward !== undefined && sub.reward !== null)
    ? Number(sub.reward) : (nt ? nt.reward : 0);
  if (t && nt) {
    t.used = nt.used + 1;
    t.slotsLeft = Math.max(0, nt.slotsLeft - 1);
    tasks[String(sub.taskId)] = t;
  }
  var st = loadSettings(settings && settings.referral ? settings : null);
  var rate = st.referral.pct / 100;
  var u = users[String(sub.userId)];
  if (u) {
    u.earnings = (u.earnings || 0) + reward;
    u.approved_tasks = (u.approved_tasks || 0) + 1;
    users[String(sub.userId)] = u;
    var refId = u.referrer || u.ref_by;
    if (refId) {
      var r = users[String(refId)];
      if (r) {
        var fee = Math.round(reward * rate * 10000) / 10000;
        r.earnings = (r.earnings || 0) + fee;
        r.referralEarnings = (r.referralEarnings || 0) + fee;
        r.ref_earnings = (r.ref_earnings || 0) + fee;
        users[String(refId)] = r;
      }
    }
  }
  return { subs: subs, tasks: tasks, users: users, reward: reward };
}

// ---------- messaging ----------
function mainMenu() {
  Bot.sendInlineKeyboard([
    [{ title: "🎯 Earn Money", command: "/earn" }],
    [{ title: "📝 Create Task", command: "/create" }, { title: "💰 My Wallet", command: "/wallet" }],
    [{ title: "👤 My Profile", command: "/profile" }, { title: "👥 Invite Friends", command: "/invite" }],
    [{ title: "🏆 Leaderboard", command: "/board" }, { title: "🆘 Help & Support", command: "/help" }]
  ], "🏠 MAIN MENU\n👇 Choose an option");
}

function adminMsg(text) {
  try { Api.sendMessage({ chat_id: ADMIN_ID, text: text }); }
  catch (e) { /* admin must /start the bot once */ }
}

// Send a user's photo to the admin (falls back to just the file_id text).
function adminPhoto(fileId, caption) {
  try {
    Api.sendPhoto({ chat_id: ADMIN_ID, photo: fileId, caption: caption });
  } catch (e) {
    adminMsg(caption + "\n(Photo file_id: " + fileId + ")");
  }
}

function userMsg(uid, text) {
  try { Api.sendMessage({ chat_id: uid, text: text }); }
  catch (e) { /* user blocked the bot */ }
}

// Task card — EXACTLY the format the admin panel shows in its
// Add Task preview (ADMIN_PANEL_SPEC.md §6.3), so what the admin
// sees is what users see in the bot.
function taskText(t) {
  var nt = normalizeTask(t) || t;
  var left = (nt.slots || 0) - (nt.used || 0);
  var action = String(nt.action || "");
  action = action.charAt(0).toUpperCase() + action.slice(1);
  var txt = "📌 TASK #" + nt.id + "\n\n" +
    "Platform: X (Twitter)\n" +
    "Action: " + action + "\n" +
    "Link: " + (nt.link || "") + "\n" +
    "Reward: " + money3(nt.reward) + " USDT\n" +
    "Slots left: " + left + " of " + (nt.slots || 0);
  if (nt.premium) txt += "\n⭐ Premium task";
  return txt;
}

// Pay from deposit first, then earnings. Returns the updated user
// object, or null when the balance is too low.
function debitTotal(u, amount) {
  var bal = totalBal(u);
  if (bal < amount - 0.000000001) return null;
  var fromDep = Math.min(u.deposit || 0, amount);
  u.deposit = (u.deposit || 0) - fromDep;
  u.earnings = (u.earnings || 0) - (amount - fromDep);
  return u;
}


// Git import: expose every function/constant commands use as Libs.socialtaks.*
publish({
  loadSettings: loadSettings,
  _j: _j,
  _ja: _ja,
  _s: _s,
  money: money,
  money3: money3,
  totalBal: totalBal,
  validBep20: validBep20,
  fbCall: fbCall,
  fbUrl: fbUrl,
  fbGet: fbGet,
  fbMulti: fbMulti,
  fbSet: fbSet,
  fbBatch: fbBatch,
  fbCreate: fbCreate,
  fbSeq: fbSeq,
  fbRes: fbRes,
  fbCtx: fbCtx,
  asObj: asObj,
  asList: asList,
  getUserFrom: getUserFrom,
  normalizeTask: normalizeTask,
  clearAwait: clearAwait,
  ensureUserData: ensureUserData,
  getTaskFrom: getTaskFrom,
  tasksList: tasksList,
  approvedAccountFrom: approvedAccountFrom,
  approvedTaskCountFrom: approvedTaskCountFrom,
  referralStatsFrom: referralStatsFrom,
  leaderboardFrom: leaderboardFrom,
  approveSubmissionData: approveSubmissionData,
  mainMenu: mainMenu,
  adminMsg: adminMsg,
  adminPhoto: adminPhoto,
  userMsg: userMsg,
  taskText: taskText,
  debitTotal: debitTotal,
  ADMIN_ID: ADMIN_ID,
  BOT_USERNAME: BOT_USERNAME,
  CHANNEL: CHANNEL,
  CHANNEL_URL: CHANNEL_URL,
  SUPPORT_URL: SUPPORT_URL,
  BINANCE_UID: BINANCE_UID,
  DEPOSIT_ADDRESS: DEPOSIT_ADDRESS,
  BRIDGE_URL: BRIDGE_URL,
  BRIDGE_KEY: BRIDGE_KEY,
  JOIN_BONUS: JOIN_BONUS,
  REFERRAL_RATE: REFERRAL_RATE,
  MIN_DEPOSIT: MIN_DEPOSIT,
  WITHDRAW_MIN: WITHDRAW_MIN,
  WITHDRAW_FEE: WITHDRAW_FEE,
  WITHDRAW_TASKS_NEEDED: WITHDRAW_TASKS_NEEDED,
  ACTION_PRICES: ACTION_PRICES,
  DEFAULT_SETTINGS: DEFAULT_SETTINGS,
  AWAIT_SCRATCH: AWAIT_SCRATCH
});
