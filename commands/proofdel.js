/*CMD
  command: /proofdel
CMD*/
// /proofdel — delete the last added photo
var photos = [];
try { photos = JSON.parse(User.getProperty("proof_photos") || "[]"); } catch (e) {}
if (photos.length > 0) photos.pop();
User.setProperty("proof_photos", JSON.stringify(photos), "string");
if (photos.length === 0) {
  Bot.sendMessage("🗑 Photo deleted. No photos left — send a new proof screenshot.");
} else {
  Bot.sendInlineKeyboard([
    [{ title: "✅ Yes", command: "/proofyes" }, { title: "❌ No", command: "/proofno" }],
    [{ title: "➕ Add more photo", command: "/proofadd" }, { title: "🗑 Delete photo", command: "/proofdel" }],
    [{ title: "📤 Send to admin", command: "/proofsend" }, { title: "✖️ Cancel", command: "/proofcancel" }]
  ], "📸 Proof photo " + photos.length + " left.\n\nYou want to send it?");
}
