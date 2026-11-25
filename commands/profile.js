/*CMD
  command: /profile
CMD*/
// /profile — My Profile. Reads user + submissions, then /profile2.
Libs.socialtaks.fbMulti(["users/" + user.id, "subs", "users"], "/profile2");
