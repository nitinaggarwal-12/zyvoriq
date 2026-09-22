import { redirect } from "next/navigation";
export default function CharactersRedirect() {
  redirect("/assets?tab=people");
}
