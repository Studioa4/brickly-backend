import { readPECInbox } from './pecReader';

(async () => {
  console.log("🔄 Avvio sincronizzazione con la casella PEC...");
  await readPECInbox();
})();
