export function togglePermissions(
  selected: string[],
  codes: string[],
  checked: boolean,
  groupReadCodes: string[] = []
) {
  if (codes.length === 0) return selected;
  if (!checked) return selected.filter((code) => !codes.includes(code));
  return [...new Set([...selected, ...codes, ...groupReadCodes])];
}
