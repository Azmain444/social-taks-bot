/*CMD
  command: /menu
CMD*/
// /menu — main menu (also the 🏠 Home button target).
// Cancel fix: clear any in-progress flow first, so tapping
// Home / Cancel truly cancels (the await state must not survive).
Libs.socialtaks.clearAwait();
Libs.socialtaks.mainMenu();
