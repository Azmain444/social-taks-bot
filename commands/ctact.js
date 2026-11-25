/*CMD
  command: /ctact
CMD*/
// /ctact <action> — save the action, ask Standard / Premium
var L = Libs.socialtaks;
var action = (params || "").trim();
if (!L.ACTION_PRICES[action]) {
  Bot.sendMessage("Pick an action from the list.");
  Bot.runCommand("/ctact_choose");
  return;
}
User.setProperty("ct_action", action, "string");
var label = action.charAt(0).toUpperCase() + action.slice(1);
Bot.sendInlineKeyboard([
  [{ title: "✅ Standard", command: "/ctq standard" },
   { title: "💎 Premium", command: "/ctq premium" }],
  [{ title: "❌ Cancel", command: "/menu" }]
], "Choose the quality for " + label + ":\n✅ Standard: all users\n💎 Premium: users with 25+ followers, costs x2.5");
