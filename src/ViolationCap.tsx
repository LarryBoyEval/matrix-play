import React from "react";

// Example SVG imports.
// Adjust paths/names to match your actual files.
import drivingGlyphUrl from "./assets/glyphs/driving.svg";
import breakGlyphUrl from "./assets/glyphs/break.svg";
import shiftGlyphUrl from "./assets/glyphs/shift.svg";
import cycleGlyphUrl from "./assets/glyphs/cycle.svg";
import onDutyGlyphUrl from "./assets/glyphs/onduty.svg";
import "./ViolationCap.css";

export type ViolationType = "break" | "driving" | "shift" | "cycle" | "onduty";
export type ViolationCapShape = "octagon" | "half-pill";
export type ViolationCapDisplayMode = "glyph" | "number";
export type ViolationUrgency = | "distant" | "watch" | "near" | "imminent" | "triggered";

export interface ViolationCapProps {
    type: ViolationType;
    shape?: ViolationCapShape;
    displayMode?: ViolationCapDisplayMode;
    urgency?: ViolationUrgency;

    left: number;
    top: number;

    width?: number;
    height?: number;

    label?: string;
    title?: string;

    edgeColor?: string;

    className?: string;
    style?: React.CSSProperties;

    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;

    selected?: boolean;
    dimmed?: boolean;
}

function getDefaultNumberLabel(type: ViolationType): string {
    switch (type) {
        case "break":
            return ":30";
        case "driving":
            return "11";
        case "shift":
            return "14";
        case "cycle":
            return "70";
        case "onduty":
            return "10";
        default:
            return "";
    }
}

function getDefaultTitle(type: ViolationType): string {
    switch (type) {
        case "break":
            return "Break violation threshold";
        case "driving":
            return "Driving violation threshold";
        case "shift":
            return "Shift violation threshold";
        case "cycle":
            return "Cycle violation threshold";
        case "onduty":
            return "On-duty violation threshold";
        default:
            return "Violation threshold";
    }
}

function getDefaultEdgeColor(type: ViolationType): string {
    switch (type) {
        case "driving":
            return "#fcd34d";
        case "onduty":
            return "#fdba74";
        case "shift":
            return "#fdba74";
        case "break":
            return "#7dd3fc";
        case "cycle":
            return "#b99ff5";
        default:
            return "#7dd3fc";
    }
}

function getGlyphUrl(type: ViolationType): string | null {
    switch (type) {
        case "break":
            return breakGlyphUrl;
        case "driving":
            return drivingGlyphUrl;
        case "shift":
            return shiftGlyphUrl;
        case "cycle":
            return cycleGlyphUrl;
        case "onduty":
            return onDutyGlyphUrl;
        default:
            return null;
    }
}

function getShapeClass(shape: ViolationCapShape): string {
    return shape === "half-pill"
        ? "violation-cap--half-pill"
        : "violation-cap--octagon";
}

function getUrgencyClass(urgency: ViolationUrgency): string {
    switch (urgency) {
        case "distant":
            return "violation-cap--distant";
        case "watch":
            return "violation-cap--watch";
        case "near":
            return "violation-cap--near";
        case "imminent":
            return "violation-cap--imminent";
        case "triggered":
            return "violation-cap--triggered";
        default:
            return "violation-cap--distant";
    }
}

export default function ViolationCap({
    type,
    shape = "octagon",
    displayMode = "number",
    urgency = "distant",
    left,
    top,
    width = 22,
    height = 22,
    label,
    title,
    edgeColor,
    className = "",
    style,
    onClick,
    onMouseEnter,
    onMouseLeave,
    selected = false,
    dimmed = false,
}: ViolationCapProps) {
    const glyphUrl = displayMode === "glyph" ? getGlyphUrl(type) : null;

    const resolvedEdgeColor = edgeColor ?? getDefaultEdgeColor(type);

    const mergedStyle: React.CSSProperties = {
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        ["--violation-edge-color" as any]: resolvedEdgeColor,
        ...style,
    };

    const classes = [
        "violation-cap",
        getShapeClass(shape),
        getUrgencyClass(urgency),
        selected ? "violation-cap--selected" : "",
        dimmed ? "violation-cap--dimmed" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const ariaLabel = title ?? getDefaultTitle(type);

    return (
        <button
            type="button"
            className={classes}
            style={mergedStyle}
            title={title ?? getDefaultTitle(type)}
            aria-label={ariaLabel}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <span className="violation-cap__content">
                {glyphUrl ? (
                    <img src={glyphUrl} className="glyph-sm" alt="" />
                ) : (
                    <span className="violation-cap__text">
                        {label ?? getDefaultNumberLabel(type)}
                    </span>
                )}
            </span>
        </button>
    );
}
