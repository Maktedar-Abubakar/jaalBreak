// Readers for files dropped into the smart box. Both run entirely in the
// browser and are loaded only when needed.
 
// QR codes: draws the image on a canvas and decodes it with jsQR.
export async function decodeQrFromFile(file) {
  const { default: jsQR } = await import('jsqr');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('This image could not be opened.'));
      i.src = url;
    });
    const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' });
    return code ? code.data : null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
 
// PDFs (e.g. offer letters): extracts the text layer with pdf.js (legacy build,
// so it also works on older phones/browsers and in Node tests).
// The worker file is bundled by Vite ("?url") and served from our own site.
// Scanned PDFs have no text layer — the user is told to take a screenshot instead.
export async function extractPdfText(file, maxPages = 6) {
  const [pdfjs, worker] = await Promise.all([
    import('pdfjs-dist/legacy/build/pdf.mjs'),
    import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url').catch(() => null),
  ]);
  if (worker && typeof worker.default === 'string') {
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  }
  const data = new Uint8Array(await file.arrayBuffer());
  // isEvalSupported: false — safety setting recommended for untrusted PDFs.
  const loadingTask = pdfjs.getDocument({ data, isEvalSupported: false, disableFontFace: true });
  const doc = await loadingTask.promise;
  try {
    const parts = [];
    for (let p = 1; p <= Math.min(doc.numPages, maxPages); p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      parts.push(content.items.map((i) => i.str || '').join(' '));
    }
    return { text: parts.join('\n\n').replace(/[ \t]+/g, ' ').trim(), pages: doc.numPages };
  } finally {
    try {
      if (typeof doc?.cleanup === 'function') await doc.cleanup();
    } catch {
      /* ignore */
    }
    try {
      if (typeof loadingTask?.destroy === 'function') await loadingTask.destroy();
    } catch {
      /* ignore */
    }
    try {
      if (typeof doc?.destroy === 'function') await doc.destroy();
    } catch {
      /* ignore */
    }
  }
}
 