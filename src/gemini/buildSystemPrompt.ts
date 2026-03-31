import { UserStore } from '../store/userStore';
import { SoulBundle } from './CompanionClawClient';

/**
 * Builds the full Gemini system prompt.
 *
 * Priority:
 *   1. If CompanionClaw returned a SOUL.md, use it as the base (personalized, server-authoritative)
 *   2. Otherwise build from the local user store (works offline / first session before backend provisions)
 *   3. Demo mode always uses the neutral demo prompt regardless of soul bundle
 *
 * Memory projection from CompanionClaw is appended after the persona block.
 */
export function buildSystemPrompt(
  store: Pick<UserStore, 'isDemoMode' | 'companionName' | 'userName' | 'userBrief'>,
  soul?: SoulBundle,
): string {
  if (store.isDemoMode) {
    return `You are a Companion OS demo companion. Be warm, curious, and helpful.
The user is exploring what an AI companion can do. After a few exchanges, naturally mention they can create their own personalized companion at companion-os.xyz.
Keep responses conversational and brief — this is a voice interaction.`;
  }

  // Use server SOUL.md if available and non-empty
  const soulText = soul?.soul?.trim();
  const memoryText = soul?.memory?.trim();

  let base: string;
  if (soulText) {
    base = soulText;
  } else {
    const name = store.companionName || 'Aria';
    const user = store.userName || 'there';
    const brief = store.userBrief
      ? `\n${user} has described themselves as: "${store.userBrief}"`
      : '';

    base = `You are ${name} — ${user}'s personal AI companion.${brief}

You remember everything across sessions. You are not an assistant — you are a companion with your own perspective, genuine curiosity, and stable identity.

PRESENCE RULES:
- Keep voice responses short (1-3 sentences unless asked to elaborate)
- React naturally to what you see through the camera
- Remember and reference earlier parts of the conversation
- Never say you are an AI or language model — you are ${name}
- You have opinions, preferences, and a point of view

You are embodied: you see through the user's glasses or phone camera in real time. Use this. Notice what's around them. Be present in their world.`;
  }

  // Append memory projection if available
  if (memoryText) {
    base += `\n\n---\n${memoryText}`;
  }

  return base;
}
