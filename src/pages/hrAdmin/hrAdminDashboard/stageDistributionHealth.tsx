import { ResponsivePie } from "@nivo/pie";
import hrDashboardData from "@/data/hrDashboardData.json";

interface PieDatum {
    id: string;
    label: string;
    value: number;
    color: string;
}

const StageDistributionHealth = () => {
    // Process employee data to count stage distribution
    const processStageDistribution = () => {
        const stageCount: { [key: string]: number } = {
            "Honeymoon": 0,
            "Self-Introspection": 0,
            "Soul-Searching": 0,
            "Steady-State": 0
        };

        hrDashboardData.employee.forEach(employee => {
            const stage = employee.stageDetails.stage;
            if (stage in stageCount) {
                stageCount[stage]++;
            }
        });

        return Object.entries(stageCount).map(([stage, count]) => ({
            id: stage,
            label: stage,
            value: count,
            color: getStageColor(stage)
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

    const data = processStageDistribution();
    const totalEmployees = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Employee Stage Distribution
                </h2>
                <p className="text-sm text-gray-600">
                    Distribution of {totalEmployees} employees across different emotional stages
                </p>
            </div>
            
            <div className="h-80">
                <ResponsivePie
                    data={data}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={{ datum: 'data.color' }}
                    borderWidth={1}
                    borderColor={{
                        from: 'color',
                        modifiers: [['darker', 0.2]]
                    }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{
                        from: 'color',
                        modifiers: [['darker', 2]]
                    }}
                    legends={[
                        {
                            anchor: 'bottom',
                            direction: 'row',
                            justify: false,
                            translateX: 0,
                            translateY: 56,
                            itemsSpacing: 0,
                            itemWidth: 100,
                            itemHeight: 18,
                            itemTextColor: '#999',
                            itemDirection: 'left-to-right',
                            itemOpacity: 1,
                            symbolSize: 18,
                            symbolShape: 'circle',
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemTextColor: '#000'
                                    }
                                }
                            ]
                        }
                    ]}
                    tooltip={({ datum }: { datum: PieDatum }) => (
                        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border">
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: datum.color }}
                                />
                                <span className="font-medium">{datum.label}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                {datum.value} employees ({((datum.value / totalEmployees) * 100).toFixed(1)}%)
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

export default StageDistributionHealth;