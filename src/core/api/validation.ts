const MAX_STORY_LENGTH = 500;
const MAX_CODE_LENGTH = 1000;

export function validateStoryInput(story: string): string {
  const trimmed = story.trim();

  if (trimmed.length === 0) {
    throw new Error('Story cannot be empty');
  }

  if (trimmed.length > MAX_STORY_LENGTH) {
    throw new Error(`Story too long (max ${MAX_STORY_LENGTH} characters)`);
  }

  // Remove any XML-like tags
  return trimmed.replace(/<[^>]*>/g, '');
}

export function validateCodeInput(code: string): string {
  const trimmed = code.trim();

  if (trimmed.length > MAX_CODE_LENGTH) {
    throw new Error(`Code too long (max ${MAX_CODE_LENGTH} characters)`);
  }

  // Remove any XML-like tags
  return trimmed.replace(/<[^>]*>/g, '');
}

export function wrapInDelimiters(content: string, tag: string): string {
  return `<${tag}>\n${content}\n</${tag}>`;
}
