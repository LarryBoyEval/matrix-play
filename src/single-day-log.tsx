import { useMemo, useEffect, useRef, useState } from "react";
import ViolationCap from "./ViolationCap";
import { TimelineLabel } from "./TimelineLabel";

type SegmentKind = "driving" | "onDuty" | "sleeper" | "offDuty";
type DisplayMode = "compressed" | "proportional";
type RowMode = "2-row" | "4-row";
type ParentRow = "rest" | "work";
type SubRowKey = "rest" | "work" | "offDuty" | "sleeper" | "driving" | "onDuty";

type DutyEvent = {
    id: string;
    kind: SegmentKind;
    time: string; // e.g. "00:30:00", "1d00:15:00"
};

type InfluenceKind = "personalConveyance" | "yardMove";

type InfluenceInterval = {
    kind: InfluenceKind;
    startSecond: number;
    endSecond: number;
    riskLevel?: "low" | "medium" | "high";
};

type SegmentInfluenceSummary = {
    kind: InfluenceKind;
    seconds: number;
    riskLevel?: "low" | "medium" | "high";
};

type SegmentInfluenceSlice = {
    kind: InfluenceKind;
    riskLevel?: "low" | "medium" | "high";
    startSecond: number;
    endSecond: number;
    overlapStartSecond: number;
    overlapEndSecond: number;
    overlapSeconds: number;
};

type Segment = {
    id: string;
    kind: SegmentKind;
    startSecond: number;
    endSecond: number;
    influenceSummaries?: SegmentInfluenceSummary[];
};

type RowConfig = {
    parent: ParentRow;
    subRows: Array<{ key: SubRowKey; label?: string }>;
};

type GridHighlightInput = {
    start: string; // e.g. "09:30:00", "1d02:00:00"
    end: string;
    color: string;
    opacity: number;
};

type GridHighlight = {
    startSecond: number;
    endSecond: number;
    color: string;
    opacity: number;
};

type TimelineLabelFixture = {
    time: string;
    label: string;
};

type TimelineScale = {
    startSecond: number;
    endSecond: number;
    durationSeconds: number;
    pixelsPerHour: number;
    canvasWidthPx: number;
};

type ViolationCapFixture = {
    type: "break" | "driving" | "shift" | "onduty" | "cycle";
    shape: "octagon";
    displayMode: "number";
    urgency: "triggered" | "imminent" | "near" | "watch" | "distant";
    time: string;
    top: number;
};

function buildTimelineScale(
    startSecond: number,
    endSecond: number,
    pixelsPerHour: number
): TimelineScale {
    const durationSeconds = Math.max(1, endSecond - startSecond);
    const canvasWidthPx = (durationSeconds / 3600) * pixelsPerHour;

    return {
        startSecond,
        endSecond,
        durationSeconds,
        pixelsPerHour,
        canvasWidthPx,
    };
}

function clampToScale(second: number, scale: TimelineScale): number {
    return Math.max(scale.startSecond, Math.min(scale.endSecond, second));
}

function getTrackWidthPx(scale: TimelineScale): number {
    return scale.canvasWidthPx - TRACK_X_PADDING * 2;
}

function timeToPx(second: number, scale: TimelineScale): number {
    const trackWidthPx = getTrackWidthPx(scale);
    const clamped = clampToScale(second, scale);

    return (
        ((clamped - scale.startSecond) / scale.durationSeconds) *
        trackWidthPx
    );
}

const TRACK_X_PADDING = 8;
const ROW_LABEL_COLUMN_WIDTH = 120;
const DAY_SECONDS = 86400;
const DAYS_BEFORE_FOCUS = 7;
const DAYS_AFTER_FOCUS = 1;

const fixtureEvents: DutyEvent[] = [
    { id: "a", kind: "offDuty", time: "-1d20:00:00" },
    { id: "b", kind: "sleeper", time: "-1d22:00:00" },
    { id: "c", kind: "offDuty", time: "00:00:00" },
    { id: "d", kind: "onDuty", time: "02:45:00" },
    { id: "e", kind: "driving", time: "09:45:22" },
    { id: "f", kind: "onDuty", time: "19:45:00" },
    { id: "g", kind: "sleeper", time: "23:45:00" },
    { id: "h", kind: "offDuty", time: "1d08:00:00" },
];

const fixtureInfluences: InfluenceInterval[] = [
    {
        kind: "personalConveyance",
        startSecond: parseFixtureTime("00:14:00"),
        endSecond: parseFixtureTime("00:18:00"),
        riskLevel: "low",
    },
    {
        kind: "personalConveyance",
        startSecond: parseFixtureTime("01:10:00"),
        endSecond: parseFixtureTime("02:10:00"),
        riskLevel: "high",
    },
    {
        kind: "yardMove",
        startSecond: parseFixtureTime("02:50:00"),
        endSecond: parseFixtureTime("03:02:00"),
        riskLevel: "low",
    },
];

const fixtureGridHighlightInputs: GridHighlightInput[] = [
    {
        start: "01:30:00",
        end: "05:00:00",
        color: "#f59e0b", //0ea5e9
        opacity: 0.08,
    },
    {
        start: "03:00:00",
        end: "06:15:00",
        color: "#f59e0b", //f59e0b
        opacity: 0.08,
    },
    {
        start: "18:00:00",
        end: "22:30:00",
        color: "#ef4444", //ef4444
        opacity: 0.08,
    },
];


