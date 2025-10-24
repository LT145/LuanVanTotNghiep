import { redirect } from "next/navigation"

export default async function Home() {
  await new Promise(resolve => setTimeout(resolve, 3000))
  redirect("/male")
}
