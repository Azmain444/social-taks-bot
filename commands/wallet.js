/*CMD
  command: /wallet
CMD*/
// /wallet — My Wallet: earnings + deposit. Reads the user, then /wallet2.
// Cancel fix: any in-progress flow is cleared first.
Libs.socialtaks.clearAwait();
Libs.socialtaks.fbGet("users/" + user.id, "/wallet2");
