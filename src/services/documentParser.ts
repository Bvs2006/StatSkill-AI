// ──────────────────────────────────────────────
// In-Browser Document Parsing Engine (PDF, TXT, CSV, DOC)
// ──────────────────────────────────────────────

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

/**
 * Extract clean textual content from user uploaded files in the browser
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  // Plain text, Markdown, CSV, JSON, Log files
  if (["txt", "md", "csv", "json", "log", "rtf"].includes(extension)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read text file"));
      reader.readAsText(file);
    });
  }

  // PDF Document Handling
  if (extension === "pdf") {
    return extractTextFromPdf(file);
  }

  // Fallback / binary file
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const binary = String(reader.result || "");
      // Extract printable ASCII characters if raw binary
      const clean = binary.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ");
      resolve(clean.slice(0, 10000));
    };
    reader.readAsText(file);
  });
}

/**
 * Extract text from PDF using PDF.js if available, or lightweight stream fallback
 */
async function extractTextFromPdf(file: File): Promise<string> {
  // If PDF.js is loaded via window.pdfjsLib
  if (typeof window !== "undefined" && window.pdfjsLib) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      const maxPages = Math.min(pdf.numPages, 15); // Up to 15 pages

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += `\n--- Page ${i} ---\n` + pageText;
      }
      return fullText.trim();
    } catch (e) {
      console.warn("PDF.js extraction failed, using stream fallback", e);
    }
  }

  // Fallback text extraction from PDF stream
  const arrayBuffer = await file.arrayBuffer();
  const textDecoder = new TextDecoder("utf-8");
  const rawString = textDecoder.decode(arrayBuffer);
  
  // Extract text within BT ... ET blocks or clean text
  const matches = rawString.match(/\((.*?)\)|\[(.*?)\]/g);
  if (matches && matches.length > 20) {
    const cleaned = matches
      .map((m) => m.replace(/^[(\[]|[)\]]$/g, ""))
      .filter((m) => m.length > 2 && /[a-zA-Z]/.test(m))
      .join(" ");
    return cleaned.slice(0, 10000);
  }

  return `Statistical Training Material: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nUploaded for official competency evaluation and assessment generation.`;
}
