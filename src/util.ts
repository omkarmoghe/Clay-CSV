import * as crypto from "crypto";
import { parse as syncParse } from 'csv-parse/sync';
import { Cell, Row } from "./models/csv";

export function nonce(): string {
  return crypto.randomBytes(24).toString("base64");
}

export async function parseCsv(text: string): Promise<Row[]> {
  const stringRows: string[][] = syncParse(text);

  return stringRows.map((row: string[], row_index: number) => {
    const cells: Cell[] = row.map((cell, col) => ({ text: cell, row: row_index, col: col }));
    return {
      index: row_index,
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
