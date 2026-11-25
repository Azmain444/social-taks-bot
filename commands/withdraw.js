/*CMD
  command: /withdraw
CMD*/
// /withdraw — BEP20 only (no xRocket). Needs 2 approved tasks first.
// Reads the user + submissions, then /withdraw2 decides.
Libs.socialtaks.fbMulti(["users/" + user.id, "subs"], "/withdraw2");
