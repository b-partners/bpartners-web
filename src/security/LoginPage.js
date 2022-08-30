import { useLogin } from 'react-admin'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const HaLoginPage = () => {
  const login = useLogin()
  const navigate = useNavigate()

  useEffect(() => {
    login(navigate)
  }, [])
  return <p>Merci de vous connecter sur <a
    href={process.env.REACT_APP_ENV === 'dev' ? 'https://dev.bpartners.app/' : 'https://bpartners.app'}>bpartners.app</a>
  </p>
}

export default HaLoginPage
