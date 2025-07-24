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
