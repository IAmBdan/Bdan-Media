import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

interface Section {
  id: string;
  name: string;
  path: string;
  parent_id?: string | null;
}

interface MediaItem {
  id: string;
  s3_key: string;
  width: number;
  height: number;
  tags: string[] | null;
  type: "image" | "video";
  uploaded_at?: string;
}

const SectionLandingPage: React.FC = () => {
  const { sectionPath } = useParams(); // e.g. "music"
  const [parentSection, setParentSection] = useState<Section | null>(null);
  const [childSections, setChildSections] = useState<Section[]>([]);
  const [subsectionImages, setSubsectionImages] = useState<Record<string, MediaItem | null>>({});

  // Loading / error states
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [error, setError] = useState("");

  /**
   * Fetch the parent section + all sections, then filter children.
   */
  const fetchSections = async () => {
    if (!sectionPath) return;
    setLoadingSections(true);
    setError("");

    try {
      // 1) fetch parent by path
      const parentRes = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/sections/path`,
        { params: { path: sectionPath } }
      );
      const pSection: Section = parentRes.data;
      setParentSection(pSection);

      // 2) fetch all, filter for children
      const allSectionsRes = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/sections`
      );
      const allSections: Section[] = allSectionsRes.data || [];
      const children = allSections.filter((s) => s.parent_id === pSection.id);

      setChildSections(children);
    } catch (err: any) {
      console.error("Error fetching sections:", err);
      setError("Could not load sections.");
    } finally {
      setLoadingSections(false);
    }
  };

  /**
   *  For each child, pick exactly one image that matches orientation.
   *  If none found or path ends with /videos or /recaps, fallback => /photos
   *  Also ensure no duplicates among children (unique s3_key).
   */
  const fetchImagesForSubsections = async (children: Section[]) => {
    setLoadingMedia(true);

    // figure out orientation logic
    const layoutCount = children.length;
    const wantHorizontal = layoutCount === 2 || layoutCount === 4;
    const wantVertical = layoutCount === 3;

    // track used images to prevent duplicates
    const usedKeys = new Set<string>();

    const newImages: Record<string, MediaItem | null> = {};

    for (const child of children) {
      try {
        let picked = await pickOneValidImage(child.path, wantHorizontal, wantVertical, usedKeys);

        // If we found none or the path ends with /videos or /recaps => fallback
        if (!picked || endsWithVideosOrRecaps(child.path)) {
          const fallbackPath = buildFallbackPath(child.path);
          console.log(`Falling back from ${child.path} to ${fallbackPath}`);
          picked = await pickOneValidImage(fallbackPath, wantHorizontal, wantVertical, usedKeys);
        }

        newImages[child.id] = picked || null;

        // If we found an image, mark its s3_key as used
        if (picked) {
          usedKeys.add(picked.s3_key);
        }
      } catch (err) {
        console.error("Error fetching media for", child.path, err);
        newImages[child.id] = null;
      }
    }

    setSubsectionImages(newImages);
    setLoadingMedia(false);
  };

  /**
   * Helper: pick one valid image that hasn't been used yet.
   */
  const pickOneValidImage = async (
    path: string,
    wantHorizontal: boolean,
    wantVertical: boolean,
    usedKeys: Set<string>
  ): Promise<MediaItem | null> => {
    try {
      const mediaRes = await axios.get(
        `${process.env.AWS_S3_BUCKET_NAME}/api/media/section`,
        { params: { sectionPath: path } }
      );
      let allMedia: MediaItem[] = mediaRes.data || [];

      // only images
      allMedia = allMedia.filter((m) => m.type === "image");

      // orientation
      if (wantHorizontal) {
        allMedia = allMedia.filter((m) => m.width >= m.height);
      } else if (wantVertical) {
        allMedia = allMedia.filter((m) => m.height > m.width);
      }

      // remove duplicates by excluding used s3_keys
      allMedia = allMedia.filter((m) => !usedKeys.has(m.s3_key));

      if (allMedia.length === 0) return null;

      // pick random from the remaining
      return allMedia[Math.floor(Math.random() * allMedia.length)];
    } catch (err) {
      console.error(`Error fetching media for path: ${path}`, err);
      return null;
    }
  };

  /**
   * If path ends with /videos or /recaps -> return /photos
   */
  const buildFallbackPath = (originalPath: string): string => {
    let fallback = originalPath;
    const lower = originalPath.toLowerCase();

    if (lower.endsWith("/videos")) {
      fallback = originalPath.replace(/\/videos$/i, "/photos");
    } else if (lower.endsWith("/recaps")) {
      fallback = originalPath.replace(/\/recaps$/i, "/photos");
    }
    return fallback;
  };

  const endsWithVideosOrRecaps = (path: string): boolean => {
    const lower = path.toLowerCase();
    return lower.endsWith("/videos") || lower.endsWith("/recaps");
  };

  // On mount or path change => fetch parent + children
  useEffect(() => {
    fetchSections();
  }, [sectionPath]);

  // once childSections is known => fetch images
  useEffect(() => {
    if (childSections.length > 0) {
      fetchImagesForSubsections(childSections);
    }
  }, [childSections]);

  // layout check
  const layoutCount = childSections.length;
  if (layoutCount < 2 || layoutCount > 4) {
    return (
      <div className="bg-rich_black-500 text-white-500 min-h-screen flex flex-col items-center justify-center">
        <p style={{ fontFamily: "Azonix, sans-serif", fontSize: "2rem" }}>
          Need exactly 2, 3, or 4 child subsections. Found: {layoutCount}
        </p>
      </div>
    );
  }

  // container classes
  let containerClasses = "";
  let aspectClass = "";
  let gapClass = "gap-2";
  if (layoutCount === 2) {
    containerClasses = "grid grid-cols-1 md:grid-cols-2"; // 1 col on mobile, 2 on md+
    aspectClass = "aspect-video"; // wide
  } else if (layoutCount === 3) {
    containerClasses = "grid grid-cols-1 md:grid-cols-3"; // 1 col on mobile, 3 on md+
    aspectClass = "aspect-[2/3]"; // tall
    gapClass = "gap-1"; // tighter for vertical
  } else if (layoutCount === 4) {
    containerClasses = "grid grid-cols-1 md:grid-cols-2"; // effectively 2x2 on md+
    aspectClass = "aspect-video"; // wide
  }

  // handle loading / error
  if (loadingSections || loadingMedia) {
    return (
      <div className="bg-rich_black-500 text-white-500 min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: "Azonix, sans-serif", fontSize: "2rem" }}>
          Loading...
        </p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-rich_black-500 text-white-500 min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: "Azonix, sans-serif", fontSize: "2rem" }}>
          {error}
        </p>
      </div>
    );
  }
  if (!parentSection) {
    return (
      <div className="bg-rich_black-500 text-white-500 min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: "Azonix, sans-serif", fontSize: "2rem" }}>
          No parent section found for path: {sectionPath}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-rich_black-500 text-white-500 min-h-screen flex flex-col items-center px-4"
      style={{ paddingTop: "1.5rem", fontFamily: "Azonix, sans-serif" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      {/* Main Section Title */}
      <motion.h1
        style={{ fontSize: "3rem", textAlign: "center", marginBottom: "1.5rem" }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {parentSection.name.toUpperCase()}
      </motion.h1>

      {/* Child subsections grid */}
      <div className={`${containerClasses} ${gapClass} w-full max-w-6xl mx-auto`}>
        {childSections.map((child, idx) => {
          const image = subsectionImages[child.id];

          return (
            <motion.div
              key={child.id}
              className={`group relative overflow-hidden rounded-md ${aspectClass}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              // scale on hover for container
              whileHover={{ scale: 1.02 }}
            >
              <Link to={`/work/${child.path}`} className="block w-full h-full">
                {image ? (
                  // The image, scale a bit more on hover
                  <motion.img
                    src={`https://${process.env.REACT_APP_S3_BUCKET}/${image.s3_key}`}
                    alt={child.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.1, ease: "easeInOut" }}
                  />
                ) : (
                  // Fallback if no image
                  <div className="flex items-center justify-center w-full h-full bg-slate-700">
                    <p style={{ fontFamily: "Azonix, sans-serif", fontSize: "1rem" }}>
                      NO IMAGE FOUND
                    </p>
                  </div>
                )}

                {/* Dark overlay => 0.7 -> 0.3 */}
                <motion.div
                  className="absolute inset-0 bg-black z-10 pointer-events-none"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ duration: 3.5, ease: "easeInOut" }}
                />

                {/* Subsection Name */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-20"
                  style={{ fontFamily: "Azonix, sans-serif", fontSize: "2.55rem" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 + idx * 0.1 }}
                >
                  {child.name.toUpperCase()}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SectionLandingPage;