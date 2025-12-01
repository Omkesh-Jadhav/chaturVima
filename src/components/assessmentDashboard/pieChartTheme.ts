/**
 * Pie Chart Theme Configuration
 */

import { colors } from "@/utils/colors";

export const pieChartTheme = {
  text: {
    fontSize: 12,
    fill: colors.neutral.gray700,
    fontWeight: 600,
  },
  tooltip: {
    container: {
      background: "#fff",
      padding: "8px 12px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  },
};
