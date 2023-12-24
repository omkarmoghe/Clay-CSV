import * as crypto from "crypto";
import { parse as syncParse } from 'csv-parse/sync';
import { Cell, Row } from "./models/csv";

export function nonce(): string {
  return crypto.randomBytes(24).toString("base64");
}

export async function parseCsv(text: string): Promise<Row[]> {
  const stringRows: string[][] = syncParse(
    text,
    // {
    //   columns: true
    // }
  );

  return stringRows.map((row: string[], row_index: number) => {
    const cells: Cell[] = row.map((cell, col) => ({ text: cell, row: row_index, col: col }));
    return {
      index: row_index,
      cells: cells
    };
  });
}

// TODO(@omkarmoghe): Figure this out
// export function debounce(func: () => void, waitMilliseconds: number, runImmediately: boolean = false) {
//   var timeout: number | null;
//   return () => {
//     const args = arguments;
//     const funcLater = () => {
//       timeout = null;
//       if (!runImmediately) {
//         func.apply(this, args);
//       }
//     };
//   };
// }
