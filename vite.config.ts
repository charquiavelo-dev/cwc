import { defineConfig, type Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { createExtractorFromFile } from 'node-unrar-js';

const audioExt = /\.(mp3|wav|ogg|m4a)$/i;

function cwcAudioPlugin(): Plugin {
  const root = process.cwd();
  const archive = path.join(root, 'source-audio', 'CWeeD.rar');
  const audioDir = path.join(root, 'public', 'audio');

  const prepare = async () => {
    fs.mkdirSync(audioDir, { recursive: true });
    const existing = fs.readdirSync(audioDir).filter((f) => audioExt.test(f));
    if (existing.length) return;
    if (!fs.existsSync(archive)) return;

    try {
      const extractor = await createExtractorFromFile({ filepath: archive, targetPath: audioDir });
      const result = extractor.extract();
      // node-unrar-js can expose extraction lazily; consuming the headers forces extraction.
      for (const _ of result.files) { void _; }
      const nested = path.join(audioDir, 'CWeeD');
      if (fs.existsSync(nested) && fs.statSync(nested).isDirectory()) {
        for (const file of fs.readdirSync(nested)) {
          const src = path.join(nested, file);
          const dst = path.join(audioDir, file);
          if (audioExt.test(file) && !fs.existsSync(dst)) fs.renameSync(src, dst);
        }
      }
    } catch (error) {
      console.warn('[CWC] No se pudo extraer source-audio/CWeeD.rar automáticamente.', error);
    }
  };

  return {
    name: 'cwc-audio-from-rar',
    async configResolved() { await prepare(); },
    async buildStart() { await prepare(); }
  };
}

export default defineConfig({
  plugins: [cwcAudioPlugin()],
  server: { port: 5173, open: true },
  build: { target: 'es2022' }
});
