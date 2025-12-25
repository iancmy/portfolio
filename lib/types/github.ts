export type GHActivityDate = number | "present"

export interface GHActivityDay {
  contributionCount: number;
  date: string;
  color: string;
}

export interface GHActivityWeek {
  contributionDays: GHActivityDay[]
}

export interface GHActivity {
  totalContributions: number;
  weeks: GHActivityWeek[]
}