const fixtureViolationCaps: ViolationCapFixture[] = [
    {
        type: "break",
        shape: "octagon",
        displayMode: "number",
        urgency: "triggered",
        time: "18:30:00",
        top: 2,
    },
    {
        type: "driving",
        shape: "octagon",
        displayMode: "number",
        urgency: "imminent",
        time: "21:00:00",
        top: 2,
    },
    {
        type: "shift",
        shape: "octagon",
        displayMode: "number",
        urgency: "near",
        time: "21:30:00",
        top: 2,
    },
    {
        type: "onduty",
        shape: "octagon",
        displayMode: "number",
        urgency: "watch",
        time: "22:00:00",
        top: 2,
    },
    {
        type: "cycle",
        shape: "octagon",
        displayMode: "number",
        urgency: "distant",
        time: "22:30:00",
        top: 2,
    },
];

const fixtureTimelineLabels: TimelineLabelFixture[] = [
    { time: "09:00:00", label: "Greeley,CO·2mi" },
    { time: "10:05:00", label: "Denver,CO 2mi" },
    { time: "13:00:00", label: "Limon,CO · 4mi SSW" },
    { time: "18:30:00", label: "San Franscisco CA 13m" },
    { time: "19:30:00", label: "San Franscisco,CA 13mi" },
];

const ROW_CONFIG: Record<ParentRow, RowConfig> = {
    rest: {
        parent: "rest",
        subRows: [
            { key: "offDuty", label: "Off Duty" },
            { key: "sleeper", label: "Sleeper" },
        ],
    },
    work: {
        parent: "work",
        subRows: [
            { key: "driving", label: "Driving" },
            { key: "onDuty", label: "On Duty" },
        ],
    },
};

const kindMeta: Record<
    SegmentKind,
    {
        row: ParentRow;
        label: string;
        workColor?: string;
        restColor?: string;
        chipBg: string;
        chipBorder: string;
        chipText: string;
    }
> = {
    driving: {
        row: "work",
        label: "Driving",
        workColor: "#f97316",
        chipBg: "#ffedd5",
        chipBorder: "#fdba74",
        chipText: "#9a3412",
    },
    onDuty: {
        row: "work",
        label: "On Duty",
        workColor: "#f59e0b",
        chipBg: "#fef3c7",
        chipBorder: "#fcd34d",
        chipText: "#92400e",
    },
    sleeper: {
        row: "rest",
        label: "Sleeper",
        restColor: "#0ea5e9",
        chipBg: "#e0f2fe",
        chipBorder: "#7dd3fc",
        chipText: "#075985",
    },
    offDuty: {
        row: "rest",
        label: "Off Duty",
        restColor: "#64748b",
        chipBg: "#f1f5f9",
        chipBorder: "#cbd5e1",
        chipText: "#334155",
    },
};

function getTierPadding(minutes: number): number {
    if (minutes < 30) return 0;
    if (minutes < 120) return 0;
    if (minutes < 420) return 8;
    if (minutes < 600) return 18;
    if (minutes < 2040) return 28;
    return 40;
}

function parseFixtureTime(value: string): number {
    const trimmed = value.trim();
    const match = trimmed.match(/^([+-]?\d+)d(\d{1,2}):(\d{2}):(\d{2})$|^(\d{1,2}):(\d{2}):(\d{2})$/);

    if (!match) {
        throw new Error(`Invalid fixture time: ${value}`);
    }

    if (match[1] != null) {
        const days = Number(match[1]);
        const hours = Number(match[2]);
        const minutes = Number(match[3]);
        const seconds = Number(match[4]);

        if (hours > 23) {
            throw new Error(`Hour must be 00-23 in fixture time: ${value}`);
        }
        if (minutes > 59 || seconds > 59) {
            throw new Error(`Minute/second out of range in fixture time: ${value}`);
        }

        return days * 86400 + hours * 3600 + minutes * 60 + seconds;
    }

    const hours = Number(match[5]);
    const minutes = Number(match[6]);
    const seconds = Number(match[7]);

    if (hours > 23) {
        throw new Error(`Hour must be 00-23 in fixture time: ${value}`);
    }
    if (minutes > 59 || seconds > 59) {
        throw new Error(`Minute/second out of range in fixture time: ${value}`);
    }

    return hours * 3600 + minutes * 60 + seconds;
}

function buildSegments(
    events: DutyEvent[],
    influences: InfluenceInterval[]
): Segment[] {
    const segments: Segment[] = [];

    for (let i = 0; i < events.length - 1; i++) {
        const current = events[i];
        const next = events[i + 1];

        const segment: Segment = {
            id: current.id,
            kind: current.kind,
            startSecond: parseFixtureTime(current.time),
            endSecond: parseFixtureTime(next.time),
        };

        segment.influenceSummaries = getSegmentInfluenceSummaries(segment, influences);
        segments.push(segment);
    }

    return segments;
}

function buildGridHighlights(inputs: GridHighlightInput[]): GridHighlight[] {
    return inputs.map((highlight) => ({
        startSecond: parseFixtureTime(highlight.start),
        endSecond: parseFixtureTime(highlight.end),
        color: highlight.color,
        opacity: highlight.opacity,
    }));
}

// function clampDayPercent(second: number): number {
//     return Math.max(0, Math.min(100, (second / 86400) * 100));
// }

function GridHighlightsOverlay({
    highlights,
    scale,
}: {
    highlights: GridHighlight[];
    scale: TimelineScale;
}) {
    return (
        <div
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 0,
            }}
        >
            {highlights.map((highlight, index) => {
                const leftPx = timeToPx(highlight.startSecond, scale);
                const rightPx = timeToPx(highlight.endSecond, scale);
                const widthPx = Math.max(0, rightPx - leftPx);

                return (
                    <div
                        key={`${highlight.startSecond}-${highlight.endSecond}-${highlight.color}-${index}`}
                        style={{
                            position: "absolute",
                            left: leftPx,
                            width: widthPx,
                            top: 0,
                            bottom: 0,
                            background: highlight.color,
                            opacity: highlight.opacity,
                        }}
                    />
                );
            })}
        </div>
    );
}

