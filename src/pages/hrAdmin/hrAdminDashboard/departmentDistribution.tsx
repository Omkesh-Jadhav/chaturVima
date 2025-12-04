import { ResponsiveBar } from "@nivo/bar";
import { motion } from "framer-motion";
import { Building2, Users, TrendingUp } from "lucide-react";
import { AnimatedContainer } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";
import hrDashboardData from "@/data/hrDashboardData.json";

interface DepartmentStageData {
        department: string;
    Honeymoon: number;
    "Self-Introspection": number;
    "Soul-Searching": number;
    "Steady-State": number;
    total: number;
}

const DepartmentDistribution = () => {

    // Define colors for each stage using project colors
    const getStageColor = (stage: string): string => {
        const colors: { [key: string]: string } = {
            "Honeymoon": "#10B981",
            "Self-Introspection": "#3B82F6", 
            "Soul-Searching": "#F59E0B",
            "Steady-State": "#8B5CF6"
        };
        return colors[stage] || "#6B7280";
    };

    // Process department-wise stage distribution
    const processDepartmentData = (): DepartmentStageData[] => {
        const departments = [...new Set(hrDashboardData.employee.map(emp => emp.department))];
        const stages = ["Honeymoon", "Self-Introspection", "Soul-Searching", "Steady-State"];
        
        return departments.map(dept => {
            const deptEmployees = hrDashboardData.employee.filter(emp => emp.department === dept);
            const stageCounts = deptEmployees.reduce((acc, emp) => {
                const stage = emp.stageDetails.stage;
                acc[stage] = (acc[stage] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            return {
                department: dept,
                Honeymoon: stageCounts["Honeymoon"] || 0,
                "Self-Introspection": stageCounts["Self-Introspection"] || 0,
                "Soul-Searching": stageCounts["Soul-Searching"] || 0,
                "Steady-State": stageCounts["Steady-State"] || 0,
                total: deptEmployees.length
            };
        });
    };

    const departmentData = processDepartmentData();
    const departments = [...new Set(hrDashboardData.employee.map(emp => emp.department))];
    const stages = ["Honeymoon", "Self-Introspection", "Soul-Searching", "Steady-State"];

    // Calculate department statistics for summary cards
    const departmentStats = departmentData.map(dept => {
        const stageCounts = {
            Honeymoon: dept.Honeymoon,
            "Self-Introspection": dept["Self-Introspection"],
            "Soul-Searching": dept["Soul-Searching"],
            "Steady-State": dept["Steady-State"]
        };
        
        const dominantStage = Object.entries(stageCounts).reduce((max, [stage, count]) => 
            count > max.count ? { stage, count } : max, 
            { stage: '', count: 0 }
        );

        return {
            department: dept.department,
            totalEmployees: dept.total,
            dominantStage: dominantStage.stage,
            dominantCount: dominantStage.count,
            dominantPercentage: ((dominantStage.count / dept.total) * 100).toFixed(0)
        };
    });

    const CARD_BASE_CLASSES =
        "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

    return (
        <AnimatedContainer
            animation="fadeInUp"
            transitionPreset="slow"
            className={CARD_BASE_CLASSES}
        >
            <SectionHeader
                title="Department-wise Distribution"
                description="Employee distribution across departments and emotional stages"
            />

            {/* Department Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
                {departmentStats.map((dept, idx) => (
                    <AnimatedContainer
                        key={dept.department}
                        animation="fadeInUp"
                        transitionPreset="normal"
                        delay={idx * 0.05}
                        className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-3 transition-all hover:shadow-md hover:border-gray-300"
                        style={{
                            borderLeftWidth: '3px',
                            borderLeftColor: getStageColor(dept.dominantStage)
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 rounded bg-linear-to-br from-brand-teal/10 to-brand-navy/10">
                                <Building2 className="h-3 w-3 text-brand-teal" />
                            </div>
                            <span className="text-xs font-semibold text-gray-900 truncate flex-1">
                                {dept.department}
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-baseline gap-1">
                                <Users className="h-3 w-3 text-gray-400" />
                                <span className="text-lg font-bold text-gray-900">{dept.totalEmployees}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div 
                                    className="w-2 h-2 rounded-full shadow-sm"
                                    style={{ backgroundColor: getStageColor(dept.dominantStage) }}
                                />
                                <span className="text-xs text-gray-600 truncate">{dept.dominantStage}</span>
                            </div>
                            <div className="text-xs font-semibold" style={{ color: getStageColor(dept.dominantStage) }}>
                                {dept.dominantPercentage}%
                            </div>
                        </div>
                    </AnimatedContainer>
                ))}
            </div>

            {/* Stacked Bar Chart - All Departments Overview */}
            <div className="mt-3">
                <div className="h-80">
                    <ResponsiveBar
                        data={departmentData}
                        keys={stages}
                        indexBy="department"
                        margin={{ top: 20, right: 100, bottom: 60, left: 50 }}
                        padding={0.2}
                        valueScale={{ type: 'linear' }}
                        indexScale={{ type: 'band', round: true }}
                        colors={(bar) => getStageColor(bar.id as string)}
                        borderColor={{
                            from: 'color',
                            modifiers: [['darker', 1.6]]
                        }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            tickSize: 4,
                            tickPadding: 4,
                            tickRotation: -45,
                            legend: 'Departments',
                            legendPosition: 'middle',
                            legendOffset: 50
                        }}
                        axisLeft={{
                            tickSize: 4,
                            tickPadding: 4,
                            tickRotation: 0,
                            legend: 'Employee Count',
                            legendPosition: 'middle',
                            legendOffset: -35
                        }}
                        labelSkipWidth={12}
                        labelSkipHeight={12}
                        labelTextColor={{
                            from: 'color',
                            modifiers: [['darker', 2]]
                        }}
                        legends={[
                            {
                                dataFrom: 'keys',
                                anchor: 'bottom-right',
                                direction: 'column',
                                justify: false,
                                translateX: 120,
                                translateY: 0,
                                itemsSpacing: 2,
                                itemWidth: 80,
                                itemHeight: 14,
                                itemDirection: 'left-to-right',
                                itemOpacity: 0.85,
                                symbolSize: 10,
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemOpacity: 1
                                        }
                                    }
                                ]
                            }
                        ]}
                        tooltip={({ id, value, indexValue, color }) => {
                            const dept = departmentData.find(d => d.department === indexValue);
                            const percentage = dept ? (((value as number) / dept.total) * 100).toFixed(1) : '0';
                            return (
                                <div className="bg-white px-3 py-2 shadow-xl rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div 
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span className="font-semibold text-sm text-gray-900">{indexValue}</span>
                                    </div>
                                    <div className="text-xs text-gray-700 space-y-0.5">
                                        <div>
                                            <span className="font-semibold" style={{ color }}>{id}:</span> {value} employees
                                        </div>
                                        <div className="text-gray-500">
                                            {percentage}% of department
                                        </div>
                                    </div>
                                </div>
                            );
                        }}
                        animate={true}
                        motionStiffness={90}
                        motionDamping={15}
                    />
                </div>
            </div>
            
            {/* Summary Footer */}
            <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-brand-teal" />
                            <span className="font-semibold text-gray-700">Total:</span>
                            <span className="font-bold text-gray-900">
                                {departmentData.reduce((sum, d) => sum + d.total, 0)} employees
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {stages.map(stage => (
                            <div key={stage} className="flex items-center gap-1.5">
                                <div 
                                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                                    style={{ backgroundColor: getStageColor(stage) }}
                                />
                                <span className="text-xs text-gray-600 font-medium">{stage}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AnimatedContainer>
    );
};

export default DepartmentDistribution;