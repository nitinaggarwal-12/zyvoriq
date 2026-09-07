import React from "react";
import { MyReelsLibrary } from "@/components/MyReelsLibrary";

export const metadata = {
  title: "My Reels & Saved Clips | Zyvoriq",
  description: "Hierarchical archive of your generated 24fps master cinema reels and constituent clips.",
};

export default function MyReelsPage() {
  return <MyReelsLibrary />;
}
