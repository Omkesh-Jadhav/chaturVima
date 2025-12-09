/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { AnimatedContainer } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";
import { getStagePieColor } from "@/utils/assessmentConfig";

const DUMMY_DEPARTMENT_SCORES = [
  { department: "Software Development", averageScore: 1.5, employeeCount: 45 },
  { department: "SAP", averageScore: 2, employeeCount: 32 },
  { department: "Sales & Marketing", averageScore: 2.1, employeeCount: 28 },
  { department: "AI", averageScore: 4.0, employeeCount: 18 },
  { department: "Engineering", averageScore: 2.4, employeeCount: 25 },
  { department: "Finance", averageScore: 3, employeeCount: 22 },
  { department: "Human Resources", averageScore: 2.4, employeeCount: 15 },
  { department: "Operations", averageScore: 5, employeeCount: 30 },
];

const getStageFromScore = (score: number) => {
  if (score >= 4.5) return "Steady-State";
  if (score >= 3.5) return "Self-Introspection";
  if (score >= 2.5) return "Soul-Searching";
  if (score >= 1.5) return "Honeymoon";
  return "Critical";
};

const DepartmentLevelHealthScores = () => {
  const chartData = useMemo(
    () =>
      [...DUMMY_DEPARTMENT_SCORES]
        .sort((a, b) => b.averageScore - a.averageScore)
        .map((dept, idx) => {
          const stage = getStageFromScore(dept.averageScore);
          return {
            department: dept.department,
            score: dept.averageScore,
            employees: dept.employeeCount,
            rank: idx + 1,
            stage,
            color: getStagePieColor(stage),
          };
        }),
    []
  );

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      className="group relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
      style={{ overflow: "visible" }}
    >
      <SectionHeader
        title="Department-Level Health Scores"
        description="Average health scores per department, ranked by performance"
      />
      <div className="bg-linear-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-4 shadow-inner overflow-visible relative">
        <div className="h-[400px] w-full overflow-visible relative">
          <ResponsiveBar
            data={chartData}
            keys={["score"]}
            indexBy="department"
            margin={{ top: 10, right: 60, bottom: 60, left: 150 }}
            padding={0.5}
            layout="horizontal"
            valueScale={{ type: "linear", min: 0, max: 5 }}
            indexScale={{ type: "band", round: true }}
            colors={(bar: any) => bar.data.color}
            borderColor={{ from: "color", modifiers: [["darker", 1.3]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              legend: "Health Score (out of 5.0)",
              legendPosition: "middle",
              legendOffset: 50,
              format: (v: number) => v.toFixed(1),
            }}
            axisLeft={{ tickSize: 5, tickPadding: 10, legendOffset: -140 }}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.8]] }}
            tooltip={({ data }: any) => {
              const hexColor = getStagePieColor(data.stage);
              return (
                <div
                  className="bg-white border-2 rounded-xl shadow-xl p-3 min-w-[200px] backdrop-blur-sm"
                  style={{ borderColor: `${hexColor}40`, zIndex: 99999 }}
                >
                  <div className="font-bold text-base mb-2.5 text-gray-900">
                    {data.department}
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Score:</span>
                      <span
                        className="font-bold text-base"
                        style={{ color: hexColor }}
                      >
                        {data.score.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rank:</span>
                      <span className="font-semibold">#{data.rank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employees:</span>
                      <span className="font-semibold">{data.employees}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                      <span className="text-gray-600">Stage:</span>
                      <div
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${hexColor}15` }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: hexColor }}
                        />
                        <span
                          className="font-bold text-xs"
                          style={{ color: hexColor }}
                        >
                          {data.stage}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
            animate={true}
            motionConfig="gentle"
            borderRadius={8}
            enableLabel={true}
            label={(d: any) => `${d.value.toFixed(1)}`}
            defs={[
              {
                id: "gradient",
                type: "linearGradient",
                colors: [
                  { offset: 0, color: "inherit" },
                  { offset: 100, color: "inherit", opacity: 0.6 },
                ],
              },
            ]}
            fill={[{ match: "*", id: "gradient" }]}
          />
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default DepartmentLevelHealthScores;
