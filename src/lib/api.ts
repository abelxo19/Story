import type {
  AuthUser,
  LibraryPayload,
  Story,
  StoryProgress,
} from "@/types/story";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function mediaUrl(path?: string | null) {
  if (!path) {
    return "";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/uploads/")) {
    return `${API_BASE_URL}${path}`;
  }
  return path;
}

async function parseError(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) {
      return body.message.join(", ");
    }
    return body.message ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  withCredentials = false,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    credentials: withCredentials ? "include" : init.credentials,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getStories(): Promise<Story[]> {
  return request<Story[]>("/stories");
}

export function getStory(slug: string): Promise<Story> {
  return request<Story>(`/stories/${slug}`);
}

export function signup(input: {
  name: string;
  email: string;
  password: string;
}) {
  return request<{ user: AuthUser }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  }, true);
}

export function login(input: { email: string; password: string }) {
  return request<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  }, true);
}

export function logout() {
  return request<{ ok: boolean }>("/auth/logout", { method: "POST" }, true);
}

export function getMe() {
  return request<{ user: AuthUser }>("/auth/me", {}, true);
}

export function updateProfile(name: string) {
  return request<AuthUser>("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  }, true);
}

export function getLibrary() {
  return request<LibraryPayload>("/me/library", {}, true);
}

export function getStoryProgress(slug: string) {
  return request<StoryProgress>(`/me/progress/${slug}`, {}, true);
}

export function saveStoryProgress(
  slug: string,
  sceneIndex: number,
  completed: boolean,
) {
  return request<StoryProgress>(`/me/progress/${slug}`, {
    method: "PUT",
    body: JSON.stringify({ sceneIndex, completed }),
  }, true);
}

export function addBookmark(slug: string) {
  return request<{ bookmarked: boolean; favorite: boolean }>(`/me/bookmarks/${slug}`, {
    method: "POST",
  }, true);
}

export function removeBookmark(slug: string) {
  return request<{ bookmarked: boolean; favorite: boolean }>(`/me/bookmarks/${slug}`, {
    method: "DELETE",
  }, true);
}

export function addToReadingList(slug: string) {
  return request<{ onReadingList: boolean }>(`/me/reading-list/${slug}`, {
    method: "POST",
  }, true);
}

export function removeFromReadingList(slug: string) {
  return request<{ onReadingList: boolean }>(`/me/reading-list/${slug}`, {
    method: "DELETE",
  }, true);
}

export function getAdminStories() {
  return request<Story[]>("/admin/stories", {}, true);
}

export function getAdminStory(id: string) {
  return request<Story>(`/admin/stories/${id}`, {}, true);
}

export function createAdminStory(input: Partial<Story> & {
  title: string;
  slug: string;
  description: string;
}) {
  return request<Story>("/admin/stories", {
    method: "POST",
    body: JSON.stringify(input),
  }, true);
}

export function updateAdminStory(
  id: string,
  input: {
    title: string;
    slug: string;
    description: string;
    coverImage?: string;
    source?: string;
    sourceUrl?: string;
    status?: "DRAFT" | "PUBLISHED";
  },
) {
  return request<Story>(`/admin/stories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  }, true);
}

export function deleteAdminStory(id: string) {
  return request<{ ok: boolean }>(`/admin/stories/${id}`, {
    method: "DELETE",
  }, true);
}

export function addAdminScene(
  storyId: string,
  input: { title: string; text: string; imageUrl: string },
) {
  return request(`/admin/stories/${storyId}/scenes`, {
    method: "POST",
    body: JSON.stringify(input),
  }, true);
}

export function updateAdminScene(
  storyId: string,
  sceneId: string,
  input: { title: string; text: string; imageUrl: string },
) {
  return request(`/admin/stories/${storyId}/scenes/${sceneId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  }, true);
}

export function deleteAdminScene(storyId: string, sceneId: string) {
  return request(`/admin/stories/${storyId}/scenes/${sceneId}`, {
    method: "DELETE",
  }, true);
}

export function reorderAdminScenes(storyId: string, ids: string[]) {
  return request<Story>(`/admin/stories/${storyId}/scenes/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ ids }),
  }, true);
}

export async function uploadCover(file: File) {
  const body = new FormData();
  body.append("file", file);
  return request<{ url: string; filename: string }>("/admin/uploads", {
    method: "POST",
    body,
  }, true);
}
