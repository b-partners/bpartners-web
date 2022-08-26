import { useLogin } from 'react-admin'
import { useEffect } from 'react'

const HaLoginPage = () => {
  const login = useLogin()
  useEffect(() => {
    login();
  }, [])
  return <p>Merci de vous connecter sur <a
    href={process.env.REACT_APP_ENV === 'dev' ? 'https://dev.bpartners.app/' : 'https://bpartners.app'}>bpartners.app</a>
  </p>
}

export default HaLoginPage
