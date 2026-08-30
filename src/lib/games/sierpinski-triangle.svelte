<script lang="ts">
	// Sierpinski's triangle by the chaos game. Ported from the portfolio
	// site's React demo; the arithmetic lives in ./sierpinski.ts so it can
	// be tested without a canvas.
	import { onDestroy } from 'svelte';
	import { isInside, step, vertices, type Point } from './sierpinski';

	const SIZE = 420;
	const WALK_MS = 420;
	const corners = vertices(SIZE);

	let canvas = $state<HTMLCanvasElement | null>(null);
	let current: Point | null = null;
	let points: Point[] = [];

	let started = $state(false);
	let running = $state(false);
	let walkthrough = $state(false);
	let count = $state(0);
	let limit = $state(3000);
	let pointSize = $state(1.6);

	let frame: number | undefined;
	let timer: ReturnType<typeof setTimeout> | undefined;

	// Read inside the animation loop, which is not reactive, so plain
	// variables kept in step with the bound state.
	let limitNow = $derived(limit);
	let sizeNow = $derived(pointSize);

	function context(): CanvasRenderingContext2D | null {
		return canvas?.getContext('2d') ?? null;
	}

	function paintBackground(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = '#12141c';
		ctx.fillRect(0, 0, SIZE, SIZE);
	}

	function drawCorners(ctx: CanvasRenderingContext2D, highlight = -1) {
		corners.forEach((v, i) => {
			ctx.fillStyle = i === highlight ? '#ffb020' : '#5eead4';
			ctx.beginPath();
			ctx.arc(v.x, v.y, i === highlight ? 7 : 5, 0, Math.PI * 2);
			ctx.fill();
		});
	}

	function plot(ctx: CanvasRenderingContext2D, p: Point) {
		ctx.fillStyle = '#eef0f6';
		ctx.beginPath();
		ctx.arc(p.x, p.y, sizeNow, 0, Math.PI * 2);
		ctx.fill();
	}

	/** Full repaint, used by the walkthrough so its guides do not smear. */
	function repaint(
		ctx: CanvasRenderingContext2D,
		highlight = -1,
		guide?: { from: Point; vertex: Point; mid: Point }
	) {
		paintBackground(ctx);
		for (const p of points) {
			plot(ctx, p);
		}
		drawCorners(ctx, highlight);

		if (!guide) {
			return;
		}

		ctx.strokeStyle = '#93a8f8';
		ctx.lineWidth = 1.5;
		ctx.setLineDash([5, 4]);
		ctx.beginPath();
		ctx.moveTo(guide.from.x, guide.from.y);
		ctx.lineTo(guide.vertex.x, guide.vertex.y);
		ctx.stroke();
		ctx.setLineDash([]);

		ctx.fillStyle = '#eef0f6';
		ctx.beginPath();
		ctx.arc(guide.from.x, guide.from.y, 4, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = '#f472b6';
		ctx.beginPath();
		ctx.arc(guide.mid.x, guide.mid.y, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = '#f472b6';
		ctx.beginPath();
		ctx.arc(guide.mid.x, guide.mid.y, 8, 0, Math.PI * 2);
		ctx.stroke();
	}

	function stopTimers() {
		if (frame !== undefined) {
			cancelAnimationFrame(frame);
			frame = undefined;
		}
		if (timer !== undefined) {
			clearTimeout(timer);
			timer = undefined;
		}
	}

	function reset() {
		stopTimers();
		current = null;
		points = [];
		count = 0;
		started = false;
		running = false;

		const ctx = context();
		if (ctx) {
			paintBackground(ctx);
			drawCorners(ctx);
		}
	}

	/** One step of the walk. Returns whether the limit still allows more. */
	function advance(showGuide: boolean): boolean {
		const ctx = context();
		if (!ctx || !current) {
			return false;
		}

		if (count >= limitNow) {
			return false;
		}

		const { point, vertexIndex } = step(current, corners);
		points.push(point);

		if (showGuide) {
			repaint(ctx, vertexIndex, { from: current, vertex: corners[vertexIndex], mid: point });
		} else {
			plot(ctx, point);
		}

		current = point;
		count += 1;

		return count < limitNow;
	}

	function runFast() {
		const tick = () => {
			if (advance(false)) {
				frame = requestAnimationFrame(tick);
			} else {
				running = false;
			}
		};
		frame = requestAnimationFrame(tick);
	}

	function runWalkthrough() {
		const tick = () => {
			if (advance(true)) {
				timer = setTimeout(tick, WALK_MS);
			} else {
				running = false;
			}
		};
		timer = setTimeout(tick, WALK_MS);
	}

	// Drives the walk. Reruns whenever running or the mode changes, and
	// always clears the previous loop first so the two never overlap.
	$effect(() => {
		stopTimers();

		if (!running) {
			return;
		}

		if (walkthrough) {
			runWalkthrough();
		} else {
			runFast();
		}

		return stopTimers;
	});

	// The canvas is null until the element is bound, so the opening frame
	// is painted here rather than at init.
	$effect(() => {
		const ctx = context();
		if (ctx && !started) {
			paintBackground(ctx);
			drawCorners(ctx);
		}
	});

	onDestroy(stopTimers);

	/** Places the first point, in canvas coordinates. */
	function placeFirstPoint(x: number, y: number) {
		const ctx = context();
		if (!ctx || current) {
			return;
		}

		current = { x, y };
		started = true;

		ctx.fillStyle = '#fbbf24';
		ctx.beginPath();
		ctx.arc(x, y, 4, 0, Math.PI * 2);
		ctx.fill();

		running = true;
	}

	function onCanvasClick(event: MouseEvent) {
		if (!canvas) {
			return;
		}

		const rect = canvas.getBoundingClientRect();
		placeFirstPoint(
			((event.clientX - rect.left) / rect.width) * SIZE,
			((event.clientY - rect.top) / rect.height) * SIZE
		);
	}

	// Keyboard equivalent of the click (#21, #26): the game is playable
	// without a pointing device, so it does not need a mouse. Enter and
	// Space start from the centroid, which is inside the triangle.
	function onCanvasKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ') {
			return;
		}

		event.preventDefault();

		if (current) {
			running = !running;
			return;
		}

		const centroid = {
			x: (corners[0].x + corners[1].x + corners[2].x) / 3,
			y: (corners[0].y + corners[1].y + corners[2].y) / 3
		};

		placeFirstPoint(centroid.x, centroid.y);
	}

	const insideNote = $derived(
		started && current && !isInside(current, corners)
			? 'The walk is still moving in towards the triangle.'
			: null
	);
