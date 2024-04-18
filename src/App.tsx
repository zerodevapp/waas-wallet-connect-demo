import { useKernelClient } from '@zerodev/waas'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  const { isConnected } = useKernelClient()

  return (
    <div>
      {isConnected ? <Dashboard /> : <SignIn />}
    </div>
  )
}

export default App
