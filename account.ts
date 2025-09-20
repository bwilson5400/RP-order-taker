
export function luhnDigit(num: string): number {
  let sum = 0, alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return (10 - (sum % 10)) % 10;
}

export function formatAccountNo(seq: number, now = new Date()): string {
  const y = String(now.getUTCFullYear()).slice(-2);
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const body = `${y}${m}${String(seq).padStart(5, '0')}`;
  const c = luhnDigit(body);
  return `RP-${y}${m}-${String(seq).padStart(5, '0')}-${c}`;
}
