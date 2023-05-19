import { trpc } from "./trpc"

export default function getProjectOrder(projectId: string) {
  const project = trpc.project.getOrder.useQuery(projectId)
  return project.data?.order!
}