</script>

<div class="game">
	<canvas
		bind:this={canvas}
		width={SIZE}
		height={SIZE}
		class="board"
		tabindex="0"
		aria-label="Sierpinski triangle canvas. Press Enter to place the first point and start, and again to pause or resume."
		onclick={onCanvasClick}
		onkeydown={onCanvasKeydown}
	></canvas>

	<div class="controls">
		<label>
			Point limit
			<input
				type="number"
				min="50"
				max="20000"
				step="50"
				bind:value={limit}
				onchange={() => (limit = Math.max(50, Math.min(20000, limit || 50)))}
			/>
		</label>

		<label>
			Point size
			<input
				type="number"
				min="0.5"
				max="6"
				step="0.1"
				bind:value={pointSize}
				onchange={() => (pointSize = Math.max(0.5, Math.min(6, pointSize || 0.5)))}
			/>
		</label>

		<label class="check">
			<input type="checkbox" bind:checked={walkthrough} onchange={() => (running = false)} />
			Walkthrough
		</label>

		{#if started}
			<button type="button" onclick={() => (running = !running)}>
				{running ? 'Pause' : 'Keep going'}
			</button>
		{/if}

		<button type="button" onclick={reset}>Reset</button>

		<!-- aria-live so the count reaches a screen reader without the
		     visitor having to hunt for it. -->
		<span class="stat" aria-live="polite">
			{count.toLocaleString()} / {limit.toLocaleString()} points
		</span>
	</div>

	<p class="note">
		{#if !started}
			Click the canvas, or focus it and press Enter, to place the first point. Walkthrough slows
			each step so you can watch the construction.
		{:else if walkthrough}
			Walkthrough: gold marks the chosen corner, the dashed line runs to it, and pink marks the
			midpoint that becomes the next point.
		{:else}
			Every new point is the midpoint between the last one and a corner picked at random.
		{/if}
	</p>

	{#if insideNote}
		<p class="note">{insideNote}</p>
	{/if}
</div>

<style>
	.game {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		width: 100%;
		padding: 1rem;
	}

	.board {
		width: min(100%, 420px);
		height: auto;
		aspect-ratio: 1;
		border-radius: 0.5rem;
		background: #12141c;
		cursor: crosshair;
		touch-action: manipulation;
	}

	.board:focus-visible {
		outline: 3px solid #0b57d0;
		outline-offset: 3px;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1rem;
		align-items: center;
		justify-content: center;
	}

	label {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9375rem;
		color: #1a1a1a;
	}

	input[type='number'] {
		width: 6rem;
		min-height: 44px;
		padding: 0.25rem 0.5rem;
		border: 1px solid #767676;
		border-radius: 0.25rem;
		font: inherit;
	}

	.check input {
		width: 20px;
		height: 20px;
	}

	input:focus-visible,
	button:focus-visible {
		outline: 3px solid #0b57d0;
		outline-offset: 2px;
	}

	button {
		min-height: 44px;
		padding: 0 1rem;
		border: 1px solid #767676;
		border-radius: 0.25rem;
		background: #fff;
		font: inherit;
		color: #1a1a1a;
		cursor: pointer;
	}

	button:hover {
		background: #f0f0f0;
	}

	.stat {
		font-size: 0.9375rem;
		font-variant-numeric: tabular-nums;
		color: #595959;
	}

	.note {
		margin: 0;
		max-width: 34rem;
		font-size: 0.9375rem;
		line-height: 1.5;
		text-align: center;
		color: #595959;
	}
</style>
