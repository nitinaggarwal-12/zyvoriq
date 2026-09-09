import { Metadata } from "next";
import { EpisodeCreatorStudio } from "@/components/EpisodeCreatorStudio";

export const metadata: Metadata = {
  title: "Direct 30-Min Master Episode — Google Omni Showrunner | Zyvoriq Studios",
  description:
    "Pre-plan, structure, and direct full 10-30+ minute continuous multi-act episodes with Google Omni. Classical 5-act beat sheet, 10 chapter reels, character wardrobe timelines, and acoustic leitmotifs."
};

export default function EpisodeCreatePage() {
  return <EpisodeCreatorStudio />;
}
