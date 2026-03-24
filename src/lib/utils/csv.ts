export function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    return "";
  }

  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>())
  );

  const escapeCell = (value: unknown) => {
    const raw =
      value == null
        ? ""
        : Array.isArray(value) || typeof value === "object"
          ? JSON.stringify(value)
          : String(value);
    return `"${raw.replace(/"/g, '""')}"`;
  };

  return [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(","))].join("\n");
}

function sanitizeCell(value: string) {
  const trimmed = value.trim();
  if (trimmed === "") {
    return "";
  }

  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
    return numeric;
  }

  return trimmed;
}

export function parseCsv(input: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const nextCharacter = input[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && character === ",") {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (!inQuotes && (character === "\n" || character === "\r")) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += character;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  const nonEmptyRows = rows
    .map((row) => row.map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => cell !== ""));

  if (nonEmptyRows.length === 0) {
    return {headers: [] as string[], rows: [] as Record<string, unknown>[]};
  }

  const rawHeaders = nonEmptyRows[0];
  const headers = rawHeaders.map((header, index) => {
    const normalized = header || `Column ${index + 1}`;
    return normalized.trim();
  });

  const seenHeaders = new Map<string, number>();
  const uniqueHeaders = headers.map((header) => {
    const count = seenHeaders.get(header) ?? 0;
    seenHeaders.set(header, count + 1);
    return count === 0 ? header : `${header}_${count + 1}`;
  });

  const parsedRows = nonEmptyRows.slice(1).map((row) =>
    uniqueHeaders.reduce<Record<string, unknown>>((record, header, index) => {
      record[header] = sanitizeCell(row[index] ?? "");
      return record;
    }, {})
  );

  return {headers: uniqueHeaders, rows: parsedRows};
}
