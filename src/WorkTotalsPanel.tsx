import type { CSSProperties } from "react";

type WorkTotalsPanelProps = {
    style?: CSSProperties;
};

// 👇 top of file (after imports)

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
                    gap: 4,
                    whiteSpace: "nowrap",
                }}
            >
                <span style={{ fontWeight: 400, color: "#475569" }}>{label}</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{prior}</span>
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
            </div>

            <div
                style={{
                    textAlign: "center",
                    color: "#94a3b8",
                    fontWeight: 700,
                }}
            >
                |
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 4,
                    whiteSpace: "nowrap",
                }}
            >
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
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{next}</span>
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
            style={{
                position: "absolute",
                top: 140,
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
                        10:42 Rest
                    </div>
                </div>

                <div />
            </div>

            <div style={{ display: "grid", gap: 4 }}>
                <WorkTotalsRow label="Shift" prior="3:12" next="5:13" total="8:28" />
                <WorkTotalsRow label="OnDuty" prior="2:05" next="4:12" total="6:17" />
                <WorkTotalsRow label="Driving" prior="1:07" next="4:35" total="5:42" />
            </div>
        </div>
    );
}