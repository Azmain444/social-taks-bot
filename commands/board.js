/*CMD
  command: /board
CMD*/
// /board — Leaderboard. Reads subs + tasks + users + settings, then /board2.
Libs.socialtaks.fbMulti(["subs", "tasks", "users", "settings"], "/board2");
