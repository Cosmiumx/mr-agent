export interface DeepSeekChatResponse {
  id: string;
  choices: [
    {
      finish_reason: string | null;
      index: number;
      message?: {
        content: string;
        role: string;
      };
      delta?: {
        content: string;
      };
      logprobs: any;
    },
  ];
  created: number;
  model: string;
  object: string;
  system_fingerprint?: string;
  usage?: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
    prompt_tokens_details?: {
      cached_tokens: number;
    };
    prompt_cache_hit_tokens?: number;
    prompt_cache_miss_tokens?: number;
  };
}

export interface Review {
  // 表示评审的是哪个文件路径的代码
  filePath: string;
  // 表示评审的是旧代码还是新代码，如果评审的是 + 部分的代码，那么 type 就是 new，如果评审的是 - 部分的代码，那么 type 就是 old。
  type: 'old' | 'new';
  // 如果是 old 类型，那么 startLine 表示的是旧代码的第 startLine 行，否则表示的是新代码的第 startLine 行
  startLine: number;
  // 如果是 new 类型，那么 endLine 表示的是旧代码的第 endLine 行，否则表示的是新代码的第 endLine 行
  endLine: number;
  // 描述清楚代码中存在的、以及需要注意的问题，并给出修改建议
  issueContent: string;
}

export interface MRReview {
  reviews: Review[];
}

export interface YamlContent {
  content: string;
  parsed: MRReview | null;
  error: any;
}
