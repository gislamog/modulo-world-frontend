import type { LayoutLoad } from './$types';
import { playableSlugs } from '$lib/game-component';

// Which games actually have a component, published to every page so the
// sidebar can link the playable ones and mark the rest as unfinished.
//
// A universal load rather than a server one: the answer comes from a
// build-time glob, not from a request, so making the browser ask the
// server for it would be a round trip for a constant.
export const load: LayoutLoad = () => {
	return { playableSlugs: playableSlugs() };
};
