import { useNavigate } from "react-router-dom";
import { AnimatedContainer } from "@/components/ui";
import { SearchInput, Button } from "@/components/ui";
import { MOCK_COMPLETED_ASSESSMENTS } from "@/data/assessmentDashboard";
import { formatDisplayDate } from "@/utils/dateUtils";
import { getCategoryPalette } from "@/utils/assessmentConfig";
import { useAssessmentSearch } from "@/components/assessmentDashboard";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const TestHistory = () => {
  const navigate = useNavigate();
  const completed = MOCK_COMPLETED_ASSESSMENTS;
  const {
    searchQuery,
    setSearchQuery,
    filteredAssessments: visibleHistory,
  } = useAssessmentSearch(completed);

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      delay="lg"
      className={`${CARD_BASE_CLASSES} p-5`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Assessment History
          </h2>
          <p className="text-xs text-gray-500">
            Completed assessments and results
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by dominant stage..."
            resultCount={visibleHistory.length}
            showResultCount={!!searchQuery}
          />
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-linear-to-r from-brand-teal/5 via-white to-brand-navy/5">
              <th className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                Assessment
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                Dominant Stage
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                Completed
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                Metrics
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visibleHistory.map((row) => {
              const palette = getCategoryPalette(row.category);
              const scoreProgress = Math.min(100, row.score);

              return (
                <tr
                  key={row.id}
                  className="group transition-colors cursor-pointer bg-white hover:bg-brand-teal/5"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">
                      {row.title}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        borderColor: `${palette.accent}33`,
                        color: palette.accent,
                        background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      {row.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="font-semibold text-gray-900">
                      {formatDisplayDate(row.date)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-500">
                          Score:
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {row.score}
                        </span>
                      </div>
                      <div className="h-1.5 w-24 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${scoreProgress}%`,
                            background: `linear-gradient(90deg, ${palette.from}, ${palette.accent})`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/assessment-report");
                      }}
                      variant="gradient"
                      size="sm"
                      className="relative overflow-hidden"
                    >
                      <span
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background:
                            "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2), transparent 50%)",
                        }}
                      />
                      <span className="relative">View Report</span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AnimatedContainer>
  );
};

export default TestHistory;
