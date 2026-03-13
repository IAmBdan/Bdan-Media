import React, { useRef, useState, useEffect, useCallback } from "react";
import LazyMedia from "./LazyMedia";

interface MediaItem {
  id: string;
  s3_key: string;
  width: number;
  height: number;
  tags: string[];
  type: "image" | "video";
}

interface TiledLayoutProps {
  media: MediaItem[];
  containerWidth: number; // kept for API compat but we measure internally
  selectedMedia: Set<string>;
  setSelectedMedia: React.Dispatch<React.SetStateAction<Set<string>>>;
  isEditMode: boolean;
  targetRowHeight?: number;
}

const GAP = 2;

const TiledLayout: React.FC<TiledLayoutProps> = ({
  media,
  selectedMedia,
  setSelectedMedia,
  isEditMode,
  targetRowHeight = 300,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Measure actual rendered width
  const measure = useCallback(() => {
    if (wrapperRef.current) {
      setWidth(wrapperRef.current.getBoundingClientRect().width);
    }
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const layout = (() => {
    if (width === 0) return [];
    const rows: { items: MediaItem[]; rowHeight: number }[] = [];
    let currentRow: MediaItem[] = [];
    let currentRowAspectSum = 0;

    media.forEach((item) => {
      const aspectRatio = item.width / item.height;
      const projectedWidth = (currentRowAspectSum + aspectRatio) * targetRowHeight
        + currentRow.length * GAP; // gaps so far

      if (projectedWidth > width && currentRow.length > 0) {
        // Solve: rowHeight * aspectSum + (n-1)*GAP = width
        const n = currentRow.length;
        const rowHeight = (width - (n - 1) * GAP) / currentRowAspectSum;
        rows.push({ items: currentRow, rowHeight });
        currentRow = [];
        currentRowAspectSum = 0;
      }

      currentRow.push(item);
      currentRowAspectSum += aspectRatio;
    });

    if (currentRow.length > 0) {
      const n = currentRow.length;
      const rowHeight = (width - (n - 1) * GAP) / currentRowAspectSum;
      rows.push({ items: currentRow, rowHeight });
    }

    return rows;
  })();

  const toggleSelection = (id: string) => {
    setSelectedMedia((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      return updated;
    });
  };

  return (
    <div ref={wrapperRef} style={{ width: "100%", boxSizing: "border-box" }}>
      {width > 0 && layout.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: "flex",
            flexDirection: "row",
            gap: `${GAP}px`,
            marginBottom: `${GAP}px`,
            height: `${row.rowHeight}px`,
            // Ensure row never exceeds wrapper
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          {row.items.map((item) => {
            const aspectRatio = item.width / item.height;
            const itemWidth = row.rowHeight * aspectRatio;
            const isSelected = selectedMedia.has(item.id);

            return (
              <div
                key={item.id}
                style={{
                  width: `${itemWidth}px`,
                  height: `${row.rowHeight}px`,
                  flexShrink: 0,
                  border: isEditMode
                    ? isSelected ? "2px solid red" : "2px solid transparent"
                    : "none",
                  cursor: isEditMode ? "pointer" : "default",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
                onClick={() => isEditMode && toggleSelection(item.id)}
              >
                <LazyMedia
                  src={`https://${process.env.REACT_APP_S3_BUCKET}/${item.s3_key}`}
                  alt={item.tags?.join(", ") || "media"}
                  type={item.type}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default TiledLayout;