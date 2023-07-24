import dynamic from "next/dynamic"
import { getSession, type GetSessionParams } from "next-auth/react"
import { trpc } from "@/utils/trpc"
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
      userProjects={userProjects.data || []}
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

  return {
    props: {},
  }
}
