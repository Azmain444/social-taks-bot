/*CMD
  command: /start
CMD*/
// /start — register the user (referral aware), then /start2.
// Reads the user record, the referrer record (if any), the tasks
// list and /settings (referral bonus) in ONE bridge call.
// Cancel fix: any in-progress flow is cleared first.
var L = Libs.socialtaks;
L.clearAwait();
var referrer = 0;
if (params) {
  var n = parseInt(String(params).replace("ref_", ""));
  if (!isNaN(n)) referrer = n;
}
User.setProperty("ref_id", String(referrer), "string");
var paths = ["users/" + user.id, "tasks", "settings"];
if (referrer) paths.push("users/" + referrer);
L.fbMulti(paths, "/start2");
