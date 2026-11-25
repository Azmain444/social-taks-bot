/*CMD
  command: /proofno
CMD*/
// /proofno — discard the proof photos, back to tasks
User.setProperty("await", "", "string");
User.setProperty("proof_photos", "[]", "string");
Bot.sendMessage("Proof discarded. Back to the task.");
Bot.runCommand("/tasks");
