import '@/styles/globals.css'
import { useState, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import FooterHolder from '@/components/FooterHolder'
import PWAProvider from '@/components/PWAProvider'
import LoadingScreen from '@/components/LoadingScreen'
import { ToastProvider } from '@/components/ui/Toast'

export default function App({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const showSharedShell = router.pathname !== '/login' && router.pathname !== '/cso' && router.pathname !== '/guard' && router.pathname !== '/organiser'

  useEffect(() => {
    // Initial loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500) // Show loading screen for 1.5 seconds

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Show loading on route change
    const handleStart = () => setLoading(true)
    const handleComplete = () => setLoading(false)

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router])

  return (
    <PWAProvider>
      <ToastProvider>
        {loading && <LoadingScreen />}
        {showSharedShell && <Navbar />}
        <main className={showSharedShell ? 'pt-[calc(4rem+max(0px,env(safe-area-inset-top)))] pb-[calc(4.5rem+max(0px,env(safe-area-inset-bottom)))]' : ''}>
          <Component {...pageProps} />
        </main>
        {showSharedShell && <FooterHolder />}
      </ToastProvider>
    </PWAProvider>
  )
}
