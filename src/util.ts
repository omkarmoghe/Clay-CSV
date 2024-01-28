import * as crypto from "crypto";
import { parse as syncParse } from 'csv-parse/sync';
import { Cell, Row } from "./models/csv";
import { TextDocument, TextDocumentContentChangeEvent } from "vscode";

export function nonce(): string {
  return crypto.randomBytes(24).toString("base64");
}

export interface ParseOptions {
  from_line: number;
  to_line: number;
}

export async function parseCsv(document: TextDocument, options: ParseOptions | null = null): Promise<Row[]> {
  const parseOptions = options || { from_line: 1, to_line: document.lineCount };
  const rowOffset = parseOptions.from_line - 1; // Adjusting for the 1-index that csv-parse uses.
  const stringRows: string[][] = syncParse(document.getText(), parseOptions);

  return stringRows.map((row: string[], rowIndex: number) => {
    rowIndex += rowOffset;
    const cells: Cell[] = row.map((cell, col) => ({ text: cell, row: rowIndex, col: col }));
    return {
      index: rowIndex,
      cells: cells
    };
  });
}

export function debounce(fn: Function, ms: number = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

export function rowUpdateRange(changes: readonly TextDocumentContentChangeEvent[]): number[] {
  const changedRows: number[] = [];
  changes.forEach((changeEvent) => {
    changedRows.push(
      changeEvent.range.start.line,
      changeEvent.range.end.line
    );
  });

  const start = Math.min(...changedRows);
  const end = Math.max(...changedRows);

  // csv-parse uses index 1 for the first row, not 0
  return [start + 1, end + 1];
}
