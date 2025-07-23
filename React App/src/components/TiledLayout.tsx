import React from "react";
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
  containerWidth: number;
  selectedMedia: Set<string>;
  setSelectedMedia: React.Dispatch<React.SetStateAction<Set<string>>>;
  isEditMode: boolean;
  targetRowHeight?: number;
}

const TiledLayout: React.FC<TiledLayoutProps> = ({
  media,
  containerWidth,
  selectedMedia,
  setSelectedMedia,
  isEditMode,
  targetRowHeight = 300,
}) => {
  const layout = (() => {
    const rows: { items: MediaItem[]; rowHeight: number }[] = [];
    let currentRow: MediaItem[] = [];
    let currentRowWidth = 0;

    media.forEach((item) => {
      const aspectRatio = item.width / item.height;
      const itemWidth = targetRowHeight * aspectRatio;

      if (currentRowWidth + itemWidth > containerWidth) {
        const rowScale = containerWidth / currentRowWidth;
        const rowHeight = targetRowHeight * rowScale;
        rows.push({ items: currentRow, rowHeight });
        currentRow = [];
        currentRowWidth = 0;
      }

      currentRow.push(item);
      currentRowWidth += itemWidth;
    });

    if (currentRow.length > 0) {
      const rowScale = containerWidth / currentRowWidth;
      const rowHeight = targetRowHeight * rowScale;
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
    <div style={{ width: "100%", boxSizing: "border-box", margin: 0, padding: 0 }}>
      {layout.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            marginBottom: "2px",
          }}
        >
          {row.items.map((item) => {
            const aspectRatio = item.width / item.height;
            const itemWidth = row.rowHeight * aspectRatio;
            const itemHeight = row.rowHeight;

            const isSelected = selectedMedia.has(item.id);

            return (
              <div
                key={item.id}
                style={{
                  width: `${itemWidth}px`,
                  height: `${itemHeight}px`,
                  margin: "1px",
                  border: isEditMode
                    ? isSelected
                      ? "2px solid red"
                      : "2px solid transparent"
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
                  type={item.type} // Pass the type from your MediaItem
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
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
