import Config from 'react-native-config';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const region = Config.AWS_REGION || Config.AWS_DEFAULT_REGION || 'ap-southeast-2';
const bedrockApiKey = Config.BEDROCK_API_KEY;
const bedrockRuntimeEndpoint =
  Config.BEDROCK_RUNTIME_ENDPOINT || `https://bedrock-runtime.${region}.amazonaws.com`;

const bedrockClient = new BedrockRuntimeClient({
  region,
  credentials:
    Config.AWS_ACCESS_KEY_ID && Config.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: Config.AWS_ACCESS_KEY_ID,
          secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
          sessionToken: Config.AWS_SESSION_TOKEN,
        }
      : undefined,
});

export const BEDROCK_MODEL_IDS = {
  default: Config.BEDROCK_DEFAULT_MODEL_ID || 'anthropic.claude-sonnet-4-6',
  reasoning: Config.BEDROCK_REASONING_MODEL_ID || 'anthropic.claude-opus-4-7',
} as const;

export type BedrockAssistantMode = 'default' | 'reasoning';

export type BedrockMessage = {
  role: 'user' | 'assistant';
  content: Array<{
    text?: string;
    type?: 'text';
  }>;
};

export async function invokeClaudeBedrock({
  messages,
  mode = 'default',
  maxTokens = 4096,
  temperature = 0.2,
  system,
}: {
  messages: BedrockMessage[];
  mode?: BedrockAssistantMode;
  maxTokens?: number;
  temperature?: number;
  system?: string;
}) {
  const modelId = mode === 'reasoning' ? BEDROCK_MODEL_IDS.reasoning : BEDROCK_MODEL_IDS.default;

  if (bedrockApiKey) {
    const payload = {
      system: system ? [{ text: system }] : undefined,
      messages,
      inferenceConfig: {
        maxTokens,
        temperature,
      },
      additionalModelRequestFields: {
        anthropic_version: 'bedrock-2023-05-31',
      },
    };

    const response = await fetch(`${bedrockRuntimeEndpoint}/model/${modelId}/converse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-api-key': bedrockApiKey,
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.json();

    if (!response.ok) {
      const message = raw?.message || raw?.error || 'Bedrock API request failed';
      throw new Error(`[Bedrock API key auth] ${message}`);
    }

    const text = raw?.output?.message?.content
      ?.map((part: { text?: string }) => part?.text ?? '')
      .join('')
      .trim() ?? '';

    return {
      modelId,
      text,
      raw,
    };
  }

  const command = new ConverseCommand({
    modelId,
    system: system ? [{ text: system }] : undefined,
    messages,
    inferenceConfig: {
      maxTokens,
      temperature,
    },
    additionalModelRequestFields: {
      anthropic_version: 'bedrock-2023-05-31',
    },
  });

  const response = await bedrockClient.send(command);
  const text = response.output?.message?.content
    ?.map((part) => ('text' in part ? part.text ?? '' : ''))
    .join('')
    .trim() ?? '';

  return {
    modelId,
    text,
    raw: response,
  };
}

export function buildClaudeMessages(prompt: string, system?: string): {
  system?: string;
  messages: BedrockMessage[];
} {
  return {
    system,
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: prompt }],
      },
    ],
  };
}
