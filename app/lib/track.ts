type Payload = Record<string, string | number | boolean>;
type Handler = (event: string, payload?: Payload) => void;

const handlers: Handler[] = [];

/** Register an analytics vendor, e.g. addTracker((e, p) => window.plausible?.(e, { props: p })) */
export function addTracker(handler: Handler) {
  handlers.push(handler);
}

export function track(event: string, payload?: Payload) {
  for (const h of handlers) {
    try {
      h(event, payload);
    } catch {
      /* analytics must never break the page */
    }
  }
  if (process.env.NODE_ENV !== "production") console.debug("[track]", event, payload);
}
