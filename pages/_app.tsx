import '@/styles/globals.css'
import { useState, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import FooterHolder from '@/components/FooterHolder'
import PoweredBySocio from '@/components/PoweredBySocio'
import PWAProvider from '@/components/PWAProvider'
import LoadingScreen from '@/components/LoadingScreen'
import { ToastProvider } from '@/components/ui/Toast'

export default function App({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const showSharedShell = router.pathname !== '/login'
  const noScrollRoutes = ['/login', '/verify']
  const isNoScrollRoute = noScrollRoutes.includes(router.pathname)

  useEffect(() => {
    const handleStart = (url: string) => {
      const path = url.split('?')[0]
      if (path === '/') return
      setLoading(true)
    }
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

  useEffect(() => {
    if (typeof document === 'undefined') return

    if (isNoScrollRoute) {
      document.documentElement.classList.add('overflow-hidden')
      document.body.classList.add('overflow-hidden')
    } else {
      document.documentElement.classList.remove('overflow-hidden')
      document.body.classList.remove('overflow-hidden')
    }

    return () => {
      document.documentElement.classList.remove('overflow-hidden')
      document.body.classList.remove('overflow-hidden')
    }
  }, [isNoScrollRoute])

  const mainClassName = [
    showSharedShell
      ? 'pt-[calc(4rem+max(0px,env(safe-area-inset-top)))] pb-[calc(5.25rem+max(0px,env(safe-area-inset-bottom)))] md:pb-0'
      : '',
    isNoScrollRoute ? 'h-dvh overflow-hidden' : ''
  ].filter(Boolean).join(' ')

  return (
    <PWAProvider>
      <ToastProvider>
        {loading && <LoadingScreen />}
        {showSharedShell && <div className="fixed top-0 left-0 right-0 z-[60] h-[env(safe-area-inset-top)] bg-white" />}
        {showSharedShell && <Navbar />}
        <main className={mainClassName}>
          <Component {...pageProps} />
          {showSharedShell && !isNoScrollRoute && <PoweredBySocio />}
        </main>
        {showSharedShell && <FooterHolder />}
      </ToastProvider>
    </PWAProvider>
  )
}
