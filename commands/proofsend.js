/*CMD
  command: /proofsend
CMD*/
// /proofsend — send the proof to the admin for review.
// Reads /subs (duplicate check) + /tasks (the task's reward — the
// submission record must carry it, or the admin panel credits 0),
// then /proofsend2 creates it.
Libs.socialtaks.fbMulti(["subs", "tasks"], "/proofsend2");
