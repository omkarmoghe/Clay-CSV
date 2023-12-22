export interface Cell {
  text: string;
  row: number;
  col: number;
}

export interface Row {
  index: number;
  cells: Cell[];
}
