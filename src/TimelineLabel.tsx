type TimelineLabelKind = "event" | "violation" | "note";
type TimelineLabelPriority = "low" | "medium" | "high";

type TimelineLabelProps = {
    timestamp: number; // seconds
    label: string;
    secondsToPx: (seconds: number) => number;

    // Future-facing hooks
    kind?: TimelineLabelKind;
    priority?: TimelineLabelPriority;
    offsetY?: number;
};

function getTimelineLabelColor(
    kind?: TimelineLabelKind,
    priority: TimelineLabelPriority = "low"
): string {
    void kind;
    void priority;

    return "#2f2f2f";
}

export function TimelineLabel({
    timestamp,
    label,
    secondsToPx,
    kind,
    priority = "low",
    offsetY = 0,
}: TimelineLabelProps) {
    const STEM_HEIGHT = 16;
    const DIAGONAL_LENGTH = 12;
    const STROKE_WIDTH = 1;
    const FONT_SIZE = 11;
    const DIAGONAL_ANGLE_DEGREES = 45;

    const color = getTimelineLabelColor(kind, priority);

    const x0 = secondsToPx(timestamp);
    const y0 = offsetY;

    const diagonalOffset = DIAGONAL_LENGTH / Math.sqrt(2);

    const x1 = x0;
    const y1 = y0 + STEM_HEIGHT;

    const x2 = x1 + diagonalOffset;
    const y2 = y1 + diagonalOffset;

    const TEXT_OFFSET_ALONG_LINE = 3;
    const textOffset = TEXT_OFFSET_ALONG_LINE / Math.sqrt(2);

    const textX = x2 + textOffset;
    const textY = y2 + textOffset;

    return (
        <g className="timeline-label">
            <line
                x1={x0}
                y1={y0}
                x2={x1}
                y2={y1}
                stroke={color}
                strokeWidth={STROKE_WIDTH}
            />
            <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={STROKE_WIDTH}
            />
            <text
                x={textX}
                y={textY}
                fill={color}
                fontSize={FONT_SIZE}
                textAnchor="start"
                dominantBaseline="middle"
                transform={`rotate(${DIAGONAL_ANGLE_DEGREES} ${x2} ${y2})`}
            >
                {label}
            </text>
        </g>
    );
}
