interface Hunk {
  oldStart: number;
  newStart: number;
  hunkLines: string[];
}

export const splitHunk = (diff: string) => {
  const lines = diff.split('\n');

  const hunks: Hunk[] = [];

  let curentHunk: Hunk = {
    oldStart: 0,
    newStart: 0,
    hunkLines: [] as string[],
  };

  lines.forEach((line) => {
    if (line.startsWith('@@')) {
      const match = line.match(/@@ -(\d+),?(\d+)? \+(\d+),?(\d+)? @@/);
      if (curentHunk.hunkLines.length) {
        hunks.push(curentHunk);

        curentHunk = {
          oldStart: 0,
          newStart: 0,
          hunkLines: [] as string[],
        };
      }

      if (match) {
        curentHunk.oldStart = parseInt(match[1], 10);
        curentHunk.newStart = parseInt(match[3], 10);
      }
    }

    curentHunk.hunkLines.push(line);
  });

  if (curentHunk.hunkLines.length) {
    hunks.push(curentHunk);
  }

  return hunks;
};

export const comptuedHunkLineNumer = (hunk: Hunk) => {
  const { oldStart, newStart } = hunk;
  const temp: Array<[string, string]> = [];
  const newHunkLines: string[] = [hunk.hunkLines[0]];
  let maxHaedLength = 0;

  hunk.hunkLines.slice(1).forEach((line, index) => {
    let head = '';
    if (line.startsWith('-')) {
      head = `(${oldStart + index}, )`;
      temp.push([head, line]);
      maxHaedLength = Math.max(maxHaedLength, head.length);
    } else if (line.startsWith('+')) {
      head = `( , ${newStart + index})`;
      temp.push([head, line]);
      maxHaedLength = Math.max(maxHaedLength, head.length);
    } else {
      head = `(${oldStart + index}, ${newStart + index})`;
      temp.push([head, line]);
      maxHaedLength = Math.max(maxHaedLength, head.length);
    }

    if (head.length > maxHaedLength) {
      maxHaedLength = head.length;
    }
  });

  temp.forEach(([head, line]) => {
    newHunkLines.push(`${head.padEnd(maxHaedLength)} ${line}`);
  });

  return newHunkLines;
};
