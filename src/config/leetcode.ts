/**
 * LeetCode stats come from a public Google Sheet (the "Status" tab), range T1:Z4:
 * row 1 = language names, rows 2-4 = Hard / Medium / Easy counts per language.
 * The site reads it at build time and again in the visitor's browser, so the numbers stay current.
 */
export const LEETCODE = {
  sheetId: '10wZz1tnYoIQ21qcwln8tOQp5Aki9cPlwFwjw0Y2HbP0',
  gid: '1526874095',
  range: 'T1:Z4',
  /** Public LeetCode profile, shown as a link when set. */
  profileUrl: '' as string,
};

/** CSV endpoint of the sheet range (Google Visualization API, CORS-enabled). */
export const leetcodeCsvUrl = () =>
  `https://docs.google.com/spreadsheets/d/${LEETCODE.sheetId}/gviz/tq?tqx=out:csv&headers=1&gid=${LEETCODE.gid}&range=${LEETCODE.range}`;

/** Language name in the sheet -> stack slug (for the logo). */
export const LEETCODE_LANG_SLUG: Record<string, string> = {
  Python: 'python', JavaScript: 'javascript', 'C++': 'cpp', C: 'c', Java: 'java', 'C#': 'csharp',
};
