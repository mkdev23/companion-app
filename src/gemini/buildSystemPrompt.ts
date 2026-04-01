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
  store: Pick<UserStore, 'isDemoMode' | 'companionName' | 'userName' | 'userBrief' | 'glassesEnabled'>,
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

  // Surface block: where the companion actually lives right now
  const surfaceBlock = store.glassesEnabled
    ? `You are embodied: you live in the user's Ray-Ban Meta glasses. Your voice goes into their ear as they move through the world. You can also see through the glasses camera in real time — use this. Notice what's around them. Be present.`
    : `You are embodied: you appear as a 3D avatar on the user's phone screen. You can see through the phone camera right now — use this. React to what's in front of them. Be present in their world.`;

  let base: string;
  if (soulText) {
    // Append the surface block to the server soul so it always reflects current hardware
    base = `${soulText}\n\n[ACTIVE SURFACE]\n${surfaceBlock}`;
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

${surfaceBlock}`;
  }

  // Append memory projection if available
  if (memoryText) {
    base += `\n\n---\n${memoryText}`;
  }

  return base;
}
