/*CMD
  command: /proof
CMD*/
// /proof <taskId> — start proof submission for a task.
// Reads /subs first (to block a duplicate pending submission),
// then /proof2.
User.setProperty("proof_task", String(params || "0"), "string");
Libs.socialtaks.fbGet("subs", "/proof2");
