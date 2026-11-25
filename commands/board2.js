/*CMD
  command: /board2
CMD*/
// /board2 — continuation of /board.
// Prizes come from /settings (admin panel editor) — defaults
// #1 $0.5 / #2 $0.4 / #3 $0.3 when settings are absent.
// The board ranks all-time approved earnings (no timestamps stored).
var L = Libs.socialtaks;
var res = L.fbRes();
if (!res.ok) {
  Bot.sendMessage("⚠️ Database error: " + (res.error || "try again later."));
  return;
}
var vals = res.values || {};
var settings = L.loadSettings(vals["settings"]);
var prizes = settings.prizes;
var rows = L.leaderboardFrom(vals["subs"], vals["tasks"], vals["users"]);
var lines = ["🏆 Leaderboard\n",
  "Top 10 users receive extra bonus from leaderboard 🔥\n",
  "🥇 #1: $" + prizes[0] + "  🥈 #2: $" + prizes[1] + "  🥉 #3: $" + prizes[2] + "\n"];
var medals = ["🥇", "🥈", "🥉"];
rows.forEach(function (r, i) {
  lines.push((medals[i] || (i + 1) + ".") + " @" + r.name + " — " + L.money(r.earned) + " USDT");
});
if (rows.length === 0 || rows[0].earned === 0) {
  lines.push("\nNo earnings yet — complete tasks to climb!");
}
Bot.sendInlineKeyboard(
  [[{ title: "🏠 Home", command: "/menu" }]],
  lines.join("\n")
);
