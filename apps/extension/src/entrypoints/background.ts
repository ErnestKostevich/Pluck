import { defineBackground } from 'wxt/sandbox';
import type { ContentToBgMessage, BgInferReply } from '@/lib/messages';
import { runInference } from '@/lib/ai';

export default defineBackground(() => {
  // The popup is wired via manifest; this hook is reserved for a future
  // side-panel mode.
  chrome.action.onClicked?.addListener(() => {
    /* no-op */
  });

  chrome.runtime.onMessage.addListener(
    (msg: ContentToBgMessage, _sender, sendResponse: (reply: BgInferReply) => void) => {
      if (msg.type === 'infer') {
        // Run client-side inference via the chosen AI provider.
        // No server call — see docs/ARCHITECTURE.md for the zero-cost design.
        (async () => {
          try {
            const { response, providerUsed } = await runInference(msg.payload);
            sendResponse({ ok: true, data: response, providerUsed });
          } catch (err) {
            sendResponse({
              ok: false,
              error: err instanceof Error ? err.message : 'inference failed',
            });
          }
        })();
        return true; // async response
      }
      return false;
    },
  );
});
