export type SegmentKind = "driving" | "onDuty" | "sleeper" | "offDuty";

export type Segment = {
    id: string;
    kind: SegmentKind;
    startSecond: number;
    endSecond: number;
    influenceSummaries?: SegmentInfluenceSummary[];
};

export type InfluenceKind = "personalConveyance" | "yardMove";

export type SegmentInfluenceSummary = {
    kind: InfluenceKind;
    seconds: number;
    riskLevel?: "low" | "medium" | "high";
};
