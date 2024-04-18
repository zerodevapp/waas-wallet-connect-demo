import { ZeroDevProvider } from "@zerodev/waas";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { polygon } from "viem/chains";
import { injected } from "wagmi/connectors";

const PROJECT_ID = import.meta.env.VITE_POLYGON_PROJECT_ID ?? "";
const ZERODEV_BUNDLER_URL = `https://rpc.zerodev.app/api/v2/bundler/${PROJECT_ID}`;

export default function Providers({ children }: { children: ReactNode }) {
  const config = createConfig({
    chains: [polygon],
    connectors: [injected()],
    transports: {
      [polygon.id]: http(ZERODEV_BUNDLER_URL),
    },
  });

  const queryClient = new QueryClient();
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ZeroDevProvider appId={PROJECT_ID} chain={polygon}>
          {children}
        </ZeroDevProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

