import { useState, useEffect } from 'react'
import createAccount from './createAccount'
import { KernelAccountClient } from '@zerodev/sdk'
import { useWalletConnect } from '@zerodev/waas'
import { polygonMumbai, polygon, base } from "viem/chains"
import { zeroAddress } from 'viem'
import './App.css'

const baseZeroDevProjectId = import.meta.env.VITE_BASE_PROJECT_ID ?? ''
const polygonZeroDevProjectId = import.meta.env.VITE_POLYGON_PROJECT_ID ?? ''
const mumbaiZeroDevProjectId = import.meta.env.VITE_MUMBAI_PROJECT_ID ?? ''

if (!baseZeroDevProjectId || !polygonZeroDevProjectId) {
  throw new Error('Project IDs not found')
}

function App() {
  const [account, setAccount] = useState()
  const [uri, setUri] = useState('')
  const [chain, setChain] = useState<'base' | 'polygon' | 'mumbai'>('base')
  const [isDeployed, setIsDeployed] = useState(false)

  useEffect(() => {
    const getAccount = async () => {
      let projectId;
      let chainObj;
      switch (chain) {
        case 'base':
          projectId = baseZeroDevProjectId
          chainObj = base
          break
        case 'polygon':
          projectId = polygonZeroDevProjectId
          chainObj = polygon
          break
        case 'mumbai':
          projectId = mumbaiZeroDevProjectId
          chainObj = polygonMumbai
          break
        default:
          throw new Error('Unsupported chain')
      }
      const account = (await createAccount(projectId, chainObj)) as KernelAccountClient;
      setAccount(account);
    }
    getAccount()
  }, [chain])

  useEffect(() => {
    const isContractWallet = async () => {
      if (!account) return false;
      const bytecode = await (account as KernelAccountClient).account.client.getBytecode({
        address: (account as KernelAccountClient).account.address
      });
      setIsDeployed(!!bytecode);
    }
    isContractWallet()
  }, [account, chain])

  const {
    connect,
    sessionProposal,
    approveSessionProposal,
    rejectSessionProposal, 
    isLoading, 
    error, 
    disconnect, 
    sessions,
    sessionRequest,
    approveSessionRequest,
    rejectSessionRequest
  } = useWalletConnect({
    kernelClient: account
  })

  const deployWallet = async () => {
    if (!account) return;
    console.log('deploying wallet')
    const txnHash = await (account as KernelAccountClient).sendTransaction({
      to: zeroAddress,
      value: BigInt(0),
      data: "0x",
    })
    console.log("txn hash:", txnHash)
  }

  if (!account) {
    return <p className="text-center text-lg">Loading...</p>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">ZeroDev WalletConnect Demo</h1>
      {account && (
        <div>
          <p className="text-center mb-2"><strong>Address: </strong> {(account as KernelAccountClient).account.address}</p>
          <p className="text-center mb-2"><strong>Is account deployed: </strong> {isDeployed ? 'Yes' : 'No'}</p>
          {!isDeployed && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
              onClick={deployWallet}
            >
              Deploy Wallet
            </button>
          )}
          <p className="text-center mb-2"><strong>Chain: </strong> {(account as KernelAccountClient).chain.id}</p>
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold mb-2">Change Chain</h2>
        <button
          className={`bg-blue-500 text-white font-bold py-2 px-4 rounded mb-4 ${chain === 'base' && 'opacity-50 cursor-not-allowed'}`}
          disabled={chain === 'base'}
          onClick={() => setChain('base')}
        >
          Base
        </button>
        <button
          className={`bg-blue-500 text-white font-bold py-2 px-4 rounded mb-4 ${chain === 'polygon' && 'opacity-50 cursor-not-allowed'}`}
          disabled={chain === 'polygon'}
          onClick={() => setChain('polygon')}
        >
          Polygon
        </button>
        <button
          className={`bg-blue-500 text-white font-bold py-2 px-4 rounded mb-4 ${chain === 'mumbai' && 'opacity-50 cursor-not-allowed'}`}
          disabled={chain === 'mumbai'}
          onClick={() => setChain('mumbai')}
        >
          Mumbai
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 p-2 border border-gray-300"
          placeholder="URI"
          value={uri}
          onChange={(e) => setUri(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => connect(uri)}
        >
          Connect
        </button>
      </div>
      {sessionProposal && (
        <div className="mb-4">
          <p className="mb-2">{sessionProposal.verifyContext.verified.origin}</p>
          <div className="flex gap-2 justify-center">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => approveSessionProposal(sessionProposal)}
            >
              Approve
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => rejectSessionProposal()}
            >
              Reject
            </button>
          </div>
        </div>
      )}
      {isLoading && <p className="text-center mb-2">Loading...{isLoading}</p>}
      {error && <p className="text-red-500 text-center mb-2 break-words">Error: {error.message}</p>}
      <h2 className="text-xl font-semibold mb-2">Sessions</h2>
      {sessions.length > 0 ? (
        sessions.map((session) => (
          <div className="flex flex-row gap-4 mb-2" key={session.topic}>
            <p>{session.peer.metadata.name}</p>
            <button
              className="ml-auto bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => disconnect(session)}
            >
              Disconnect
            </button>
          </div>
        ))
      ) : (
        <p className="text-center mb-2">No sessions</p>
      )}
      {sessionRequest && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Session Request</h3>
          <div className="mb-4">
            <p className="text-lg"><strong>Method:</strong> {sessionRequest.params.request.method}</p>
            <p className="break-words"><strong>Params:</strong> {JSON.stringify(sessionRequest.params.request.params)}</p>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => approveSessionRequest()}
            >
              Approve
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => rejectSessionRequest()}
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
