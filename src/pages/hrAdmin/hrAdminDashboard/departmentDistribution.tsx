import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import hrDashboardData from "@/data/hrDashboardData.json";

interface EmployeeDataPoint {
    id: string;
    x: number;
    y: number;
    data: {
        name: string;
        department: string;
        stage: string;
        score: number;
        scorePercentage: number;
    };
}

interface ScatterPlotData {
    id: string;
    data: EmployeeDataPoint[];
}

const DepartmentDistribution = () => {
    // Process employee data for scatterplot
    const processEmployeeData = (): ScatterPlotData[] => {
        // Create department and stage mappings for positioning
        const departments = [...new Set(hrDashboardData.employee.map(emp => emp.department))];
        const stages = ["Honeymoon", "Self-Introspection", "Soul-Searching", "Steady-State"];
        
        // Group employees by stage for different series
        const stageGroups: { [key: string]: EmployeeDataPoint[] } = {};
        
        stages.forEach(stage => {
            stageGroups[stage] = [];
        });

        hrDashboardData.employee.forEach((employee, index) => {
            const deptIndex = departments.indexOf(employee.department);
            const stageIndex = stages.indexOf(employee.stageDetails.stage);
            const stage = employee.stageDetails.stage;
            
            if (stageIndex !== -1 && deptIndex !== -1) {
                stageGroups[stage].push({
                    id: `employee-${index}`,
                    x: deptIndex,
                    y: stageIndex,
                    data: {
                        name: employee.name,
                        department: employee.department,
                        stage: employee.stageDetails.stage,
                        score: employee.stageDetails.score,
                        scorePercentage: employee.stageDetails.scorePercentage
                    }
                });
            }
        });

        return Object.entries(stageGroups).map(([stage, employees]) => ({
            id: stage,
            data: employees
        }));
    };

    // Define colors for each stage
    const getStageColor = (stage: string): string => {
        const colors: { [key: string]: string } = {
            "Honeymoon": "#FF6B6B",
            "Self-Introspection": "#4ECDC4", 
            "Soul-Searching": "#45B7D1",
            "Steady-State": "#96CEB4"
        };
        return colors[stage] || "#95A5A6";
    };

    const data = processEmployeeData();
    const departments = [...new Set(hrDashboardData.employee.map(emp => emp.department))];
    const stages = ["Honeymoon", "Self-Introspection", "Soul-Searching", "Steady-State"];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Department-wise Stage Distribution
                </h2>
                <p className="text-sm text-gray-600">
                    Employee distribution across departments and stages (bubble size = score)
                </p>
            </div>
            
            <div className="h-96">
                <ResponsiveScatterPlot
                    data={data}
                    margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
                    xScale={{ type: 'linear', min: -0.5, max: departments.length - 0.5 }}
                    yScale={{ type: 'linear', min: -0.5, max: stages.length - 0.5 }}
                    blendMode="multiply"
                    nodeSize={(node) => {
                        // Scale node size based on score (min: 8, max: 24)
                        const score = node.data.data.score;
                        return Math.max(8, Math.min(24, (score / 170) * 20 + 4));
                    }}
                    colors={(serie) => getStageColor(String(serie.serieId))}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: 'Departments',
                        legendPosition: 'middle',
                        legendOffset: 60,
                        tickValues: departments.map((_, index) => index),
                        format: (value) => departments[value] || ''
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Stages',
                        legendPosition: 'middle',
                        legendOffset: -70,
                        tickValues: stages.map((_, index) => index),
                        format: (value) => stages[value] || ''
                    }}
                    legends={[
                        {
                            anchor: 'bottom-right',
                            direction: 'column',
                            justify: false,
                            translateX: 130,
                            translateY: 0,
                            itemWidth: 100,
                            itemHeight: 12,
                            itemsSpacing: 5,
                            itemDirection: 'left-to-right',
                            symbolSize: 12,
                            symbolShape: 'circle',
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
                    tooltip={({ node }) => (
                        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                                <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getStageColor(String(node.serieId)) }}
                                />
                                <span className="font-medium text-sm">{node.data.data.name}</span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                                <div><strong>Department:</strong> {node.data.data.department}</div>
                                <div><strong>Stage:</strong> {node.data.data.stage}</div>
                                <div><strong>Score:</strong> {node.data.data.score.toFixed(2)}</div>
                                <div><strong>Percentage:</strong> {node.data.data.scorePercentage}%</div>
                            </div>
                        </div>
                    )}
                    animate={true}
                />
            </div>
            
            {/* Legend explanation */}
            <div className="mt-4 text-xs text-gray-500 border-t pt-4">
                <p><strong>How to read:</strong> Each bubble represents an employee. Position shows department (X-axis) and stage (Y-axis). Bubble size indicates the employee's score in their stage.</p>
            </div>
        </div>
    );
};

export default DepartmentDistribution;