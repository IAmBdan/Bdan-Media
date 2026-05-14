import axios from 'axios';

export interface Section {
  id: string;
  name: string;
  path: string;
  parent_id?: string | null;
  hidden?: boolean;
}

export interface MediaItem {
  id: string;
  s3_key: string;
  width: number;
  height: number;
  tags: string[] | null;
  type: 'image' | 'video';
  uploaded_at?: string;
}

// Replace the last path segment with 'photos'.
// Returns null if already ends with 'photos' to avoid infinite loops.
export const buildFallbackPath = (p: string): string | null => {
  const parts = p.split('/');
  if (parts[parts.length - 1].toLowerCase() === 'photos') return null;
  parts[parts.length - 1] = 'photos';
  return parts.join('/');
};

// Sections that never have usable images — always force fallback to /photos
export const endsWithMedia = (p: string): boolean =>
  /\/(videos|recaps|multicams)$/i.test(p);

// Fetch images for a path and return one that matches orientation + hasn't been used
export const pickImage = async (
  path: string,
  wantH: boolean,
  wantV: boolean,
  used: Set<string>
): Promise<MediaItem | null> => {
  try {
    const { data } = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/api/media/section`,
      { params: { sectionPath: path } }
    );
    let media: MediaItem[] = (data || []).filter((m: MediaItem) => m.type === 'image');
    if (wantH) media = media.filter((m) => m.width >= m.height);
    if (wantV) media = media.filter((m) => m.height > m.width);
    media = media.filter((m) => !used.has(m.s3_key));
    return media.length ? media[Math.floor(Math.random() * media.length)] : null;
  } catch {
    return null;
  }
};

// For a list of child sections, pick one representative image each.
// Falls back to sibling /photos path if none found or section is media-only.
export const prefetchSectionImages = async (
  children: Section[]
): Promise<Record<string, MediaItem | null>> => {
  const n = children.length;
  const wantH = n === 2 || n === 4;
  const wantV = n === 3;
  const used = new Set<string>();
  const out: Record<string, MediaItem | null> = {};

  for (const child of children) {
    let img = await pickImage(child.path, wantH, wantV, used);
    if (!img || endsWithMedia(child.path)) {
      const fallback = buildFallbackPath(child.path);
      if (fallback) img = await pickImage(fallback, wantH, wantV, used);
    }
    out[child.id] = img ?? null;
    if (img) used.add(img.s3_key);
  }

  return out;
};