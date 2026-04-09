import { useMemo, useState } from "react";

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

type Segment = {
    id: string;
    kind: SegmentKind;
    startSecond: number;
    endSecond: number;
};

type RowConfig = {
    parent: ParentRow;
    subRows: Array<{ key: SubRowKey; label?: string }>;
};

const TRACK_X_PADDING = 8;
const ROW_LABEL_COLUMN_WIDTH = 120;

const fixtureEvents: DutyEvent[] = [
    { id: "a", kind: "sleeper", time: "00:00:00" },
    { id: "b", kind: "offDuty", time: "00:30:00" },
    { id: "c", kind: "sleeper", time: "01:00:00" },
    { id: "d", kind: "onDuty", time: "02:45:00" },
    { id: "e", kind: "driving", time: "09:45:00" },
    { id: "f", kind: "onDuty", time: "19:45:00" },
    { id: "g", kind: "sleeper", time: "23:45:00" },
    { id: "h", kind: "offDuty", time: "1d00:00:00" },
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
    const match = trimmed.match(/^(?:(\d+)d)?(\d{1,2}):(\d{2}):(\d{2})$/);

    if (!match) {
        throw new Error(`Invalid fixture time: ${value}`);
    }

    const [, dayPart, hourPart, minutePart, secondPart] = match;

    const days = dayPart ? Number(dayPart) : 0;
    const hours = Number(hourPart);
    const minutes = Number(minutePart);
    const seconds = Number(secondPart);

    if (hours > 23) {
        throw new Error(`Hour must be 00-23 in fixture time: ${value}`);
    }
    if (minutes > 59 || seconds > 59) {
        throw new Error(`Minute/second out of range in fixture time: ${value}`);
    }

    return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

function buildSegments(events: DutyEvent[]): Segment[] {
    const segments: Segment[] = [];

    for (let i = 0; i < events.length - 1; i++) {
        const current = events[i];
        const next = events[i + 1];

        segments.push({
            id: current.id,
            kind: current.kind,
            startSecond: parseFixtureTime(current.time),
            endSecond: parseFixtureTime(next.time),
        });
    }

    return segments;
}

function getDurationSeconds(segment: Segment): number {
    return segment.endSecond - segment.startSecond;
}

function getDurationMinutes(segment: Segment): number {
    return Math.round(getDurationSeconds(segment) / 60);
}

function formatDurationLabelCompact(totalSeconds: number): string {
    const totalMinutes = Math.round(totalSeconds / 60);

    if (totalMinutes < 30) return "";

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (minutes === 0 && hours > 0) return `${hours}h`;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}`;
    }

    return `:${String(minutes).padStart(2, "0")}`;
}

function formatDurationLabelFull(totalSeconds: number): string {
    const totalMinutes = Math.round(totalSeconds / 60);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) return `${hours}h${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
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

function getSegmentWidths(
    segment: Segment,
    compressedWidths: Record<string, number>
) {
    return {
        proportionalWidth: (getDurationSeconds(segment) / 86400) * 100,
        compressedWidth: compressedWidths[segment.id],
    };
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

function Axis() {
    const ticks = Array.from({ length: 13 }, (_, i) => i * 2);

    return (
        <div
            style={{
                marginTop: 12,
                height: 42,
                width: "100%",
                padding: `0 ${TRACK_X_PADDING}px`,
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    position: "relative",
                    height: "100%",
                    width: "100%",
                }}
            >
                {ticks.map((hour) => (
                    <div
                        key={hour}
                        style={{
                            position: "absolute",
                            left: `${(hour / 24) * 100}%`,
                            top: 0,
                            transform: "translateX(-50%)",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                width: 0,
                                height: 10,
                                margin: "0 auto",
                                borderLeft: "1px solid #94a3b8",
                            }}
                        />
                        <div
                            style={{
                                marginTop: 4,
                                fontSize: 10,
                                color: "#64748b",
                                whiteSpace: "nowrap",
                                textAlign: "center",
                            }}
                        >
                            {hour}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
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
            </div>
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

function WorkSegment({
    segment,
    width,
    widthMode,
    active,
    onActivate,
}: {
    segment: Segment;
    width: number;
    widthMode: DisplayMode;
    active: boolean;
    onActivate: () => void;
}) {
    const meta = kindMeta[segment.kind];
    const compactLabel = formatDurationLabelCompact(getDurationSeconds(segment));

    return (
        <button
            onMouseEnter={onActivate}
            onFocus={onActivate}
            onClick={onActivate}
            title={`${meta.label} ${formatDurationLabelFull(getDurationSeconds(segment))}`}
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
                overflow: "hidden",
                textOverflow: "ellipsis",
            }}
        >
            {compactLabel}
        </button>
    );
}

function RestSegment({
    segment,
    width,
    widthMode,
    active,
    onActivate,
}: {
    segment: Segment;
    width: number;
    widthMode: DisplayMode;
    active: boolean;
    onActivate: () => void;
}) {
    const meta = kindMeta[segment.kind];
    const compactLabel = formatDurationLabelCompact(getDurationSeconds(segment));

    return (
        <button
            onMouseEnter={onActivate}
            onFocus={onActivate}
            onClick={onActivate}
            title={`${meta.label} ${formatDurationLabelFull(getDurationSeconds(segment))}`}
            style={{
                width: widthMode === "proportional" ? `${width}%` : width,
                flex: "0 0 auto",
                minWidth: widthMode === "proportional" ? 0 : 4,
                border: "none",
                background: "transparent",
                padding: 0,
                cursor: "pointer",
                textAlign: "center",
            }}
        >
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
                minHeight: 64,
                display: "grid",
                gridTemplateColumns: rowMode === "2-row" ? "1fr" : "44px 1fr",
                gridTemplateRows: rowMode === "2-row" ? "1fr" : "1fr 1fr",
                columnGap: 8,
                rowGap: rowMode === "2-row" ? 0 : 8,
                alignItems: "center",
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
    compressedWidths,
    activeId,
    onActivate,
}: {
    parent: ParentRow;
    rowMode: RowMode;
    mode: DisplayMode;
    segments: Segment[];
    compressedWidths: Record<string, number>;
    activeId: string | null;
    onActivate: (id: string) => void;
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
                gap: rowMode === "2-row" ? 0 : 8,
            }}
        >
            {subRows.map((subRow) => (
                <div
                    key={subRow.key}
                    style={{
                        display: "flex",
                        alignItems: isRestParent ? "center" : "flex-end",
                        gap: mode === "proportional" ? 0 : 4,
                        minHeight: rowMode === "2-row" ? 40 : 18,
                        height: "100%",
                    }}
                >
                    {segments.map((segment) => {
                        const { proportionalWidth, compressedWidth } = getSegmentWidths(
                            segment,
                            compressedWidths
                        );

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
                </div>
            ))}
        </div>
    );
}

function TimelineSection({
    parent,
    rowMode,
    mode,
    segments,
    compressedWidths,
    activeId,
    onActivate,
}: {
    parent: ParentRow;
    rowMode: RowMode;
    mode: DisplayMode;
    segments: Segment[];
    compressedWidths: Record<string, number>;
    activeId: string | null;
    onActivate: (id: string) => void;
}) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `${ROW_LABEL_COLUMN_WIDTH}px 1fr`,
                alignItems: "stretch",
                gap: 8,
            }}
        >
            <RowLabels parent={parent} rowMode={rowMode} />
            <TimelineRowGroup
                parent={parent}
                rowMode={rowMode}
                mode={mode}
                segments={segments}
                compressedWidths={compressedWidths}
                activeId={activeId}
                onActivate={onActivate}
            />
        </div>
    );
}

export default function SingleDayLog() {
    const [mode, setMode] = useState<DisplayMode>("compressed");
    const [rowMode, setRowMode] = useState<RowMode>("2-row");

    const segments = useMemo(() => buildSegments(fixtureEvents), []);
    const [activeId, setActiveId] = useState<string | null>(segments[0]?.id ?? null);

    const compressedWidths = useMemo(() => getCompressedWidths(segments), [segments]);
    const activeSegment = segments.find((segment) => segment.id === activeId) ?? null;

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
                        Log Grid Proof of Concept
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
                                Mock data only. Good enough to prove draw mechanics..
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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

                    <TimelineSection
                        parent="rest"
                        rowMode={rowMode}
                        mode={mode}
                        segments={segments}
                        compressedWidths={compressedWidths}
                        activeId={activeId}
                        onActivate={setActiveId}
                    />

                    <TimelineSection
                        parent="work"
                        rowMode={rowMode}
                        mode={mode}
                        segments={segments}
                        compressedWidths={compressedWidths}
                        activeId={activeId}
                        onActivate={setActiveId}
                    />

                    {mode === "proportional" && (
                        <div style={{ marginLeft: ROW_LABEL_COLUMN_WIDTH + 8 }}>
                            <Axis />
                        </div>
                    )}
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