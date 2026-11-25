/*CMD
  command: /start2
CMD*/
// /start2 — continuation of /start: create/update the user,
// apply the referral joining bonus (from /settings), seed the first
// task if the database is empty, then /start3.
var L = Libs.socialtaks;
var res = L.fbRes();
if (!res.ok) {
  Bot.sendMessage("⚠️ Database error: " + (res.error || "try again later."));
  return;
}
var vals = res.values || {};
var settings = L.loadSettings(vals["settings"]);
var refId = parseInt(User.getProperty("ref_id") || "0");
var me = vals["users/" + user.id];
var ref = refId ? vals["users/" + refId] : null;
var writes = {};
if (!me) {
  // Dual field spellings (first_name/firstName, ref_by/referrer,
  // ref_earnings/referralEarnings) so the admin panel website and
  // the bot read the same record.
  me = { id: user.id, username: user.username || "", firstName: user.first_name || "",
         first_name: user.first_name || "",
         earnings: 0, deposit: 0, referralEarnings: 0, ref_earnings: 0,
         ref_count: 0, approved_tasks: 0, bep20: "",
         referrer: 0, ref_by: null, verified: 0, x_approved: false };
  if (ref && refId !== user.id) {
    me.referrer = refId;
    me.ref_by = refId;
    ref.earnings = (ref.earnings || 0) + settings.referral.joinBonus;
    ref.referralEarnings = (ref.referralEarnings || 0) + settings.referral.joinBonus;
    ref.ref_earnings = (ref.ref_earnings || 0) + settings.referral.joinBonus;
    ref.ref_count = (ref.ref_count || 0) + 1;
    writes["users/" + refId] = ref;
  }
  writes["users/" + user.id] = me;
} else {
  me.username = user.username || me.username;
  me.firstName = user.first_name || me.firstName;
  me.first_name = user.first_name || me.first_name || me.firstName;
  if (me.referrer && !me.ref_by) me.ref_by = me.referrer;
  if (me.ref_by && !me.referrer) me.referrer = me.ref_by;
  writes["users/" + user.id] = me;
}
var tasks = vals["tasks"];
if (!tasks || Object.keys(tasks).length === 0) {
  // Spec-format seed task (ADMIN_PANEL_SPEC.md §3). used: 13 keeps
  // the original demo state (100 slots, 87 left).
  writes["tasks/1"] = { id: 1, platform: "x", action: "follow",
    link: "https://x.com/MirzaNurmi50341",
    reward: 0.01, slots: 100, used: 13, status: "active",
    creator: "admin", premium: false };
  writes["seq/task"] = 1;
}
User.setProperty("is_verified", me.verified ? "1" : "0", "string");
L.fbBatch(writes, "/start3");