function getDurationSeconds(segment: Segment): number {
    return segment.endSecond - segment.startSecond;
}

function getDurationMinutes(segment: Segment): number {
    return Math.round(getDurationSeconds(segment) / 60);
}

function getInfluenceThickness(seconds: number): number {
    const minutes = Math.round(seconds / 60);

    if (minutes <= 0) return 0;
    if (minutes <= 4) return 1;
    if (minutes <= 14) return 2;
    if (minutes <= 29) return 3;
    if (minutes <= 59) return 4;
    return 5;
}

function getInfluenceColor(
    kind: InfluenceKind,
    riskLevel: "low" | "medium" | "high" = "low"
): string {
    if (kind === "personalConveyance") {
        if (riskLevel === "high") return "#dc2626";
        if (riskLevel === "medium") return "#ea580c";
        return "#ca8a04";
    }

    if (riskLevel === "high") return "#b45309";
    if (riskLevel === "medium") return "#d97706";
    return "#eab308";
}

function getSuppressedDrivingTraceColor(
    kind: InfluenceKind,
    riskLevel: "low" | "medium" | "high" = "low"
): string {
    void kind
    void riskLevel
    return "#a79b8a";
}

function getOverlapSeconds(
    startA: number,
    endA: number,
    startB: number,
    endB: number
): number {
    const start = Math.max(startA, startB);
    const end = Math.min(endA, endB);
    return Math.max(0, end - start);
}

function getPrimaryInfluence(segment: Segment): SegmentInfluenceSummary | null {
    if (!segment.influenceSummaries || segment.influenceSummaries.length === 0) return null;

    return [...segment.influenceSummaries].sort((a, b) => b.seconds - a.seconds)[0];
}

function getSegmentInfluenceSummaries(
    segment: Segment,
    influences: InfluenceInterval[]
): SegmentInfluenceSummary[] {
    const totals = new Map<InfluenceKind, { seconds: number; riskLevel?: "low" | "medium" | "high" }>();

    for (const influence of influences) {
        const overlap = getOverlapSeconds(
            segment.startSecond,
            segment.endSecond,
            influence.startSecond,
            influence.endSecond
        );

        if (overlap <= 0) continue;

        const existing = totals.get(influence.kind);

        if (existing) {
            existing.seconds += overlap;

            if (
                influence.riskLevel === "high" ||
                (influence.riskLevel === "medium" && existing.riskLevel === "low") ||
                !existing.riskLevel
            ) {
                existing.riskLevel = influence.riskLevel;
            }
        } else {
            totals.set(influence.kind, {
                seconds: overlap,
                riskLevel: influence.riskLevel,
            });
        }
    }

    return Array.from(totals.entries()).map(([kind, value]) => ({
        kind,
        seconds: value.seconds,
        riskLevel: value.riskLevel,
    }));
}

function getSegmentInfluenceSlices(
    segment: Segment,
    influences: InfluenceInterval[]
): SegmentInfluenceSlice[] {
    const slices: SegmentInfluenceSlice[] = [];

    for (const influence of influences) {
        const overlapStartSecond = Math.max(segment.startSecond, influence.startSecond);
        const overlapEndSecond = Math.min(segment.endSecond, influence.endSecond);
        const overlapSeconds = Math.max(0, overlapEndSecond - overlapStartSecond);

        if (overlapSeconds <= 0) continue;

        slices.push({
            kind: influence.kind,
            riskLevel: influence.riskLevel,
            startSecond: influence.startSecond,
            endSecond: influence.endSecond,
            overlapStartSecond,
            overlapEndSecond,
            overlapSeconds,
        });
    }

    return slices;
}

function formatDurationLabelCompact(totalSeconds: number): string {
    const totalMinutes = Math.floor(totalSeconds / 60);

    if (totalMinutes < 30) return "";

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (minutes === 0 && hours > 0) {
        const hasExtraSeconds = totalSeconds % 60 > 0;
        return `${hours}h${hasExtraSeconds ? "+" : ""}`;
    }

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}`;
    }

    return `:${String(minutes).padStart(2, "0")}`;
}

function formatDurationLabelFull(totalSeconds: number): string {
    const roundedSeconds = Math.max(0, Math.round(totalSeconds));

    const hours = Math.floor(roundedSeconds / 3600);
    const minutes = Math.floor((roundedSeconds % 3600) / 60);
    const seconds = roundedSeconds % 60;

    if (hours > 0) {
        if (minutes === 0 && seconds === 0) return `${hours}h`;
        if (minutes === 0) return `${hours}h ${seconds}s`;
        if (seconds === 0) return `${hours}h ${minutes}m`;
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    if (minutes > 0) {
        if (seconds === 0) return `${minutes}m`;
        return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
}

function formatClockShort(totalSeconds: number): string {
    const secondsIntoDay = totalSeconds % 86400;

    const hours24 = Math.floor(secondsIntoDay / 3600);
    const minutes = Math.floor((secondsIntoDay % 3600) / 60);
    const seconds = secondsIntoDay % 60;

    const suffix = hours24 >= 12 ? "p" : "a";
    const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

    return `${hour12}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}${suffix}`;
}

function formatMonthDayFromOffset(dayOffset: number): string {
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    const d = new Date(base);
    d.setDate(base.getDate() + dayOffset);

    const month = d.getMonth() + 1;
    const day = d.getDate();

    return `${month}/${day}`;
}

function formatSegmentTimeRange(startSecond: number, endSecond: number): string {
    const startDay = Math.floor(startSecond / 86400);
    const endDay = Math.floor(endSecond / 86400);

    if (startDay === endDay) {
        return `${formatClockShort(startSecond)}-${formatClockShort(endSecond)}`;
    }

    const startSecondsIntoDay = startSecond % 86400;
    const endSecondsIntoDay = endSecond % 86400;

    return `${formatMonthDayFromOffset(startDay)} ${formatClockShort(
        startSecondsIntoDay
    )} - ${formatMonthDayFromOffset(endDay)} ${formatClockShort(endSecondsIntoDay)}`;
}

function getSegmentHint(segment: Segment): string {
    const meta = kindMeta[segment.kind];

    return [
        `${formatDurationLabelFull(getDurationSeconds(segment))}`,
        `${formatSegmentTimeRange(segment.startSecond, segment.endSecond)}`,
        `${meta.label}`,
    ].join("\n");
}

function formatClock(totalSeconds: number): string {
    const day = Math.floor(totalSeconds / 86400);
    const secondsIntoDay = totalSeconds % 86400;

    const hours24 = Math.floor(secondsIntoDay / 3600);
    const minutes = Math.floor((secondsIntoDay % 3600) / 60);

    const suffix = hours24 >= 12 ? "PM" : "AM";
    const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

    const base = `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
    return day > 0 ? `+${day}d ${base}` : base;
}

