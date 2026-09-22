import { redirect } from "next/navigation";
export default function LocationsRedirect() {
  redirect("/assets?tab=locations");
}
