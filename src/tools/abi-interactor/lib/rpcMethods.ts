export interface RpcParamDef {
  name: string;
  placeholder: string;
  defaultValue?: string;
}

export interface RpcMethodDef {
  method: string;
  descriptionKey: string;
  params: RpcParamDef[];
}

export const RPC_METHODS: RpcMethodDef[] = [
  {
    method: "eth_chainId",
    descriptionKey: "tools.abiInteractor.rpc.descriptions.eth_chainId",
    params: [],
  },
  {
    method: "eth_blockNumber",
    descriptionKey: "tools.abiInteractor.rpc.descriptions.eth_blockNumber",
    params: [],
  },
  {
    method: "eth_gasPrice",
    descriptionKey: "tools.abiInteractor.rpc.descriptions.eth_gasPrice",
    params: [],
  },
  {
    method: "eth_getBalance",
    descriptionKey: "tools.abiInteractor.rpc.descriptions.eth_getBalance",
    params: [
      { name: "address", placeholder: "0x..." },
      { name: "block", placeholder: "latest", defaultValue: "latest" },
    ],
  },
  {
    method: "eth_getTransactionCount",
    descriptionKey:
      "tools.abiInteractor.rpc.descriptions.eth_getTransactionCount",
    params: [
      { name: "address", placeholder: "0x..." },
      { name: "block", placeholder: "latest", defaultValue: "latest" },
    ],
  },
  {
    method: "eth_getCode",
    descriptionKey: "tools.abiInteractor.rpc.descriptions.eth_getCode",
    params: [
      { name: "address", placeholder: "0x..." },
      { name: "block", placeholder: "latest", defaultValue: "latest" },
    ],
  },
  {
    method: "eth_getTransactionByHash",
    descriptionKey:
      "tools.abiInteractor.rpc.descriptions.eth_getTransactionByHash",
    params: [{ name: "txHash", placeholder: "0x..." }],
  },
  {
    method: "eth_getTransactionReceipt",
    descriptionKey:
      "tools.abiInteractor.rpc.descriptions.eth_getTransactionReceipt",
    params: [{ name: "txHash", placeholder: "0x..." }],
  },
  {
    method: "eth_getBlockByNumber",
    descriptionKey: "tools.abiInteractor.rpc.descriptions.eth_getBlockByNumber",
    params: [
      { name: "block", placeholder: "latest", defaultValue: "latest" },
      { name: "fullTransactions", placeholder: "false", defaultValue: "false" },
    ],
  },
  {
    method: "eth_call",
    descriptionKey: "tools.abiInteractor.rpc.descriptions.eth_call",
    params: [
      { name: "to", placeholder: "0x..." },
      { name: "data", placeholder: "0x..." },
      { name: "block", placeholder: "latest", defaultValue: "latest" },
    ],
  },
  {
    method: "eth_estimateGas",
    descriptionKey: "tools.abiInteractor.rpc.descriptions.eth_estimateGas",
    params: [
      { name: "to", placeholder: "0x..." },
      { name: "data", placeholder: "0x" },
      { name: "from", placeholder: "0x... (optional)" },
    ],
  },
];
