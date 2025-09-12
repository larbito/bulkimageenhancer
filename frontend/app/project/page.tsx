"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

// Import the actual page components
import StyleChooserPage from "../projects/[id]/styles/page";
import IdeasPage from "../projects/[id]/ideas/page";
import RenderPage from "../projects/[id]/render/page";
import ReviewPage from "../projects/[id]/review/page";
import ProjectPage from "../projects/[id]/page";

function ProjectRouterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const projectId = searchParams.get('id');
  const page = searchParams.get('page') || 'overview';

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !projectId) {
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
  switch (page) {
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

export default function ProjectRouter() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <ProjectRouterContent />
    </Suspense>
  );
}
