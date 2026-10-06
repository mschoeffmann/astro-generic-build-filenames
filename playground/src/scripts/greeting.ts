export const greet = (element: HTMLElement) => {
	element.addEventListener("click", async () => {
		// Dynamic import to produce a separate chunk.
		const { formatGreeting } = await import("./format.js");
		element.textContent = formatGreeting(element.dataset.name ?? "Astro");
	});
};
