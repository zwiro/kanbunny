import dynamic from "next/dynamic"
import { trpc } from "@/utils/trpc"
import { getSession, type GetSessionParams } from "next-auth/react"
import { createServerSideHelpers } from "@trpc/react-query/server"
import superjson from "superjson"
import { prisma } from "@/server/db"
import { appRouter } from "@/server/routers/_app"
import { LoadingDots } from "@/components/LoadingDots"

const Dashboard = dynamic(() => import("@/components/Dashboard"), {
  loading: () => (
    <LoadingDots
      className="absolute inset-0 m-auto h-full items-center"
      dotClassName="w-12 h-12"
    />
  ),
})

export default function Home() {
  const userProjects = trpc.project.getByUser.useQuery()

  return (
    <Dashboard
      userProjects={userProjects.data}
      isLoading={userProjects.isLoading}
    />
  )
}

export async function getServerSideProps(params: GetSessionParams) {
  const session = await getSession(params)
  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
      },
    }
  }
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, session },
    transformer: superjson,
  })

  await helpers.project.getByUser.prefetch()

  return {
    props: { trpcState: helpers.dehydrate() },
  }
}
