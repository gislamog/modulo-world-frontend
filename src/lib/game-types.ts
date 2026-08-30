// The registry's shape and the helpers that describe it on screen.
//
// Kept free of $env and of fetching so components can import it without
// pulling request-time configuration into the browser bundle.

/** Mirrors the InputRequirement enum in the backend schema. */
export type InputRequirement = 'TOUCH_OK' | 'KEYBOARD_REQUIRED' | 'MOUSE_REQUIRED';

export interface Game {
	id: string;
	slug: string;
	title: string;
	description: string | null;
	inputRequirement: InputRequirement;
}

/**
 * The message shown when a game needs hardware the visitor may not have
 * (#21). Returns null when the game plays fine on touch.
 *
 * Stated up front on the card rather than discovered after loading the
 * game, which is the difference between an informed choice and a broken
 * experience.
 */
export function inputWarning(requirement: InputRequirement): string | null {
	switch (requirement) {
		case 'KEYBOARD_REQUIRED':
			return 'Needs a keyboard';
		case 'MOUSE_REQUIRED':
			return 'Needs a mouse';
		default:
			return null;
	}
}
