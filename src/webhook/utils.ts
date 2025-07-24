import { parse } from 'yaml';

interface YamlContent {
  content: string;
  parsed: Record<string, unknown> | null;
  error: any;
}

/**
 * 从 Markdown 文本中提取并解析第一个 YAML 代码块（使用 yaml 包）
 * @param {string} markdownText - 包含 YAML 代码块的 Markdown 文本
 * @param {boolean} [isParse=true] - 是否解析 YAML 内容为 JavaScript 对象
 * @returns {YamlContent | null} - 提取结果对象，如果没有找到则返回null
 */
export function extractFirstYamlFromMarkdown(
  markdownText: string,
  isParse = true,
) {
  const regex = /```yaml\s*([\s\S]*?)\s*```/;
  const match = regex.exec(markdownText);

  if (!match) {
    return null;
  }

  const yamlContent = match[1];
  const result: YamlContent = {
    content: yamlContent,
    parsed: null,
    error: null,
  };

  if (isParse) {
    try {
      result.parsed = parse(yamlContent) as Record<string, unknown>;
    } catch (e) {
      result.error = e instanceof Error ? e : new Error(String(e));
    }
  }

  return result;
}
