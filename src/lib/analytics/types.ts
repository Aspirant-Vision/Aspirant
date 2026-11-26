import { z } from "zod";

export const DATE_RANGE_PRESETS = [
  "today",
  "yesterday",
  "7d",
  "30d",
  "90d",
  "this_month",
  "last_month",
  "this_year",
  "all",
] as const;

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number];

export const dateRangeFilterSchema = z.object({
  preset: z.enum(DATE_RANGE_PRESETS).default("30d"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  counsellorId: z.string().uuid().optional(),
  collegeId: z.string().uuid().optional(),
  source: z.string().optional(),
});

export type DateRangeFilterInput = z.infer<typeof dateRangeFilterSchema>;

export interface DateBounds {
  startDate: string; // ISO string
  endDate: string; // ISO string
  previousStartDate: string; // ISO string for comparison
  previousEndDate: string; // ISO string for comparison
  label: string;
}

export function getDateRangeBounds(
  preset: DateRangePreset = "30d",
  customStart?: string,
  customEnd?: string
): DateBounds {
  const now = new Date();
  let start = new Date();
  let end = new Date(now);
  let prevStart = new Date();
  let prevEnd = new Date();
  let label = "Last 30 Days";

  if (customStart && customEnd) {
    start = new Date(customStart);
    end = new Date(customEnd);
    const durationMs = end.getTime() - start.getTime();
    prevEnd = new Date(start.getTime() - 1);
    prevStart = new Date(prevEnd.getTime() - durationMs);
    label = "Custom Range";
  } else {
    switch (preset) {
      case "today": {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        prevStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
        prevEnd = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        label = "Today";
        break;
      }
      case "yesterday": {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        prevStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
        prevEnd = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        label = "Yesterday";
        break;
      }
      case "7d": {
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevEnd = new Date(start.getTime() - 1);
        label = "Last 7 Days";
        break;
      }
      case "30d": {
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        prevStart = new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000);
        prevEnd = new Date(start.getTime() - 1);
        label = "Last 30 Days";
        break;
      }
      case "90d": {
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        prevStart = new Date(start.getTime() - 90 * 24 * 60 * 60 * 1000);
        prevEnd = new Date(start.getTime() - 1);
        label = "Last 90 Days";
        break;
      }
      case "this_month": {
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        prevStart = new Date(prevYear, prevMonth, 1, 0, 0, 0, 0);
        prevEnd = new Date(start.getTime() - 1);
        label = "This Month";
        break;
      }
      case "last_month": {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        start = new Date(lastMonthYear, lastMonth, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const twoMonthsAgo = lastMonth === 0 ? 11 : lastMonth - 1;
        const twoMonthsAgoYear = lastMonth === 0 ? lastMonthYear - 1 : lastMonthYear;
        prevStart = new Date(twoMonthsAgoYear, twoMonthsAgo, 1, 0, 0, 0, 0);
        prevEnd = new Date(start.getTime() - 1);
        label = "Last Month";
        break;
      }
      case "this_year": {
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        prevStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
        prevEnd = new Date(start.getTime() - 1);
        label = "This Year";
        break;
      }
      case "all": {
        start = new Date("2024-01-01T00:00:00.000Z");
        prevStart = new Date("2023-01-01T00:00:00.000Z");
        prevEnd = new Date("2023-12-31T23:59:59.999Z");
        label = "All Time";
        break;
      }
    }
  }

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    previousStartDate: prevStart.toISOString(),
    previousEndDate: prevEnd.toISOString(),
    label,
  };
}

export interface MetricComparison {
  value: number;
  previousValue: number;
  diff: number;
  percentageChange: number | null; // null when previous period has 0 data to prevent misleading infinite percentage
  hasComparison: boolean;
}

export interface FunnelStep {
  name: string;
  count: number;
  dropOffRate?: number;
  conversionFromStart: number;
}

export interface TimeSeriesPoint {
  date: string;
  leads?: number;
  applications?: number;
  admissions?: number;
}

export interface DistributionPoint {
  name: string;
  value: number;
  color?: string;
}

export interface ExecutiveAnalyticsData {
  totalLeads: MetricComparison;
  newLeads: MetricComparison;
  contactedLeads: MetricComparison;
  interestedLeads: MetricComparison;
  appsStarted: MetricComparison;
  appsSubmitted: MetricComparison;
  appsAccepted: MetricComparison;
  confirmedAdmissions: MetricComparison;
  leadToAppRate: number; // Percentage
  appToAdmissionRate: number; // Percentage
  funnelSteps: FunnelStep[];
  timeSeries: TimeSeriesPoint[];
  sourceDistribution: DistributionPoint[];
  statusDistribution: DistributionPoint[];
  dateLabel: string;
}
