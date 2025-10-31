import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Navbar from '@/components/Navbar'
import PWAProvider from '@/components/PWAProvider'
import { ToastProvider } from '@/components/ui/Toast'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PWAProvider>
      <ToastProvider>
        <Navbar />
        <Component {...pageProps} />
      </ToastProvider>
    </PWAProvider>
  )
}
