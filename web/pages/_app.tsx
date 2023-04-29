import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '../utils/auth';
import { Inter } from '@next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>

      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  )
}
