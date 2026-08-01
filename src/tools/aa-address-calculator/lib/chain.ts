import { Contract, JsonRpcProvider } from "ethers";

/**
 * Check whether a contract is deployed at the given address.
 * Returns true if there is code at the address.
 */
export async function checkDeployed(
  rpcUrl: string,
  address: string,
): Promise<boolean> {
  const provider = new JsonRpcProvider(rpcUrl);
  const code = await provider.getCode(address);
  return code !== "0x";
}

export interface OwnerQueryResult {
  owners: string[];
  /** The method that was used to query */
  method: string;
}

/**
 * Query the owner(s) of a smart account at the given address.
 * Tries the provided method signature against the contract.
 *
 * @param rpcUrl - RPC endpoint URL
 * @param address - The smart account address to query
 * @param ownerQuery - The ABI method signature, e.g. "function owner() view returns (address)"
 */
export async function queryOwners(
  rpcUrl: string,
  address: string,
  ownerQuery: string,
): Promise<OwnerQueryResult> {
  const provider = new JsonRpcProvider(rpcUrl);
  const contract = new Contract(address, [ownerQuery], provider);

  // Parse method name from signature
  const methodName = ownerQuery.match(/function\s+(\w+)/)?.[1];
  if (!methodName) {
    throw new Error("Invalid owner query method signature");
  }

  const result = await contract[methodName]();

  // Handle both single address and array returns
  if (Array.isArray(result)) {
    return { owners: result as string[], method: methodName };
  }
  return { owners: [result as string], method: methodName };
}

/**
 * Query owners from a Coinbase Smart Wallet by iterating ownerAt(uint256).
 * The contract stores owners at sequential indices; we call until it reverts.
 */
export async function queryCoinbaseOwners(
  rpcUrl: string,
  address: string,
): Promise<OwnerQueryResult> {
  const provider = new JsonRpcProvider(rpcUrl);
  const contract = new Contract(
    address,
    ["function ownerAt(uint256 index) view returns (bytes)"],
    provider,
  );

  const owners: string[] = [];
  for (let i = 0; i < 20; i++) {
    try {
      const ownerBytes: string = await contract.ownerAt(i);
      if (!ownerBytes || ownerBytes === "0x") break;
      owners.push(ownerBytes);
    } catch {
      break;
    }
  }

  if (owners.length === 0) {
    throw new Error("No owners found or contract does not support ownerAt");
  }

  return { owners, method: "ownerAt" };
}
