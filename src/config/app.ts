export const appConfig = {
  name: "Finance Tracker",
  description: "Track your finances with ease",
  defaultCurrency: "USD",
  defaultTimezone: "UTC",
  dateFormat: "MM/dd/yyyy",
  theme: {
    primaryColor: "#0ea5e9",
    borderRadius: "0.5rem",
  },
  sidebar: {
    defaultCollapsed: false,
    width: 280,
    collapsedWidth: 80,
  },
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
} as const;

export type AppConfig = typeof appConfig;