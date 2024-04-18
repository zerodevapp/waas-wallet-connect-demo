import { useSetKernelClient } from '@zerodev/waas'
import createAccount from '../createAccount'

export default function SignIn() {
  const { setKernelClient } = useSetKernelClient();

  const signIn = async () => {
    const account = await createAccount()
    setKernelClient(account)
  }
  return (
    <div>
      <button onClick={signIn}>Sign In</button>
    </div>
  )
}

