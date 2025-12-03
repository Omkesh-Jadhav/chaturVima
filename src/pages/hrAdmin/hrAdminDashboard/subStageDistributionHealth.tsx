import { ResponsiveBar } from "@nivo/bar";
import hrDashboardData from "@/data/hrDashboardData.json";

interface SubStageData {
    subStage: string;
    count: number;
    stage: string;
}

interface ChartData {
    subStage: string;
    fullSubStage: string;
    count: number;
    color: string;
    stage: string;
}

const SubStageDistributionHealth = () => {
    // Process employee data to count sub-stage distribution
    const processSubStageDistribution = (): SubStageData[] => {
        const subStageCount: { [key: string]: { count: number; stage: string } } = {};

        hrDashboardData.employee.forEach(employee => {
            const mainStage = employee.stageDetails.stage;
            employee.stageDetails.subStageDetails.forEach(subStageDetail => {
                const subStage = subStageDetail.subStage.trim();
                if (!subStageCount[subStage]) {
                    subStageCount[subStage] = { count: 0, stage: mainStage };
                }
                subStageCount[subStage].count++;
            });
        });

        return Object.entries(subStageCount).map(([subStage, data]) => ({
            subStage,
            count: data.count,
            stage: data.stage
        })).sort((a, b) => b.count - a.count); // Sort by count descending
    };

    // Define colors for each main stage
    const getStageColor = (stage: string): string => {
        const colors: { [key: string]: string } = {
            "Honeymoon": "#FF6B6B",
            "Self-Introspection": "#4ECDC4", 
            "Soul-Searching": "#45B7D1",
            "Steady-State": "#96CEB4"
        };
        return colors[stage] || "#95A5A6";
    };

    const data = processSubStageDistribution();
    const totalEmployeeSubStages = data.reduce((sum, item) => sum + item.count, 0);

    // Prepare data for bar chart
    const chartData = data.map(item => ({
        subStage: item.subStage.length > 20 ? item.subStage.substring(0, 20) + "..." : item.subStage,
        fullSubStage: item.subStage,
        count: item.count,
        color: getStageColor(item.stage),
        stage: item.stage
    }));

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Sub-Stage Distribution
                </h2>
                <p className="text-sm text-gray-600">
                    Employee count across {data.length} different sub-stages ({totalEmployeeSubStages} total occurrences)
                </p>
            </div>
            
            <div className="h-96">
                <ResponsiveBar
                    data={chartData}
                    keys={['count']}
                    indexBy="subStage"
                    margin={{ top: 50, right: 130, bottom: 100, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={({ data }: { data: ChartData }) => data.color}
                    borderColor={{
                        from: 'color',
                        modifiers: [['darker', 1.6]]
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: 'Sub-Stages',
                        legendPosition: 'middle',
                        legendOffset: 80
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Employee Count',
                        legendPosition: 'middle',
                        legendOffset: -40
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{
                        from: 'color',
                        modifiers: [['darker', 1.6]]
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
                            itemWidth: 100,
                            itemHeight: 20,
                            itemDirection: 'left-to-right',
                            itemOpacity: 0.85,
                            symbolSize: 20,
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
                    tooltip={({ data }: { data: ChartData }) => (
                        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                                <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: data.color }}
                                />
                                <span className="font-medium text-sm">{data.stage}</span>
                            </div>
                            <div className="text-sm font-semibold">{data.fullSubStage}</div>
                            <div className="text-sm text-gray-600">
                                {data.count} employees ({((data.count / totalEmployeeSubStages) * 100).toFixed(1)}%)
                            </div>
                        </div>
                    )}
                    animate={true}
                    motionStiffness={90}
                    motionDamping={15}
                />
            </div>
        </div>
    );
};

export default SubStageDistributionHealth;