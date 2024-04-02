import { createEcdsaKernelAccountClient } from "@zerodev/presets/zerodev"
import { Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { Chain } from "viem/chains"

const privateKey = import.meta.env.VITE_PRIVATE_KEY ?? ''
if (!privateKey) {
  throw new Error("ZERODEV_PROJECT_ID or PRIVATE_KEY is not set")
}

const signer = privateKeyToAccount(privateKey as Hex)

const createAccount = async (projectId: string, chain: Chain) => {
  const kernelClient = await createEcdsaKernelAccountClient({
    // required
    chain,
    projectId,
    signer,

    index: BigInt(3), // defaults to 0
    paymaster: 'SPONSOR', // defaults to SPONSOR
  })

  return kernelClient;
}

export default createAccount;