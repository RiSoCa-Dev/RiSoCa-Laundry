/**
 * Masks a customer name for privacy
 * Examples:
 * - "Valerie" -> "Va***ie"
 * - "John" -> "Jo**n"
 * - "A" -> "A"
 * - "AB" -> "A*B"
 */
export function maskName(name: string): string {
  if (!name || name.length === 0) {
    return 'Anonymous';
  }

  const trimmed = name.trim();
  const length = trimmed.length;

  // Very short names (1-2 characters)
  if (length <= 2) {
    return trimmed.charAt(0) + '*'.repeat(Math.max(1, length - 1));
  }

  // Short names (3-4 characters)
  if (length <= 4) {
    const first = trimmed.charAt(0);
    const last = trimmed.charAt(length - 1);
    const middle = '*'.repeat(length - 2);
    return first + middle + last;
  }

  // Longer names: keep first 2, mask middle, keep last 2
  const first = trimmed.substring(0, 2);
  const last = trimmed.substring(length - 2);
  const middle = '***';
  return first + middle + last;
}

