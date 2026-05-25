import { defineBackground } from 'wxt/sandbox';
import type {
  ContentToBgMessage,
  BgInferReply,
  BgSaveJobReply,
  PopupToBgMessage,
  BgRunJobReply,
} from '@/lib/messages';
import { runInference } from '@/lib/ai';
import { saveJob } from '@/lib/storage';
import { runJob } from '@/lib/runner';
import { jobIdFromAlarmName } from '@/lib/scheduling';

type AnyMessage = ContentToBgMessage | PopupToBgMessage;

type AnyReply = BgInferReply | BgSaveJobReply | BgRunJobReply | { ok: true };

export default defineBackground(() => {
  // Routes:
  //   content → bg: 'infer', 'save-job'
  //   popup   → bg: 'run-job', 'cancel-run'
  chrome.runtime.onMessage.addListener(
    (msg: AnyMessage, _sender, sendResponse: (reply: AnyReply) => void) => {
      switch (msg.type) {
        case 'infer':
          (async () => {
            try {
              const { response, providerUsed } = await runInference(msg.payload);
              sendResponse({ ok: true, data: response, providerUsed });
            } catch (err) {
              sendResponse({ ok: false, error: errMsg(err) });
            }
          })();
          return true;

        case 'save-job':
          (async () => {
            try {
              const job = await saveJob({
                name: msg.name,
                url: msg.url,
                schema: msg.schema,
              });
              sendResponse({ ok: true, job });
            } catch (err) {
              sendResponse({ ok: false, error: errMsg(err) });
            }
          })();
          return true;

        case 'run-job':
          (async () => {
            try {
              const run = await runJob(msg.jobId);
              sendResponse({ ok: true, run });
            } catch (err) {
              sendResponse({ ok: false, error: errMsg(err) });
            }
          })();
          return true;

        case 'cancel-run':
          // Cancellation isn't wired yet — runs typically finish in seconds.
          // Hook will land alongside long-running paginated scrapes.
          sendResponse({ ok: true });
          return false;

        case 'picker-cancelled':
          // Informational only — no work to do.
          return false;
      }
      return false;
    },
  );

  // Scheduled run trigger.
  chrome.alarms.onAlarm.addListener((alarm) => {
    const jobId = jobIdFromAlarmName(alarm.name);
    if (!jobId) return;
    // Fire and forget — errors are persisted to the run record.
    runJob(jobId).catch((err) => {
      console.error('[pluck] scheduled run failed', jobId, err);
    });
  });
});

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
