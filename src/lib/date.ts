export function formatDateYYYYMMDD(input?: Date | string): string {
  const d = input ? new Date(input) : new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

export function isYYYYMMDD(v: string): boolean {
  return /^[0-9]{8}$/.test(v);
}

export function parseYYYYMMDD(dateStr: string): Date {
  if (!isYYYYMMDD(dateStr)) {
    throw new Error(`Data inválida: ${dateStr}. Use formato AAAAMMDD`);
  }
  
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // getMonth() é 0-based
  const day = parseInt(dateStr.substring(6, 8));
  
  return new Date(year, month, day);
}

export function formatDateToISO(dateStr: string): string {
  try {
    const date = parseYYYYMMDD(dateStr);
    return date.toISOString();
  } catch {
    // Se não conseguir parsear como AAAAMMDD, retorna como está
    return dateStr;
  }
}
