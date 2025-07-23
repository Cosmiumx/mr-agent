import { encoding_for_model, TiktokenModel } from '@dqbd/tiktoken';

export const tokenCountMap: Record<string, number> = {
  'gpt-4.1': 1000000,
};

export class TokenHandler {
  private originTokenCount = 0;
  private availableTokenCount = 0;
  private modelName: TiktokenModel;

  constructor(modelName: TiktokenModel) {
    this.modelName = modelName;
    this.availableTokenCount = tokenCountMap[modelName] || 0;
  }

  countTokensByModel(text: string) {
    const encoding = encoding_for_model(this.modelName);
    const tokens = encoding.encode(text);
    const count = tokens.length;
    encoding.free();
    this.originTokenCount = count;
    this.availableTokenCount = this.availableTokenCount - this.originTokenCount;
    return [count, this.availableTokenCount];
  }
}
