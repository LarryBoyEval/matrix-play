type DayMarkerProps = {
    lines: string[];
    leftPx: number;
    onClick?: () => void;
};

const MARKER_BG = "#f1f5f9";
const MARKER_BORDER = "#cbd5e1";
const MARKER_TEXT = "#64748b";

export default function DayMarker({
    lines,
    leftPx,
    onClick,
}: DayMarkerProps) {
    return (
        <div
            onClick={onClick}
            style={{
                position: "absolute",
                left: leftPx,
                transform: "translateX(-50%)",
                top: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: onClick ? "pointer" : "default",
            }}
        >
            <div
                style={{
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderBottom: `8px solid ${MARKER_BORDER}`,
                }}
            />

            <div
                style={{
                    marginTop: -1,
                    padding: "3px 7px 4px",
                    borderRadius: 6,
                    border: `1px solid ${MARKER_BORDER}`,
                    background: MARKER_BG,
                    color: MARKER_TEXT,
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1.05,
                    whiteSpace: "nowrap",
                    textAlign: "center",
                    minWidth: 26,
                }}
            >
                {lines.map((line, index) => (
                    <div key={`${line}-${index}`}>{line}</div>
                ))}
            </div>
        </div>
    );
}
