import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatedContainer } from "@/components/ui";
import { SearchInput } from "@/components/ui";
import { formatDisplayDate } from "@/utils/dateUtils";
import { getCategoryPalette } from "@/utils/assessmentConfig";
import { employeeAssessmentHistory } from "@/api/api-functions/employee-dashboard";
import { reportGenerationBySubmission } from "@/api/api-functions/reports";
import { useUser } from "@/context/UserContext";
import { ChevronDown } from "lucide-react";
import { API_ENDPOINTS } from "@/api/endpoints";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

interface AssessmentHistoryItem {
  assessment_cycle: string;
  cycle_name: string;
  status: string;
  start_date: string;
  end_date: string;
  last_submitted_on: string;
  dominant_stage: string | null;
  stages: Array<{
    stage: string;
    percentage: number;
  }>;
  items: Array<{
    submission_id: string;
    questionnaire: string;
    status: string;
    last_submitted_on: string;
    dominant_stage: string | null;
    dominant_sub_stage: string | null;
    stages: Array<{
      stage: string;
      percentage: number;
    }>;
  }>;
}

const TestHistory = () => {
  const { user } = useUser();
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Filter assessments based on search query
  const visibleHistory = assessmentHistory.filter((item) =>
    item.dominant_stage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.assessment_cycle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchAssessmentHistory = async () => {
      try {
        setLoading(true);
        if (!user?.employee_id) {
          setError("Employee ID not found. Please log in again.");
          return;
        }
        const response = await employeeAssessmentHistory(user.employee_id);
        setAssessmentHistory(response.message || []);
      } catch (err) {
        console.error("Failed to fetch assessment history:", err);
        setError("Failed to load assessment history");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentHistory();
  }, [user?.employee_id]);

  const getDominantStageScore = (stages: Array<{ stage: string; percentage: number }>, dominantStage: string | null) => {
    if (!dominantStage || !stages.length) return 0;
    const stage = stages.find(s => s.stage === dominantStage);
    return stage?.percentage || 0;
  };

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
      <div className="mt-4 overflow-x-auto overflow-y-visible" style={{ minHeight: '400px' }}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading assessment history...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-red-500">{error}</div>
          </div>
        ) : visibleHistory.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">No assessment history found</div>
          </div>
        ) : (
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
                  Completion Date
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Cycle Status
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
              {visibleHistory.map((row, index) => {
                const palette = getCategoryPalette(row.dominant_stage || 'Unknown');
                const dominantStageScore = getDominantStageScore(row.stages, row.dominant_stage);
                const scoreProgress = Math.min(100, dominantStageScore);

                return (
                  <tr
                    key={`${row.assessment_cycle}-${row.cycle_name}-${index}`}
                    className="group transition-colors cursor-pointer bg-white hover:bg-brand-teal/5"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {row.cycle_name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {row.dominant_stage ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                          style={{
                            borderColor: `${palette.accent}33`,
                            color: palette.accent,
                            background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                          }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          {row.dominant_stage}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not determined</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="font-semibold text-gray-900">
                        {formatDisplayDate(row.last_submitted_on)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="font-semibold text-gray-900">
                        {row.status}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-gray-500">
                            Score:
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {dominantStageScore}%
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
                      {row.items && row.items.length > 0 ? (
                        <ReportDropdown 
                          items={row.items} 
                          employeeId={user?.employee_id || ""}
                          cycleName={row.assessment_cycle}
                          onSelect={(item) => {
                            console.log('Opening report for:', item.questionnaire, 'with submission ID:', item.submission_id);
                          }} 
                        />
                      ) : (
                        <span className="text-xs text-gray-400 italic">No reports</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AnimatedContainer>
  );
};

// Report Dropdown Component
interface ReportDropdownProps {
  items: Array<{
    submission_id: string;
    questionnaire: string;
    status: string;
  }>;
  employeeId: string;
  cycleName: string;
  onSelect: (item: { submission_id: string; questionnaire: string }) => void;
}

const ReportDropdown = ({ items, employeeId, cycleName, onSelect }: ReportDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const getQuestionnaireDisplayName = (questionnaire: string) => {
    const displayNames: Record<string, string> = {
      "Self": "Employee Self Assessment",
      "Boss": "Manager Relationship Assessment", 
      "DEPT": "Department Assessment",
      "Company": "Company Assessment"
    };
    return displayNames[questionnaire] || questionnaire;
  };
  
  const calculateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const dropdownHeight = Math.min(items.length * 44 + 20, 200);
    const dropdownWidth = 220;
    
    let top = buttonRect.bottom + 4;
    let left = buttonRect.right - dropdownWidth;
    
    // Check if dropdown would go below viewport
    if (top + dropdownHeight > viewportHeight) {
      top = buttonRect.top - dropdownHeight - 4;
    }
    
    // Check if dropdown would go outside left edge
    if (left < 8) {
      left = 8;
    }
    
    // Check if dropdown would go outside right edge
    if (left + dropdownWidth > viewportWidth - 8) {
      left = viewportWidth - dropdownWidth - 8;
    }
    
    setDropdownStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${dropdownWidth}px`,
      maxHeight: '200px',
      overflowY: 'auto',
      zIndex: 9999
    });
  }, [items.length]);
  
  const handleToggle = () => {
    if (!isOpen) {
      calculateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };
  
  const handleSelect = async (item: { submission_id: string; questionnaire: string }) => {
    try {
      console.log('Generating report for:', item.questionnaire, 'with submission ID:', item.submission_id);
      const response = await reportGenerationBySubmission(employeeId, cycleName, item.submission_id);
      console.log('Report generation response:', response);

      // Check if response contains report_url
      if (response && response.report_url) {
        // Construct full URL using base URL + report_url from response
        const fullReportUrl = `${API_ENDPOINTS.REPORT.REPORT_PDF}${response.report_url}`;
        console.log('Opening report URL:', fullReportUrl);
        
        // Open URL in new tab (relative URLs are valid for same-origin requests)
        try {
          // For relative URLs, just open directly without URL validation
          if (fullReportUrl.startsWith('/')) {
            window.open(fullReportUrl, '_blank');
          } else {
            // For absolute URLs, validate protocol
            const url = new URL(fullReportUrl);
            if (url.protocol === 'http:' || url.protocol === 'https:') {
              window.open(fullReportUrl, '_blank');
            } else {
              throw new Error('Invalid URL protocol');
            }
          }
        } catch (urlError) {
          console.error('Invalid report URL:', fullReportUrl, urlError);
          alert('Invalid report URL received from server');
          return;
        }
      } else {
        console.error('No report_url in response:', response);
        alert('Report URL not found in server response');
      }
      
      onSelect(item);
    } catch (error) {
      console.error('Failed to open report:', error);
      alert('Failed to open report. Please try again.');
      onSelect(item);
    }
    setIsOpen(false);
  };
  
  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => {
        if (isOpen) {
          calculateDropdownPosition();
        }
      };
      
      const handleResize = () => {
        if (isOpen) {
          calculateDropdownPosition();
        }
      };
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen, calculateDropdownPosition]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="inline-flex items-center gap-2 rounded-lg border border-brand-teal/40 bg-white px-3 py-1.5 text-xs font-medium text-brand-teal transition-colors hover:bg-brand-teal/5 hover:border-brand-teal/60"
      >
        View Report
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-9998" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="rounded-lg border border-gray-200 bg-white shadow-lg ring-1 ring-black/5"
            style={dropdownStyle}
          >
            <div className="h-0.5 bg-linear-to-r from-brand-teal via-brand-navy to-brand-teal" />
            <div className="p-1">
              {items.map((item, index) => {
                const isCompleted = item.status === "Completed";
                
                return isCompleted ? (
                  <button
                    key={`${item.submission_id}-${index}`}
                    onClick={() => handleSelect({ submission_id: item.submission_id, questionnaire: item.questionnaire })}
                    className="w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-brand-teal/10 hover:text-brand-teal"
                  >
                    {getQuestionnaireDisplayName(item.questionnaire)}
                  </button>
                ) : (
                  <div
                    key={`${item.submission_id}-${index}`}
                    className="w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-gray-400 cursor-not-allowed opacity-60"
                  >
                    <div className="flex items-center justify-between">
                      <span>{getQuestionnaireDisplayName(item.questionnaire)}</span>
                      <span className="text-xs text-gray-400">({item.status})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TestHistory;
