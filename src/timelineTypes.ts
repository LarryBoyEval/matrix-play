export type SegmentKind = "driving" | "onDuty" | "sleeper" | "offDuty";

export type Segment = {
    id: string;
    kind: SegmentKind;
    startSecond: number;
    endSecond: number;
    influenceSummaries?: SegmentInfluenceSummary[];
    analysis?: SegmentAnalysis;
};

export type InfluenceKind = "personalConveyance" | "yardMove";

export type SegmentInfluenceSummary = {
    kind: InfluenceKind;
    seconds: number;
    riskLevel?: "low" | "medium" | "high";
};

export type RestAnchorKind =
    | "fullRest"
    | "splitSleeperLong"
    | "splitSleeperShort"
    | "reset"
    | "break";

export type RestAnchorTotals = {
    drivingSeconds?: number;
    shiftSeconds?: number;
    onDutySeconds?: number;
};

export type RestAnchorAnalysis = {
    kind: RestAnchorKind;
    priorRestAnchorId?: string;
    nextRestAnchorId?: string;
    label?: string;
    totalsBefore?: RestAnchorTotals;
    totalsAfter?: RestAnchorTotals;
};

export type SegmentAnalysis = {
    restAnchor?: RestAnchorAnalysis;
};