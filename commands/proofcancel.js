/*CMD
  command: /proofcancel
CMD*/
// /proofcancel — cancel the proof flow
User.setProperty("await", "", "string");
User.setProperty("proof_photos", "[]", "string");
Bot.sendMessage("❌ Proof cancelled.");
Libs.socialtaks.mainMenu();