function estimateLabelWidth(label: string): number {
    if (label.length === 0) return 0;
    return Math.max(10, label.length * 7);
}

function getCompressedWidths(segments: Segment[]): Record<string, number> {
    return Object.fromEntries(
        segments.map((segment) => {
            const seconds = getDurationSeconds(segment);
            const minutes = getDurationMinutes(segment);
            const label = formatDurationLabelCompact(seconds);
            const widthPx = estimateLabelWidth(label) + getTierPadding(minutes);
            return [segment.id, widthPx];
        })
    );
}

function segmentBelongsToRow(
    segment: Segment,
    rowKey: SubRowKey,
    rowMode: RowMode
) {
    if (rowMode === "2-row") {
        if (rowKey === "rest") return kindMeta[segment.kind].row === "rest";
        if (rowKey === "work") return kindMeta[segment.kind].row === "work";
        return false;
    }

    return segment.kind === rowKey;
}

function renderSpacer(
    key: string,
    proportionalWidth: number,
    compressedWidth: number,
    mode: DisplayMode
) {
    return (
        <div
            key={key}
            style={{
                width: mode === "proportional" ? `${proportionalWidth}%` : compressedWidth,
                flex: "0 0 auto",
                minWidth: 0,
                height: "100%",
            }}
        />
    );
}

function Axis({
    scale,
    labels,
}: {
    scale: TimelineScale;
    labels: TimelineLabelFixture[];
}) {
    function formatHourLabel(totalSecond: number): string {
        const secondsIntoDay = ((totalSecond % 86400) + 86400) % 86400;
        const hour = Math.floor(secondsIntoDay / 3600);

        if (hour === 0) return "12a";
        if (hour === 12) return "N";

        if (hour >= 13 && hour <= 21) return `${hour - 12}p`;
        if (hour === 22) return "10";
        if (hour === 23) return "11";
        if (hour >= 1 && hour <= 11) return `${hour}`;

        return "";
    }

    const firstHour = Math.ceil(scale.startSecond / 3600);
    const lastHour = Math.floor(scale.endSecond / 3600);

    const ticks: number[] = [];
    for (let hour = firstHour; hour <= lastHour; hour++) {
        const second = hour * 3600;
        if (second < scale.startSecond || second > scale.endSecond) continue;
        ticks.push(second);
    }

    const AXIS_HEIGHT = 140;
    const AXIS_TICK_BAND_HEIGHT = 22;
    const AXIS_LABEL_BAND_TOP = 22;

    return (
        <div
            style={{
                marginTop: 0,
                height: AXIS_HEIGHT,
                width: scale.canvasWidthPx,
                boxSizing: "border-box",
                flex: "0 0 auto",
                position: "relative",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: TRACK_X_PADDING,
                    right: TRACK_X_PADDING,
                    height: AXIS_TICK_BAND_HEIGHT,
                }}
            >
                {ticks.map((second) => {
                    const trackWidthPx = getTrackWidthPx(scale);
                    const rawLeftPx = timeToPx(second, scale);
                    const leftPx =
                        second === scale.endSecond
                            ? Math.max(0, trackWidthPx - 1)
                            : Math.max(0, rawLeftPx);

                    return (
                        <div
                            key={second}
                            style={{
                                position: "absolute",
                                left: leftPx,
                                top: 0,
                                transform: "translateX(-50%)",
                                textAlign: "center",
                            }}
                        >
                            <div
                                style={{
                                    marginTop: 4,
                                    fontSize: 10,
                                    color: "#64748b",
                                    whiteSpace: "nowrap",
                                    textAlign: "center",
                                    minWidth: 16,
                                }}
                            >
                                {formatHourLabel(second)}
                            </div>
                        </div>
                    );
                })}
            </div>

            <svg
                style={{
                    position: "absolute",
                    top: AXIS_LABEL_BAND_TOP + 3,
                    left: TRACK_X_PADDING,
                    right: TRACK_X_PADDING,
                    height: AXIS_HEIGHT - AXIS_LABEL_BAND_TOP,
                    pointerEvents: "none",
                    overflow: "visible",
                }}
            >
                {labels.map((item) => (
                    <TimelineLabel
                        key={`${item.time}-${item.label}`}
                        timestamp={parseFixtureTime(item.time)}
                        label={item.label}
                        secondsToPx={(s) => timeToPx(s, scale)}
                        offsetY={0}
                    />
                ))}
            </svg>
        </div>
    );
}

