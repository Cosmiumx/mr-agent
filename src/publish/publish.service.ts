import { Injectable } from '@nestjs/common';
import { Review } from 'src/agent/types';
import { GitProvideService } from 'src/git-provide/git-provide.service';

@Injectable()
export class PublishService {
  publish(mode: 'report' | 'comment', reviews: Review[], gitProvider: GitProvideService) {
    if (mode === 'comment') {
      reviews.forEach((review) => {
        const { filePath, type, endLine, issueContent } = review;
        gitProvider.publishCommentToLine(filePath, filePath, endLine, issueContent, type);
      });
    } else {
      // TODO:
    }
  }

  transformToMarkdown(reviews: Review[]) {
    let markdown = '';
    reviews.forEach((review) => {
      const { filePath, type, endLine, issueContent } = review;
      markdown += `## ${filePath}\n`;
      markdown += `### ${type}\n`;
      markdown += `### ${endLine}\n`;
      markdown += `### ${issueContent}\n`;
    });
    return markdown;
  }
}
