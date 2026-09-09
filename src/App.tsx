import { useState, useEffect } from 'react'
import Splash from './Splash'
import MainScreen from './layout/MainScreen'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 9000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <Splash />
  }

  return <MainScreen />
}

export default App