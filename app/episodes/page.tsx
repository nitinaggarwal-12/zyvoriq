import { Metadata } from "next";
import { EpisodeCreatorStudio } from "@/components/EpisodeCreatorStudio";

export const metadata: Metadata = {
  title: "Omni Showrunner Episodes — Zyvoriq Studios",
  description: "Direct long-form 10–30+ minute continuous multi-act episodes with Google Omni."
};

export default function EpisodesIndexPage() {
  return <EpisodeCreatorStudio />;
}
