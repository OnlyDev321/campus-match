import { redirect } from "next/navigation";

// Redirect localhost:3000 (/) to /groups to keep the routing consistent.
export default function Home() {
  return redirect("/groups");
}
