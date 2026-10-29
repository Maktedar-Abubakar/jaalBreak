import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractPdfText } from './fileReaders.js';

test('fileReaders: extractPdfText successfully reads text and does not throw doc.destroy error', async () => {
  // Minimal valid PDF with a single text item
  const pdfBytes = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 300 144]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 44>>stream\nBT /F1 12 Tf 20 100 Td (Offer Letter) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000216 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n310\n%%EOF';
  const buffer = new TextEncoder().encode(pdfBytes).buffer;
  const mockFile = {
    arrayBuffer: async () => buffer,
  };

  const result = await extractPdfText(mockFile);
  assert.ok(result);
  assert.equal(result.pages, 1);
  assert.ok(result.text.includes('Offer Letter'));
});
