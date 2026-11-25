/*CMD
  command: /fberr
CMD*/
// /fberr — bridge ERROR callback (do not call directly).
// BJS runs this when HTTP.get fails (no network, Worker down,
// bad key). Tell the user to retry; nothing was changed.
Bot.sendMessage("⚠️ Database-এ connect করা যাচ্ছে না। একটু পরে আবার চেষ্টা করো।");
