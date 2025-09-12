"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Import the actual page components
import StyleChooserPage from "../[id]/styles/page";
import IdeasPage from "../[id]/ideas/page";
import RenderPage from "../[id]/render/page";
import ReviewPage from "../[id]/review/page";
import ProjectPage from "../[id]/page";

export default function ProjectRouter() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string[];

  const [currentPage, setCurrentPage] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");

  useEffect(() => {
    if (slug && slug.length >= 1) {
      const id = slug[0];
      const page = slug[1] || "overview";
      
      setProjectId(id);
      setCurrentPage(page);
    }
  }, [slug]);

  if (!projectId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate page component
  switch (currentPage) {
    case "styles":
      return <StyleChooserPage />;
    case "ideas":
      return <IdeasPage />;
    case "render":
      return <RenderPage />;
    case "review":
      return <ReviewPage />;
    case "overview":
    default:
      return <ProjectPage />;
  }
}
