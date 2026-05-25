import { defineContentScript } from 'wxt/sandbox';
import type {
  PopupToContentMessage,
  ContentToBgMessage,
  BgInferReply,
  BgSaveJobReply,
} from '@/lib/messages';
import { sanitizePageHtml } from '@/lib/sanitize-html';
import type { ElementPick, InferResponse } from '@pluck/shared';
import { mountPickerOverlay, type PickerHandle } from '@/picker/overlay';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    let handle: PickerHandle | null = null;

    chrome.runtime.onMessage.addListener((msg: PopupToContentMessage) => {
      if (msg.type === 'start-picker') {
        if (handle) return;
        handle = mountPickerOverlay({
          onInfer: handleInfer,
          onSaveJob: handleSaveJob,
          onClose: () => {
            handle?.destroy();
            handle = null;
          },
        });
      } else if (msg.type === 'stop-picker') {
        handle?.destroy();
        handle = null;
      } else if (msg.type === 'extract-with-schema') {
        // Not used in the picker flow — present for future cross-context extraction.
        // The runner uses chrome.scripting.executeScript instead.
      }
    });

    async function handleInfer(picks: ElementPick[]): Promise<InferResponse> {
      const payload = {
        url: window.location.href,
        pageHtml: sanitizePageHtml(),
        picks,
      };
      const message: ContentToBgMessage = { type: 'infer', payload };
      return new Promise<InferResponse>((resolve, reject) => {
        chrome.runtime.sendMessage(message, (reply: BgInferReply) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (!reply.ok) reject(new Error(reply.error));
          else resolve(reply.data);
        });
      });
    }

    async function handleSaveJob(
      name: string,
      url: string,
      schema: InferResponse,
    ): Promise<{ ok: true } | { ok: false; error: string }> {
      const message: ContentToBgMessage = { type: 'save-job', name, url, schema };
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (reply: BgSaveJobReply) => {
          if (chrome.runtime.lastError) {
            resolve({ ok: false, error: chrome.runtime.lastError.message ?? 'message failed' });
            return;
          }
          if (reply.ok) resolve({ ok: true });
          else resolve({ ok: false, error: reply.error });
        });
      });
    }
  },
});
