import {
  createKernelAccount,
  createZeroDevPaymasterClient,
  createKernelAccountClient,
} from "@zerodev/sdk"
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import { http, type Hex, createPublicClient } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless"
import { polygon } from "viem/chains";

const PAYMASTER_RPC = 'https://rpc.zerodev.app/api/v2/paymaster/'
const BUNDLER_RPC= 'https://rpc.zerodev.app/api/v2/bundler/'
const chain = polygon
const projectId = import.meta.env.VITE_POLYGON_PROJECT_ID ?? ''

const privateKey = import.meta.env.VITE_PRIVATE_KEY ?? ''
if (!privateKey) {
  throw new Error("ZERODEV_PROJECT_ID or PRIVATE_KEY is not set")
}

const signer = privateKeyToAccount(privateKey as Hex)
const entryPoint = ENTRYPOINT_ADDRESS_V07

const createAccount = async () => {
  const publicClient = createPublicClient({
    transport: http(`${BUNDLER_RPC}${projectId}`),
  });
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    // eslint-disable-next-line
    signer: signer as any,
    entryPoint,
  })

  const account = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint,
  })
  console.log("My account:", account.address)

  const kernelClient = createKernelAccountClient({
    account,
    entryPoint,
    chain,
    bundlerTransport: http(`${BUNDLER_RPC}${projectId}`),
    middleware: {
      sponsorUserOperation: async ({ userOperation }) => {
        const paymasterClient = createZeroDevPaymasterClient({
          chain,
          transport: http(`${PAYMASTER_RPC}${projectId}`),
          entryPoint,
        })
        return paymasterClient.sponsorUserOperation({
          userOperation,
          entryPoint,
        })
      },
    },
  })
  return kernelClient
}

export default createAccount;