import type { Segment } from "./timelineTypes";

export const CONDENSED_SEGMENT_GAP_PX = 4;
export const CONDENSED_AXIS_HEIGHT = 42;

export function isRestSegment(segment: Segment): boolean {
    return segment.kind === "offDuty" || segment.kind === "sleeper";
}

export function getCondensedRenderWidth(
    segment: Segment,
    compressedWidths: Record<string, number>
): number {
    const width = compressedWidths[segment.id] ?? 0;

    if (isRestSegment(segment)) {
        return Math.max(width, 4);
    }

    return width;
}

export function getCondensedSegmentPositions(
    segments: Segment[],
    compressedWidths: Record<string, number>,
    trackPaddingPx: number
) {
    let leftPx = trackPaddingPx;

    return segments.map((segment) => {
        const widthPx = getCondensedRenderWidth(segment, compressedWidths);

        const positioned = {
            segment,
            leftPx,
            rightPx: leftPx + widthPx,
            widthPx,
        };

        leftPx += widthPx + CONDENSED_SEGMENT_GAP_PX;

        return positioned;
    });
}
