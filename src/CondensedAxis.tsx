import DayMarker from "./DayMarker";
import type { Segment } from "./timelineTypes";
import { getCondensedSegmentPositions } from "./condensedSegmentLayout";
import { CONDENSED_AXIS_HEIGHT } from "./condensedSegmentLayout";


type CondensedAxisProps = {
    segments: Segment[];
    compressedWidths: Record<string, number>;
    daySeconds: number;
    trackPaddingPx: number;
    formatDayLabel: (dayOffset: number) => string;
};

function isDayBoundary(second: number, daySeconds: number): boolean {
    return ((second % daySeconds) + daySeconds) % daySeconds === 0;
}

function getDayParts(dayOffset: number) {
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    const d = new Date(base);
    d.setDate(base.getDate() + dayOffset);

    return {
        monthShort: d.toLocaleString("en-US", { month: "short" }),
        monthNumber: d.getMonth() + 1,
        day: d.getDate(),
    };
}

function formatMarkerLines(firstDay: number, lastDay: number): string[] {
    const first = getDayParts(firstDay);
    const last = getDayParts(lastDay);

    if (firstDay === lastDay) {
        return [first.monthShort, String(first.day)];
    }

    if (first.monthNumber === last.monthNumber) {
        return [first.monthShort, `${first.day}-${last.day}`];
    }

    return [`${first.monthNumber}/${first.day}-`, `${last.monthNumber}/${last.day}`];
}

export default function CondensedAxis({
    segments,
    compressedWidths,
    daySeconds,
    trackPaddingPx,
}: CondensedAxisProps) {
    const positionedSegments = getCondensedSegmentPositions(
        segments,
        compressedWidths,
        trackPaddingPx
    );

    const markers = positionedSegments.flatMap((item) => {
        const segment = item.segment;

        const startDay = Math.floor(segment.startSecond / daySeconds);
        const endDay = Math.floor((segment.endSecond - 1) / daySeconds);

        const startsAtMidnight = isDayBoundary(segment.startSecond, daySeconds);

        const firstMarkerDay = startsAtMidnight ? startDay : startDay + 1;
        const lastMarkerDay = endDay;

        if (firstMarkerDay > lastMarkerDay) return [];

        const lines = formatMarkerLines(firstMarkerDay, lastMarkerDay);

        return [
            {
                key: `${segment.id}-${firstMarkerDay}-${lastMarkerDay}`,
                lines,
                leftPx: item.leftPx + item.widthPx / 2,
            },
        ];
    });

    return (
        <div
            style={{
                height: CONDENSED_AXIS_HEIGHT,
                position: "relative",
                flex: "0 0 auto",
            }}
        >
            {markers.map((marker) => (
                <DayMarker
                    key={marker.key}
                    lines={marker.lines}
                    leftPx={marker.leftPx}
                />
            ))}
        </div>
    );
}
