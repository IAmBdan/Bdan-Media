interface MediaItem {
    s3_key: any;
    tags: any;
    id: string;
    width: number;
    height: number;
    scaledWidth?: number;
    scaledHeight?: number;
    cropped?: boolean;
}

/**
 * Calculates a tiled layout with dynamic cropping for non-standard aspect ratios.
 * @param media - Array of media items.
 * @param containerWidth - The total width of the container (e.g., screen width).
 * @returns An array of rows, where each row is an array of scaled media items.
 */
export const calculateTileLayout = (media: MediaItem[], containerWidth: number): MediaItem[][] => {
    const standardRatios = [3 / 2, 2 / 3, 4 / 5, 5 / 4];
    const rows: MediaItem[][] = [];
    let currentRow: MediaItem[] = [];
    let totalAspectRatio = 0;

    const closestStandardRatio = (aspectRatio: number): number => {
        return standardRatios.reduce((closest, current) =>
            Math.abs(current - aspectRatio) < Math.abs(closest - aspectRatio) ? current : closest
        );
    };

    media.forEach((item) => {
        const originalAspectRatio = item.width / item.height;
        let aspectRatio = originalAspectRatio;

        // Check if the image matches any standard ratio
        if (!standardRatios.includes(aspectRatio)) {
            aspectRatio = closestStandardRatio(originalAspectRatio);
            item.cropped = true; // Mark the image as cropped
        }

        totalAspectRatio += aspectRatio;
        currentRow.push({ ...item, width: item.width, height: item.height });

        // If the row's total width exceeds the container width, finalize the row
        if (totalAspectRatio >= containerWidth / 100) {
            const rowHeight = containerWidth / totalAspectRatio;

            currentRow = currentRow.map((rowItem) => ({
                ...rowItem,
                scaledWidth: rowHeight * (rowItem.width / rowItem.height),
                scaledHeight: rowHeight,
            }));

            rows.push(currentRow);
            currentRow = [];
            totalAspectRatio = 0;
        }
    });

    // Handle remaining images in the last row
    if (currentRow.length > 0) {
        const rowHeight = containerWidth / totalAspectRatio;

        currentRow = currentRow.map((rowItem) => ({
            ...rowItem,
            scaledWidth: rowHeight * (rowItem.width / rowItem.height),
            scaledHeight: rowHeight,
        }));

        rows.push(currentRow);
    }

    return rows;
};
