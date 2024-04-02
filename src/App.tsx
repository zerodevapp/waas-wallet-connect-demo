import { useState, useEffect } from 'react'
import createAccount from './createAccount'
import { KernelAccountClient } from '@zerodev/sdk'
import { useWalletConnect } from '@zerodev/waas'
import { polygon, base } from "viem/chains"
import './App.css'

const baseZeroDevProjectId = import.meta.env.VITE_BASE_PROJECT_ID ?? ''
const polygonZeroDevProjectId = import.meta.env.VITE_POLYGON_PROJECT_ID ?? ''

if (!baseZeroDevProjectId || !polygonZeroDevProjectId) {
  throw new Error('Project IDs not found')
}

function App() {
  const [account, setAccount] = useState()
  const [uri, setUri] = useState('')
  const [chain, setChain] = useState<'base' | 'polygon'>('base')

  useEffect(() => {
    const getAccount = async () => {
      const projectId = chain === 'base' ? baseZeroDevProjectId : polygonZeroDevProjectId
      const chainObj = chain === 'base' ? base : polygon
      const account = (await createAccount(projectId, chainObj)) as KernelAccountClient;
      setAccount(account);
    }
    getAccount()
  }, [chain])

  const {
    connect,
    sessionProposal,
    approve,
    reject, 
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

  if (!account) {
    return <p className="text-center text-lg">Loading...</p>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">ZeroDev WalletConnect Demo</h1>
      {account && (
        <>
          <p className="text-center mb-2"><strong>Address: </strong> {(account as KernelAccountClient).account.address}</p>
          <p className="text-center mb-2"><strong>Chain: </strong> {(account as KernelAccountClient).chain.id}</p>
        </>
      )}
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={() => setChain(chain === 'base' ? 'polygon' : 'base')}
      >
        Switch to {chain === 'base' ? 'Polygon' : 'Base'}
      </button>
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
              onClick={() => approve(sessionProposal)}
            >
              Approve
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => reject()}
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