function AxisSpacer() {
    return <div style={{ height: 140 }} />;
}

function LegendChip({ kind }: { kind: SegmentKind }) {
    const meta = kindMeta[kind];

    return (
        <div
            style={{
                padding: "4px 10px",
                borderRadius: 9999,
                border: `1px solid ${meta.chipBorder}`,
                background: meta.chipBg,
                color: meta.chipText,
                fontSize: 12,
                fontWeight: 600,
            }}
        >
            {meta.label}
        </div>
    );
}

function SegmentDetails({ segment }: { segment: Segment | null }) {
    if (!segment) {
        return (
            <div
                style={{
                    border: "1px dashed #cbd5e1",
                    borderRadius: 16,
                    padding: 16,
                    fontSize: 14,
                    color: "#64748b",
                    background: "white",
                }}
            >
                Hover or tap a segment to inspect it.
            </div>
        );
    }

    const meta = kindMeta[segment.kind];

    return (
        <div
            style={{
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                padding: 16,
                background: "white",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
        >
            <div
                style={{
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                }}
            >
                <LegendChip kind={segment.kind} />
                <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>
                    {formatDurationLabelFull(getDurationSeconds(segment))}
                </span>
            </div>

            <div
                style={{
                    display: "grid",
                    gap: 4,
                    fontSize: 14,
                    color: "#475569",
                }}
            >
                <div>Start: {formatClock(segment.startSecond)}</div>
                <div>End: {formatClock(segment.endSecond)}</div>
                <div>Duration: {formatDurationLabelFull(getDurationSeconds(segment))}</div>
                <div>Row: {meta.row === "work" ? "Work bar" : "Rest line"}</div>
                <div>
                    Influence:{" "}
                    {segment.influenceSummaries && segment.influenceSummaries.length > 0 ? (
                        segment.influenceSummaries.map((influence, index) => (
                            <span key={index}>
                                {index > 0 ? ", " : ""}
                                {influence.kind === "personalConveyance"
                                    ? "Personal Conveyance"
                                    : "Yard Move"}{" "}
                                ({formatDurationLabelFull(influence.seconds)})
                            </span>
                        ))
                    ) : (
                        <span style={{ color: "#94a3b8" }}>None</span>
                    )}
                </div>
            </div>
        </div>
    );
}

function TimelineViewport({
    children,
    initialScrollLeft,
}: {
    children: React.ReactNode;
    initialScrollLeft?: number;
}) {
    const viewportRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!viewportRef.current || initialScrollLeft == null) return;

        viewportRef.current.scrollLeft = initialScrollLeft;
    }, [initialScrollLeft]);

    return (
        <div
            ref={viewportRef}
            style={{
                overflowX: "auto",
                overflowY: "hidden",
                WebkitOverflowScrolling: "touch",
                minWidth: 0,
                maxWidth: "100%",
            }}
        >
            {children}
        </div>
    );
}

function TimelineCanvas({
    widthPx,
    children,
}: {
    widthPx: number;
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                width: widthPx,
                minWidth: "100%",
                display: "grid",
                gap: 0,
            }}
        >
            {children}
        </div>
    );
}

function ToolbarButton({
    active,
    children,
    onClick,
}: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: active ? "1px solid #94a3b8" : "1px solid #cbd5e1",
                background: active ? "#e2e8f0" : "white",
                color: "#0f172a",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
            }}
        >
            {children}
        </button>
    );
}

function ProportionalInfluenceOverlay({
    segment,
    influences,
}: {
    segment: Segment;
    influences: InfluenceInterval[];
}) {
    const segmentDuration = getDurationSeconds(segment);
    const slices = getSegmentInfluenceSlices(segment, influences);

    if (segmentDuration <= 0 || slices.length === 0) return null;

    return (
        <>
            {slices.map((slice, index) => {
                const leftPct =
                    ((slice.overlapStartSecond - segment.startSecond) / segmentDuration) * 100;
                const widthPct = (slice.overlapSeconds / segmentDuration) * 100;

                return (
                    <div
                        key={`${slice.kind}-${slice.overlapStartSecond}-${slice.overlapEndSecond}-${index}`}
                        style={{
                            position: "absolute",
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            bottom: -3,
                            height: getInfluenceThickness(slice.overlapSeconds),
                            background: getInfluenceColor(
                                slice.kind,
                                slice.riskLevel ?? "low"
                            ),
                            borderRadius: 9999,
                            pointerEvents: "none",
                        }}
                    />
                );
            })}
        </>
    );
}

function DrivingRowSuppressedDrivingOverlay({
    influences,
    scale,
}: {
    influences: InfluenceInterval[];
    scale: TimelineScale;
}) {
    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
            }}
        >
            {influences.map((influence, index) => {
                const leftPx = timeToPx(influence.startSecond, scale);
                const rightPx = timeToPx(influence.endSecond, scale);
                const widthPx = Math.max(0, rightPx - leftPx);

                return (
                    <div
                        key={`${influence.kind}-${influence.startSecond}-${influence.endSecond}-${index}`}
                        style={{
                            position: "absolute",
                            left: leftPx,
                            width: widthPx,
                            top: "50%",
                            transform: "translateY(-50%)",
                            height: 1,
                            background: getSuppressedDrivingTraceColor(
                                influence.kind,
                                influence.riskLevel ?? "low"
                            ),
                            borderRadius: 9999,
                            opacity: 0.40,
                        }}
                    />
                );
            })}
        </div>
    );
}

