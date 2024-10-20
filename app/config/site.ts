import { Chain, liskSepolia, baseSepolia } from "viem/chains";

export type SiteConfig = typeof siteConfig;

export type SiteConfigContracts = {
  chain: Chain;
  farmToken: `0x${string}`;
  usdToken: `0x${string}`;
  entryPoint: `0x${string}`;
  paymaster: `0x${string}`;
  accountFactory: `0x${string}`;
  accountAbstractionSuported: boolean;
};

export const siteConfig = {
  emoji: "🦁",
  name: "AGROBASED",
  description:
    "A platform for tokenization of crops and livestock to attract investments",
  links: {
    github: "https://github.com/nwakaku/AgroBased",
  },
  contracts: {
    baseTestnet: {
      chain: baseSepolia,
      farmToken: "0x48d7468ed801E6399B0EDAD11C704c317C5e0F0a" as `0x${string}`,
      usdToken: "0x02008a8DBc938bd7930bf370617065B6B0c1221a" as `0x${string}`,
      entryPoint: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      paymaster: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      accountFactory:
        "0x0000000000000000000000000000000000000000" as `0x${string}`,
      accountAbstractionSuported: false,
    } as SiteConfigContracts,
  },
};
