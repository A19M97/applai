/**
 * Extracts plain text from a PDF File object.
 *
 * Reads the file as an ArrayBuffer (File.arrayBuffer() works in both
 * Node.js 18+ and modern browsers), converts it to a Buffer, and parses
 * it with pdf-parse. Note: pdf-parse runs server-side only, so this
 * function should be called exclusively from API routes.
 *
 * Warns if the extracted text is shorter than 100 characters — a strong
 * signal that the PDF is a scanned image without an embedded text layer.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error(
      'Invalid file: expected a PDF document. Please upload a .pdf file.'
    );
  }

  let text: string;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer);
    text = result.text.trim();
  } catch (err) {
    throw new Error(
      `Failed to parse PDF "${file.name}": ${
        err instanceof Error ? err.message : 'unknown error'
      }`
    );
  }

  if (text.length < 100) {
    console.warn(
      `[parsers] Extracted text from "${file.name}" is very short (${text.length} chars). ` +
        'This PDF might be a scanned image without an embedded text layer.'
    );
  }

  return text;
}