function HourGuidelinesOverlay({
    scale,
}: {
    scale: TimelineScale;
}) {
    const firstHour = Math.ceil(scale.startSecond / 3600);
    const lastHour = Math.floor(scale.endSecond / 3600);

    const hourMarks: number[] = [];

    for (let hour = firstHour; hour <= lastHour; hour++) {
        const second = hour * 3600;
        if (second < scale.startSecond || second > scale.endSecond) continue;
        hourMarks.push(second);
    }

    return (
        <div
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 0,
            }}
        >
            {hourMarks.map((second) => {
                const trackWidthPx = getTrackWidthPx(scale);
                const rawLeftPx = timeToPx(second, scale);
                const leftPx =
                    second === scale.endSecond
                        ? Math.max(0, trackWidthPx - 1)
                        : Math.max(0, rawLeftPx);

                const dayBoundary = second % 86400 === 0;

                return (
                    <div
                        key={second}
                        style={{
                            position: "absolute",
                            left: leftPx - 0.5,
                            top: 0,
                            bottom: 0,
                            width: 1,
                            background: dayBoundary
                                ? "rgba(15, 23, 42, 0.14)"
                                : "rgba(15, 23, 42, 0.06)",
                        }}
                    />
                );
            })}
        </div>
    );
}

function WorkSegment({
    segment,
    width,
    widthMode,
    influences,
    active,
    onActivate,
}: {
    segment: Segment;
    width: number;
    widthMode: DisplayMode;
    influences: InfluenceInterval[];
    active: boolean;
    onActivate: () => void;
}) {
    const meta = kindMeta[segment.kind];
    const compactLabel = formatDurationLabelCompact(getDurationSeconds(segment));
    const influence = getPrimaryInfluence(segment);

    return (
        <button
            onMouseEnter={onActivate}
            onFocus={onActivate}
            onClick={onActivate}
            title={getSegmentHint(segment)}
            style={{
                width: widthMode === "proportional" ? `${width}%` : width,
                flex: "0 0 auto",
                minWidth: 0,
                boxSizing: "border-box",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: widthMode === "proportional" ? 0 : "0 2px",
                border: "none",
                borderRadius: 12,
                background: meta.workColor,
                color: "white",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: active
                    ? "0 0 0 2px rgba(15, 23, 42, 0.25)"
                    : "0 1px 2px rgba(0,0,0,0.10)",
                whiteSpace: "nowrap",
                overflow: "visible",
                textOverflow: "ellipsis",
                position: "relative",
            }}
        >
            {compactLabel}

            {widthMode === "proportional" ? (
                <ProportionalInfluenceOverlay
                    segment={segment}
                    influences={influences}
                />
            ) : (
                influence && (
                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: -3,
                            height: getInfluenceThickness(influence.seconds),
                            background: getInfluenceColor(
                                influence.kind,
                                influence.riskLevel ?? "low"
                            ),
                            borderRadius: 9999,
                            pointerEvents: "none",
                        }}
                    />
                )
            )}
        </button>
    );
}

function RestSegment({
    segment,
    width,
    widthMode,
    influences,
    active,
    onActivate,
}: {
    segment: Segment;
    width: number;
    widthMode: DisplayMode;
    influences: InfluenceInterval[];
    active: boolean;
    onActivate: () => void;
}) {
    const meta = kindMeta[segment.kind];
    const compactLabel = formatDurationLabelCompact(getDurationSeconds(segment));
    const influence = getPrimaryInfluence(segment);

    return (
        <button
            onMouseEnter={onActivate}
            onFocus={onActivate}
            onClick={onActivate}
            title={getSegmentHint(segment)}
            style={{
                width: widthMode === "proportional" ? `${width}%` : width,
                flex: "0 0 auto",
                minWidth: widthMode === "proportional" ? 0 : 4,
                border: "none",
                background: "transparent",
                padding: 0,
                cursor: "pointer",
                textAlign: "center",
                overflow: "visible",
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                }}
            >
                {widthMode === "proportional" ? (
                    <ProportionalInfluenceOverlay
                        segment={segment}
                        influences={influences}
                    />
                ) : (
                    influence && (
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                bottom: -3,
                                height: getInfluenceThickness(influence.seconds),
                                background: getInfluenceColor(
                                    influence.kind,
                                    influence.riskLevel ?? "low"
                                ),
                                borderRadius: 9999,
                                pointerEvents: "none",
                            }}
                        />
                    )
                )}

                <div
                    style={{
                        height: 14,
                        marginBottom: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#475569",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textAlign: "center",
                        lineHeight: "14px",
                    }}
                >
                    {compactLabel}
                </div>

                <div
                    style={{
                        width: "100%",
                        borderTop: `${active ? 4 : 3}px solid ${meta.restColor}`,
                        borderRadius: 9999,
                    }}
                />
            </div>
        </button>
    );
}

