import { GitProvideService } from 'src/git-provide/git-provide.service';
import { Change } from '../git-provide/types/gitlab-api';
import { comptuedHunkLineNumer, splitHunk } from './utils';

export class PatchHandler {
  private diffFiles: Change[];
  constructor(diffFiles: Change[]) {
    this.diffFiles = diffFiles.filter((diffFile) => diffFile.diff);
  }

  getExtendedDiffContent(gitProvider: GitProvideService) {
    // TODO: 扩展 context
    this.extendedLines();
    // 扩展行号
    this.addLineNumber();

    const { commitMessage } = gitProvider.getMrInfo();

    let extendedDiff = `commit message: ${commitMessage}\n\n`;

    extendedDiff += this.diffFiles.reduce((pre, cur) => {
      return pre + `## File: ${cur.new_path}\n` + cur.diff + '\n\n';
    }, '');

    return extendedDiff;
  }

  extendedLines() {}

  /**
   * diff 内容添加真实的行号diffs
   */
  addLineNumber() {
    this.diffFiles.forEach((diffFile) => {
      let newDiff = '';
      const hunks = splitHunk(diffFile.diff);
      hunks.forEach((hunk) => {
        const newHunkLines = comptuedHunkLineNumer(hunk);
        newDiff += newHunkLines.join('\n');
      });
      diffFile.diff = newDiff;
    });
  }
}
