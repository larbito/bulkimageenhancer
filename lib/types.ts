export type ProjectStatus = "draft" | "active" | "done";

export interface Project {
  id: string;
  userId: string;
  title: string;
  pagesRequested: number;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  styleProfile?: StyleProfile | null;
  ideas?: PageIdea[];
}

export interface StyleCandidate {
  id: string;
  projectId: string;
  promptText: string;
  params: Record<string, unknown>;
  seed?: string | null;
  thumbnailUrl: string;
  selected: boolean;
}

export interface StyleProfile {
  id: string;
  projectId: string;
  stylePrompt: string;
  params: Record<string, unknown>;
  seed?: string | null;
  characterRef?: string[] | null;
}

export type PageIdeaStatus = "draft" | "approved";

export interface PageIdea {
  id: string;
  projectId: string;
  index: number;
  ideaText: string;
  status: PageIdeaStatus;
  images?: PageImage[];
}

export type PageStage = "base" | "upscaled";

export interface PageImage {
  id: string;
  pageIdeaId: string;
  stage: PageStage;
  url: string;
  width: number;
  height: number;
  meta: Record<string, unknown>;
}

export type JobStatus = "queued" | "running" | "error" | "done";

export interface Job {
  id: string;
  type: "style_sampler" | "idea_gen" | "page_gen" | "upscale" | "zip";
  projectId: string;
  payload: Record<string, unknown>;
  status: JobStatus;
  errorText?: string | null;
  createdAt: string;
  updatedAt: string;
}


