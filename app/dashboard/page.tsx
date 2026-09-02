import { DashboardContent } from "@/components/dashboard-content"
import { getSession } from "@/lib/auth/server"

export default async function DashboardPage() {
  const session =  await getSession()
  const userId = session?.data?.user?.id ?? ""
  return <DashboardContent userId={userId}/>
}