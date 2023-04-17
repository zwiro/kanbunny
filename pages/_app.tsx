import Layout from "@/components/layout"
import "@/styles/globals.css"
import type { AppProps } from "next/app"
import type { AppType } from "next/app"
import { trpc } from "../utils/trpc"
import { SessionProvider } from "next-auth/react"

const App: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) => {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  )
}

export default trpc.withTRPC(App)
