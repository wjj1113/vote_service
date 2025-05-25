declare module 'pdf2json' {
  class PDFParser {
    constructor();
    on(event: 'pdfParser_dataReady', callback: (pdfData: any) => void): void;
    on(event: 'pdfParser_dataError', callback: (error: Error) => void): void;
    loadPDF(pdfFilePath: string): void;
    getRawTextContent(): string;
  }
  export default PDFParser;
} 