/*CMD
  command: /fbok
CMD*/
// /fbok — bridge SUCCESS callback (do not call directly).
// BJS runs this command after HTTP.get succeeds. The `content`
// variable holds the Worker's JSON response body. We parse it,
// stash it in User property "fb_res", and ONLY run the continuation
// command (stored in "fb_ctx") when the bridge said ok:true.
// A bad reply or bad JSON shows a retry message instead — the
// continuation must never run on a failed read/write.
var body = "";
try { body = (typeof content !== "undefined" && content) ? content : ""; } catch (e) {}
var res = null;
try { res = JSON.parse(body); } catch (e) { res = null; }
if (!res || res.ok !== true) {
  User.setProperty("fb_res", JSON.stringify({ ok: false, error: res ? (res.error || "bridge_error") : "bad_json" }), "string");
  Bot.sendMessage("⚠️ Something went wrong. Please try again.");
  return;
}
User.setProperty("fb_res", body, "string");
var ctx = {};
try { ctx = JSON.parse(User.getProperty("fb_ctx") || "{}"); } catch (e) {}
if (ctx.next) {
  Bot.runCommand(ctx.next);
}
