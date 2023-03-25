import type { AppProps } from 'next/app'
import { CssBaseline, StylesProvider } from '@material-ui/core'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StylesProvider injectFirst>
      <CssBaseline />
      <Component {...pageProps} />
    </StylesProvider>
  )
}
export default MyApp