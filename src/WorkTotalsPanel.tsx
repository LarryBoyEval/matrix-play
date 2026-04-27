import type { CSSProperties } from "react";

type WorkTotalsPanelProps = {
    style?: CSSProperties;
};

function formatDurationPreciseBrief(totalSeconds: number): string {
    const seconds = Math.max(0, Math.floor(totalSeconds));

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];

    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0) parts.push(`${secs}s`);

    // edge case: totalSeconds === 0
    if (parts.length === 0) return "0s";

    return parts.join(" ");
}

function DirectionalDuration({
    value,
    direction,
}: {
    value: string;
    direction: "before" | "after";
}) {
    const isBefore = direction === "before";

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                color: "#94a3b8",
            }}
        >
            {isBefore && (
                <span
                    aria-hidden="true"
                    style={{
                        width: 0,
                        height: 0,
                        borderTop: "3px solid transparent",
                        borderBottom: "3px solid transparent",
                        borderRight: "5px solid #94a3b8",
                    }}
                />
            )}

            <div style={{ width: 12, height: 1, background: "#94a3b8" }} />

            <span
                style={{
                    margin: "0 -1px",
                    padding: "0 4px",
                    background: "transparent",
                    color: "#0f172a",
                    fontWeight: 700,
                    lineHeight: 1.2,
                }}
            >
                {value}
            </span>

            <div style={{ width: 12, height: 1, background: "#94a3b8" }} />

            {!isBefore && (
                <span
                    aria-hidden="true"
                    style={{
                        width: 0,
                        height: 0,
                        borderTop: "3px solid transparent",
                        borderBottom: "3px solid transparent",
                        borderLeft: "5px solid #94a3b8",
                    }}
                />
            )}
        </div>
    );
}

function WorkTotalsRow({
    label,
    prior,
    next,
    total,
}: {
    label: string;
    prior: string;
    next: string;
    total: string;
}) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 12px 1fr",
                columnGap: 4,
                alignItems: "center",
                fontSize: 13,
                lineHeight: 1.2,
                padding: "1px 0",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                }}
            >
                <span style={{ fontWeight: 400, color: "#475569" }}>{label}</span>
                <DirectionalDuration value={prior} direction="before" />
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "stretch",
                    height: "100%",
                }}
            >
                <div
                    style={{
                        width: 1,
                        background: "#cbd5e1",
                        borderRadius: 1,
                    }}
                />
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                }}
            >
                <DirectionalDuration value={next} direction="after" />
                <span style={{ color: "#64748b", fontWeight: 400 }}>
                    (={total})
                </span>
            </div>
        </div>
    );
}

export default function WorkTotalsPanel({ style }: WorkTotalsPanelProps) {
    return (
        <div
            onClick={(event) => event.stopPropagation()}
            style={{
                position: "absolute",
                top: 145,
                left: 200,
                width: "max-content",
                minWidth: 0,
                borderRadius: 16,
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                padding: "10px 12px",
                zIndex: 50,
                ...style,
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 12px 1fr",
                    columnGap: 4,
                    alignItems: "center",
                    marginBottom: 6,
                }}
            >
                <div />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            padding: "4px 14px",
                            borderRadius: 9999,
                            background: "#334155",
                            color: "white",
                            fontSize: 13,
                            fontWeight: 700,
                            lineHeight: 1.2,
                            whiteSpace: "nowrap",
                        }}
                    >
                        3h 22s Rest
                    </div>
                </div>

                <div />
            </div>

            <div style={{ display: "grid", gap: 4 }}>
                <WorkTotalsRow label="Shift" prior="3h 12m" next="5h 13m 12s" total="8h 28m 12s" />
                <WorkTotalsRow label="OnDuty" prior="2h 5m 10s" next="4h 12m 31s" total="6h 17m 41s" />
                <WorkTotalsRow label="Driving" prior="1h 6m 40s" next="4h 35m 22s" total="5h 42m 2s" />
            </div>
        </div>
    );
}