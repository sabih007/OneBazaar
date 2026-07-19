const ONES = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones ? `${TENS[tens]}-${ONES[ones]}` : TENS[tens];
}

function threeDigits(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundreds) parts.push(`${ONES[hundreds]} hundred`);
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" ");
}

// South-Asian (Pakistani/Indian) numbering: thousand, lakh, crore, arab.
// e.g. 12000 -> "twelve thousand", 3500000 -> "thirty-five lakh".
export function numberToWords(value: number): string {
  if (!Number.isFinite(value)) return "";
  let n = Math.floor(Math.abs(value));
  if (n === 0) return "zero";

  const parts: string[] = [];

  const arab = Math.floor(n / 1_000_000_000);
  n %= 1_000_000_000;
  const crore = Math.floor(n / 10_000_000);
  n %= 10_000_000;
  const lakh = Math.floor(n / 100_000);
  n %= 100_000;
  const thousand = Math.floor(n / 1_000);
  n %= 1_000;

  if (arab) parts.push(`${twoDigits(arab)} arab`);
  if (crore) parts.push(`${twoDigits(crore)} crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} thousand`);
  if (n) parts.push(threeDigits(n));

  const words = parts.join(" ");
  return value < 0 ? `minus ${words}` : words;
}

/** Capitalise the first letter for display, e.g. "twelve thousand" -> "Twelve thousand". */
export function amountInWords(value: number): string {
  const words = numberToWords(value);
  if (!words) return "";
  return words.charAt(0).toUpperCase() + words.slice(1);
}
