/*CMD
  command: /invite
CMD*/
// /invite — Invite Friends. Reads /users (referral stats) + /settings, then /invite2.
Libs.socialtaks.fbMulti(["users", "settings"], "/invite2");
