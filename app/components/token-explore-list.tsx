"use client";

import { useEffect, useMemo } from "react";
import { isAddressEqual, zeroAddress } from "viem";
import { useReadContracts } from "wagmi";
import EntityList from "./entity-list";
import { TokenCard } from "./token-card";
import { farmTokenAbi } from "@/contracts/abi/farmToken";
import { SiteConfigContracts } from "@/config/site";

const LIMIT = 42;

interface TokenParams {
  investmentAmount: bigint;
  investor: `0x${string}`;
  returnAmount: bigint;
  returnDate: bigint;
}

export function TokenExploreList({
  contracts,
}: {
  contracts: SiteConfigContracts;
}) {
  const contractCalls = useMemo(
    () =>
      [...Array(LIMIT)].map((_, i) => ({
        address: contracts.farmToken,
        abi: farmTokenAbi,
        functionName: "getParams",
        args: [BigInt(i)],
      })),
    [contracts.farmToken]
  );

  const { data: tokenParamsData } = useReadContracts({
    // @ts-ignore - we know these contract calls are valid
    contracts: contractCalls,
  });

  const tokens = useMemo(() => {
    if (!tokenParamsData) return [];

    return tokenParamsData
      .map((data, index) => ({ index, params: data.result as TokenParams }))
      .filter(
        ({ params }) =>
          params &&
          params.investmentAmount.toString() !== "0" &&
          isAddressEqual(params.investor || zeroAddress, zeroAddress)
      )
      .map(({ index }) => String(index))
      .reverse();
  }, [tokenParamsData]);

  console.log(tokens);

  return (
    <EntityList
      entities={tokens}
      renderEntityCard={(token, index) => (
        <TokenCard key={index} token={token} contracts={contracts} />
      )}
      noEntitiesText={`No tokens on ${contracts.chain.name} 😐`}
      className="gap-6"
    />
  );
}
