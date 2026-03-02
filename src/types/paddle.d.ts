declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (env: "sandbox" | "production") => void };
      Setup: (opts: { token: string; eventCallback?: (ev: unknown) => void }) => void;
      Checkout: {
        open: (opts: {
          items: { priceId: string; quantity: number }[];
          customData?: Record<string, string>;
          customer?: { email?: string };
        }) => void;
      };
    };
  }
}

export {};
