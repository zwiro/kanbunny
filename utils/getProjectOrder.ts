import { trpc } from "./trpc"

export default function getProjectOrder(projectId: string) {
  const order = trpc.project.getOrder.useQuery(projectId)
  return order.data?.order || 0
}
