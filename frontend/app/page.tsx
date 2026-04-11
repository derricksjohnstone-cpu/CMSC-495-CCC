import { redirect } from "next/navigation";

export default function Home() {
  // TODO: Check auth token and redirect based on role
  // if (user.role === "manager") redirect("/manager");
  // if (user.role === "employee") redirect("/employee");

  redirect("/login");
}