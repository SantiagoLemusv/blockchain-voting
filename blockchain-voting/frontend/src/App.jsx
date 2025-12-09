import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import ConnectWallet from './components/ConnectWallet'
import RegisterVoter from './components/RegisterVoter'
import CreateElection from './components/CreateElection'
import CastVote from './components/CastVote'
import ElectionViewer from './components/ElectionViewer'

function App() {
  const [account, setAccount] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [contracts, setContracts] = useState({})
  
  useEffect(() => {
    if (window.ethereum) {
      initWeb3()
    }
  }, [])
  
  const initWeb3 = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      setAccount(address)
      
      // Aquí cargarías los contratos usando las direcciones de .env
      console.log("Wallet conectada:", address)
    } catch (error) {
      console.error("Error:", error)
    }
  }
  
  const handleConnect = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      await initWeb3()
      toast.success('Wallet conectada')
    } catch (error) {
      toast.error('Error conectando wallet')
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🗳️ Sistema de Votación Blockchain
          </h1>
          <ConnectWallet account={account} onConnect={handleConnect} />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!account ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">
              Conecta tu wallet para comenzar
            </h2>
            <button
              onClick={handleConnect}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Conectar MetaMask
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              {isAdmin && (
                <>
                  <RegisterVoter />
                  <CreateElection />
                </>
              )}
              <CastVote />
            </div>
            <div className="lg:col-span-2">
              <ElectionViewer />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App