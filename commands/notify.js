/*CMD
  command: /notify
CMD*/
// /notify — deliver my pending notifications now.
// The Worker cron usually delivers them automatically (within ~1
// minute of the admin's approval). This is the manual pull for when
// the cron isn't set up yet: it reads /notifs, sends the caller's
// pending rows, and marks them sent. Then /notify2.
Libs.socialtaks.fbGet("notifs", "/notify2");
