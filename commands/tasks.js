/*CMD
  command: /tasks
CMD*/
// /tasks — show one task card (video style), with Next / filter.
// Reads /tasks and /accounts in one bridge call, then /tasks2.
Libs.socialtaks.fbMulti(["tasks", "accounts"], "/tasks2");
