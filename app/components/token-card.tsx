"use client";

import { useMemo } from "react";
import { SiteConfigContracts } from "@/config/site";
import { TokenCardHeader } from "./token-card-header";
import { TokenCardRecords } from "./token-card-records";
import { Separator } from "./ui/separator";
import useMetadataLoader from "@/hooks/useMetadataLoader";
import { useReadContract, useReadContracts } from "wagmi";
import { Skeleton } from "./ui/skeleton";
import { farmTokenAbi } from "@/contracts/abi/farmToken";
import { FarmTokenMetadata } from "@/types/farm-token-metadata";
import { Abi } from "viem";

const NATIVE_TOKEN_SYMBOL = "ETH";
const DEFAULT_REPUTATION_SCORE = 50;

interface TokenCardProps {
  token: string;
  contracts: SiteConfigContracts;
}

interface TokenParams {
  investmentAmount: bigint;
  investor: `0x${string}`;
  returnAmount: bigint;
  returnDate: bigint;
}

// The actual return type from useMetadataLoader
interface MetadataLoaderResponse {
  data: FarmTokenMetadata | undefined;
  isLoaded: boolean;  // Note: isLoaded not isLoading
}

type WagmiContractCall = {
  abi?: Abi | undefined;
  functionName?: string | undefined;
  args?: readonly unknown[] | undefined;
  address?: `0x${string}` | undefined;
  chainId?: number | undefined;
};


export function TokenCard({ token, contracts }: TokenCardProps): JSX.Element {
  const contractCalls = useMemo(
    () =>
      [
        {
          address: contracts.farmToken,
          abi: farmTokenAbi as Abi,
          functionName: "ownerOf",
          args: [BigInt(token)],
        },
        {
          address: contracts.farmToken,
          abi: farmTokenAbi as Abi,
          functionName: "getParams",
          args: [BigInt(token)],
        },
        {
          address: contracts.farmToken,
          abi: farmTokenAbi as Abi,
          functionName: "tokenURI",
          args: [BigInt(token)],
        },
      ] satisfies WagmiContractCall[],
    [token, contracts.farmToken]
  );

  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: contractCalls,
  });

  const [tokenOwner, tokenParams, tokenMetadataUri] = data || [];

  const { data: reputationScore } = useReadContract({
    address: contracts.farmToken,
    abi: farmTokenAbi,
    functionName: "calculateReputationScore",
    args: [tokenOwner?.result as `0x${string}`],
    query: {
      enabled: Boolean(tokenOwner?.result),
    },
  });

  const { data: tokenMetadata} =
    useMetadataLoader<FarmTokenMetadata>(
      tokenMetadataUri?.result as string | undefined
    ) as MetadataLoaderResponse;

  console.log(tokenMetadata);

  if (isLoading) {
    return <Skeleton className="w-full h-8" />;
  }

  if (
    isError ||
    !tokenOwner?.result ||
    !tokenParams?.result ||
    !tokenMetadata
  ) {
    return <div>Error loading token data</div>;
  }

  const { investmentAmount, investor, returnAmount, returnDate } =
    tokenParams.result as TokenParams;
  const finalReputationScore = Number(
    reputationScore ?? DEFAULT_REPUTATION_SCORE
  );

  return (
    <div className="w-full flex flex-col items-center border rounded-2xl px-6 py-8">
      <TokenCardHeader
        token={token}
        tokenMetadata={tokenMetadata}
        tokenOwner={tokenOwner.result as `0x${string}`}
        tokenInvestmentAmount={investmentAmount.toString()}
        tokenInvestmentTokenSymbol={NATIVE_TOKEN_SYMBOL}
        tokenInvestor={investor}
        tokenReturnAmount={returnAmount.toString()}
        tokenReturnDate={returnDate.toString()}
        reputationScore={finalReputationScore}
        contracts={contracts}
        onUpdate={refetch}
      />
      <Separator className="my-6" />
      <TokenCardRecords
        token={token}
        tokenMetadata={tokenMetadata}
        tokenOwner={tokenOwner.result as `0x${string}`}
        tokenInvestmentTokenSymbol={NATIVE_TOKEN_SYMBOL}
        tokenReturnDate={returnDate.toString()}
        contracts={contracts}
        onUpdate={refetch}
      />
    </div>
  );
}
