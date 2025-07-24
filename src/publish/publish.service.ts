import { Injectable } from '@nestjs/common';
import { Review } from 'src/agent/types';
import { GitProvideService } from 'src/git-provide/git-provide.service';

const issueCommentMarkdownTemplate =
  '<table><thead><tr><td><strong>问题</strong></td><td><strong>描述</strong></td></tr></thead><tbody><tr><td>__issue_header__</td><td>__issue_content__</td></tr></tbody></table>';

// const issueReportMarkdownTemplate =
//   '<tr><td>__issue_header__</td><td>__issue_code_url__</td><td>__issue_content__</td></tr>';

@Injectable()
export class PublishService {
  publish(mode: 'report' | 'comment', reviews: Review[], gitProvider: GitProvideService) {
    if (mode === 'comment') {
      reviews.forEach((review) => {
        const { newPath, oldPath, type, endLine, issueContent, issueHeader } = review;

        const issueContentMarkdown = issueCommentMarkdownTemplate
          .replace('__issue_header__', issueHeader)
          .replace('__issue_content__', issueContent);

        gitProvider.publishCommentToLine(newPath, oldPath, endLine, issueContentMarkdown, type);
      });
    } else {
      // reviews.forEach((review) => {
      // const { filePath, type, endLine, issueContent, issueHeader } = review;
      // const issueContentMarkdown = issueReportMarkdownTemplate
      //   .replace('__issue_header__', issueHeader)
      //   .replace('__issue_content__', issueContent);
      // });
    }
  }
}