function RowLabels({
    parent,
    rowMode,
}: {
    parent: ParentRow;
    rowMode: RowMode;
}) {
    const title = parent === "rest" ? "Rest" : "Work";
    const config = ROW_CONFIG[parent];

    return (
        <div
            style={{
                minHeight: 88,
                height: 88,
                padding: "12px 0",
                boxSizing: "border-box",
                display: "grid",
                gridTemplateColumns: rowMode === "2-row" ? "1fr" : "44px 1fr",
                gridTemplateRows: rowMode === "2-row" ? "1fr" : "1fr 1fr",
                columnGap: 8,
                rowGap: 0,
                alignItems: "stretch",
            }}
        >
            {rowMode === "2-row" ? (
                <div
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#475569",
                        display: "flex",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    {title}
                </div>
            ) : (
                <>
                    <div
                        style={{
                            gridRow: "1 / span 2",
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#475569",
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                        }}
                    >
                        {title}
                    </div>

                    {config.subRows.map((subRow) => (
                        <div
                            key={subRow.key}
                            style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#64748b",
                                textAlign: "right",
                                whiteSpace: "nowrap",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                height: "100%",
                            }}
                        >
                            {subRow.label}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

function TimelineRowGroup({
    parent,
    rowMode,
    mode,
    segments,
    influences,
    highlights,
    compressedWidths,
    activeId,
    onActivate,
    scale,
}: {
    parent: ParentRow;
    rowMode: RowMode;
    mode: DisplayMode;
    segments: Segment[];
    influences: InfluenceInterval[];
    highlights: GridHighlight[];
    compressedWidths: Record<string, number>;
    activeId: string | null;
    onActivate: (id: string) => void;
    scale?: TimelineScale;
}) {
    const isRestParent = parent === "rest";
    const subRows =
        rowMode === "2-row"
            ? [{ key: parent as SubRowKey }]
            : ROW_CONFIG[parent].subRows;

    return (
        <div
            style={{
                minHeight: 64,
                height: parent === "work" ? 64 : undefined,
                borderRadius: 16,
                background: "#f8fafc",
                padding: `12px ${TRACK_X_PADDING}px`,
                display: "grid",
                gridTemplateRows: rowMode === "2-row" ? "1fr" : "1fr 1fr",
                gap: 0,
                //gap: rowMode === "2-row" ? 0 : 8,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {mode === "proportional" && scale && (
                <GridHighlightsOverlay highlights={highlights} scale={scale} />
            )}

            {mode === "proportional" && scale && (
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        inset: `0px ${TRACK_X_PADDING}px`,
                        pointerEvents: "none",
                        zIndex: 0,
                    }}
                >
                    <HourGuidelinesOverlay scale={scale} />
                </div>
            )}

            {subRows.map((subRow) => (
                <div
                    key={subRow.key}
                    style={{
                        position: "relative",
                        display: "flex",
                        alignItems: isRestParent ? "center" : "flex-end",
                        gap: mode === "proportional" ? 0 : 4,
                        minHeight: rowMode === "2-row" ? 40 : 18,
                        height: "100%",
                        overflow: "visible",
                        zIndex: 1,
                    }}
                >
                    {mode === "proportional" &&
                        rowMode === "4-row" &&
                        subRow.key === "driving" &&
                        scale && (
                            <DrivingRowSuppressedDrivingOverlay
                                influences={influences}
                                scale={scale}
                            />
                        )}

                    {mode === "proportional" && scale && segments.length > 0
                        ? renderSpacer(
                            `${subRow.key}-leading`,
                            ((segments[0].startSecond - scale.startSecond) / scale.durationSeconds) * 100,
                            0,
                            mode
                        )
                        : null}

                    {segments.map((segment) => {
                        const proportionalWidth =
                            mode === "proportional" && scale
                                ? (getDurationSeconds(segment) / scale.durationSeconds) * 100
                                : 0;
                        const compressedWidth = compressedWidths[segment.id];

                        if (segmentBelongsToRow(segment, subRow.key, rowMode)) {
                            if (isRestParent) {
                                return (
                                    <RestSegment
                                        key={segment.id}
                                        segment={segment}
                                        width={
                                            mode === "proportional"
                                                ? proportionalWidth
                                                : compressedWidth
                                        }
                                        widthMode={mode}
                                        influences={influences}
                                        active={activeId === segment.id}
                                        onActivate={() => onActivate(segment.id)}
                                    />
                                );
                            }

                            return (
                                <WorkSegment
                                    key={segment.id}
                                    segment={segment}
                                    width={
                                        mode === "proportional"
                                            ? proportionalWidth
                                            : compressedWidth
                                    }
                                    widthMode={mode}
                                    influences={influences}
                                    active={activeId === segment.id}
                                    onActivate={() => onActivate(segment.id)}
                                />
                            );
                        }

                        return renderSpacer(
                            `${subRow.key}-${segment.id}`,
                            proportionalWidth,
                            compressedWidth,
                            mode
                        );
                    })}

                {mode === "proportional" && scale && segments.length > 0
                    ? renderSpacer(
                        `${subRow.key}-trailing`,
                        ((scale.endSecond - segments[segments.length - 1].endSecond) / scale.durationSeconds) * 100,
                        0,
                        mode
                    )
                    : null}    

                    {parent === "work" &&
                        ((rowMode === "2-row" && subRow.key === "work") ||
                            (rowMode === "4-row" && subRow.key === "driving")) &&
                        scale &&
                        fixtureViolationCaps.map((cap) => (
                            <ViolationCap
                                key={`${cap.type}-${cap.time}`}
                                type={cap.type}
                                shape={cap.shape}
                                displayMode={cap.displayMode}
                                urgency={cap.urgency}
                                left={timeToPx(parseFixtureTime(cap.time), scale)}
                                top={cap.top}
                            />
                        ))}
                </div>
            ))}
        </div>
    );
}

export default function SingleDayLog() {
    const [mode, setMode] = useState<DisplayMode>("compressed");
    const [rowMode, setRowMode] = useState<RowMode>("2-row");
    const [showHighlights, setShowHighlights] = useState(true);

    const segments = useMemo(
        () => buildSegments(fixtureEvents, fixtureInfluences),
        []
    );
    const highlights = useMemo(
        () => buildGridHighlights(fixtureGridHighlightInputs),
        []
    );
    const [activeId, setActiveId] = useState<string | null>(segments[0]?.id ?? null);

    const compressedWidths = useMemo(() => getCompressedWidths(segments), [segments]);
    const activeSegment = segments.find((segment) => segment.id === activeId) ?? null;
    const pixelsPerHour = 60;
    const compressedCanvasWidth = 60 * 24; // temp

    const timelineScale = useMemo(
        () =>
            buildTimelineScale(
                -DAYS_BEFORE_FOCUS * DAY_SECONDS,
                (DAYS_AFTER_FOCUS + 1) * DAY_SECONDS,
                pixelsPerHour
            ),
        []
    );
    const proportionalCanvasWidth = timelineScale.canvasWidthPx;

    const timelineCanvasWidth =
        mode === "proportional" ? proportionalCanvasWidth : compressedCanvasWidth;

    const initialScrollLeft = useMemo(
        () => timeToPx(0, timelineScale),
        [timelineScale]
    );

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f8fafc",
                padding: 24,
                color: "#0f172a",
                fontFamily:
                    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
        >
            <div
                style={{
                    maxWidth: 1100,
                    margin: "0 auto",
                    display: "grid",
                    gap: 24,
                }}
            >
                <div style={{ display: "grid", gap: 8 }}>
                    <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700 }}>
                        Log Grid Proof of Concept.
                    </h1>
                    <p
                        style={{
                            margin: 0,
                            maxWidth: 800,
                            fontSize: 14,
                            lineHeight: 1.6,
                            color: "#475569",
                        }}
                    >
                        Tiny React sandbox for testing the bars-vs-lines idea: work segments
                        render as heavy bars, rest segments render as lighter capped lines.
                        Default mode is compressed because sequence matters more than
                        proportional duration in the design notes.
                    </p>
                </div>

                <div
                    style={{
                        borderRadius: 24,
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        padding: 20,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 16,
                            flexWrap: "wrap",
                            marginBottom: 24,
                        }}
                    >
                        <div>
                            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
                                Single-day mock timeline
                            </h2>
                            <p
                                style={{
                                    margin: "6px 0 0 0",
                                    fontSize: 14,
                                    color: "#64748b",
                                }}
                            >
                                Mock data only. Good enough to prove draw mechanics.
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <ToolbarButton
                                active={showHighlights}
                                onClick={() => setShowHighlights((value) => !value)}
                            >
                                <span style={{ opacity: mode === "proportional" ? 1 : 0.5 }}>
                                    Highlights
                                </span>
                            </ToolbarButton>
                            <ToolbarButton
                                active={mode === "compressed"}
                                onClick={() => setMode("compressed")}
                            >
                                Compressed
                            </ToolbarButton>
                            <ToolbarButton
                                active={mode === "proportional"}
                                onClick={() => setMode("proportional")}
                            >
                                Proportional
                            </ToolbarButton>
                            <ToolbarButton
                                active={rowMode === "2-row"}
                                onClick={() => setRowMode("2-row")}
                            >
                                2 Rows
                            </ToolbarButton>
                            <ToolbarButton
                                active={rowMode === "4-row"}
                                onClick={() => setRowMode("4-row")}
                            >
                                4 Rows
                            </ToolbarButton>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `${ROW_LABEL_COLUMN_WIDTH}px 1fr`,
                            columnGap: 8,
                            alignItems: "start",
                        }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateRows: mode === "proportional" ? "auto auto 54px" : "auto auto",
                                rowGap: 0,
                                alignItems: "stretch",
                            }}
                        >
                            <RowLabels parent="rest" rowMode={rowMode} />
                            <RowLabels parent="work" rowMode={rowMode} />
                            {mode === "proportional" ? <AxisSpacer /> : null}
                        </div>

                        <TimelineViewport initialScrollLeft={mode === "proportional" ? initialScrollLeft : undefined}>
                            <TimelineCanvas widthPx={timelineCanvasWidth}>
                                <TimelineRowGroup
                                    parent="rest"
                                    rowMode={rowMode}
                                    mode={mode}
                                    segments={segments}
                                    influences={fixtureInfluences}
                                    scale={timelineScale}
                                    highlights={showHighlights ? highlights : []}
                                    compressedWidths={compressedWidths}
                                    activeId={activeId}
                                    onActivate={setActiveId}
                                />

                                <TimelineRowGroup
                                    parent="work"
                                    rowMode={rowMode}
                                    mode={mode}
                                    segments={segments}
                                    influences={fixtureInfluences}
                                    scale={timelineScale}
                                    highlights={showHighlights ? highlights : []}
                                    compressedWidths={compressedWidths}
                                    activeId={activeId}
                                    onActivate={setActiveId}
                                />

                                {mode === "proportional" && (
                                    <Axis
                                        scale={timelineScale}
                                        labels={fixtureTimelineLabels}
                                    />
                                )}
                            </TimelineCanvas>
                        </TimelineViewport>
                    </div>
                </div>

                <div
                    style={{
                        marginTop: 20,
                        display: "grid",
                        gridTemplateColumns: "1.2fr 0.8fr",
                        gap: 16,
                    }}
                >
                    <div
                        style={{
                            borderRadius: 16,
                            border: "1px solid #e2e8f0",
                            background: "#ffffff",
                            padding: 16,
                        }}
                    >
                        <div
                            style={{
                                marginBottom: 12,
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 8,
                            }}
                        >
                            <LegendChip kind="offDuty" />
                            <LegendChip kind="sleeper" />
                            <LegendChip kind="driving" />
                            <LegendChip kind="onDuty" />
                        </div>

                        <p
                            style={{
                                margin: 0,
                                fontSize: 14,
                                lineHeight: 1.6,
                                color: "#475569",
                            }}
                        >
                            This deliberately keeps the architecture split simple: fake domain
                            data, tiny layout rule, obvious render primitives. It is not trying
                            to be correct about regulations yet; it is just proving that the
                            visual grammar from the notes feels plausible.
                        </p>
                    </div>

                    <SegmentDetails segment={activeSegment} />
                </div>
            </div>
        </div>
    );
}