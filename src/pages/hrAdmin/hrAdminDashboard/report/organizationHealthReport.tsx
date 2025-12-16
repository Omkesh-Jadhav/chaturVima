import React from "react";
import { ResponsiveRadialBar } from "@nivo/radial-bar";
import { ResponsivePie } from "@nivo/pie";
import organizationHealthData from "@/data/organizationHealthData.json";

const OrganizationHealthReport: React.FC = () => {
  // Extract data from JSON
  const {
    reportInfo,
    executiveSummary,
    interpretations,
    overview: { text: overviewText },
    stageDistribution: { data: stageDistribution },
    stageAnalysisDistribution,
    stageAnalysis,
    departmentBreakdown,
    keyDepartmentalInsights,
    swotAnalysis,
    recommendations,
    actionPlan,
    conclusion
  } = organizationHealthData;

  return (
    <div className="bg-linear-to-br from-indigo-50 to-purple-100 min-h-screen flex flex-col items-center p-8">
      <div className="bg-white shadow-2xl rounded-3xl max-w-6xl w-full p-10 space-y-10">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-indigo-700 mb-4">
            {reportInfo.title}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600 mb-6">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="font-semibold">Organization</p>
              <p className="text-lg text-indigo-700">{reportInfo.organization}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="font-semibold">Company Size</p>
              <p className="text-lg text-purple-700">{reportInfo.companySize} Employees</p>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <p className="font-semibold">Assessment Cycle</p>
              <p className="text-lg text-pink-700">{reportInfo.assessmentCycle}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="font-semibold">Assessment Framework</p>
              <p className="text-sm text-green-700">{reportInfo.assessmentFramework}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold">Report Date</p>
              <p className="text-sm text-blue-700">{reportInfo.reportDate}</p>
            </div>
          </div>
        </header>

        {/* Overall Health Score */}
        <section className="p-6 bg-linear-to-r from-green-50 to-emerald-100 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-green-700 mb-6 text-center">
            Overall Organizational Health Score
          </h2>
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-48 h-48 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                  fill="none"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  stroke="#10b981"
                  strokeWidth="20"
                  fill="none"
                  strokeDasharray={`${(reportInfo.overallHealthScore / reportInfo.maxHealthScore) * 502.65} 502.65`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-green-600">
                  {reportInfo.overallHealthScore}
                </div>
                <div className="text-lg text-gray-500">/ {reportInfo.maxHealthScore}</div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-green-700 mb-2">
                Dominant Stage: <span className="text-green-800">{reportInfo.dominantStage}</span>
              </p>
              <p className="text-md text-green-600">
                Predominant Sub-Stage: <span className="font-medium">{reportInfo.predominantSubStage}</span>
              </p>
            </div>
          </div>

          {/* Health Score Breakdown */}
          {/* <div className="mb-8">
            <h3 className="text-xl font-semibold text-green-700 mb-6 text-center">Health Score Breakdown</h3>
            <div className="w-full h-80" data-chart-id="healthScoreRadialBar">
              <ResponsiveRadialBar
                data={healthScoreBreakdown.map((item) => ({
                  id: item.name,
                  data: [{ x: item.name, y: item.score }],
                }))}
                valueFormat=">-.1f"
                padding={0.4}
                cornerRadius={2}
                margin={{ top: 40, right: 120, bottom: 40, left: 40 }}
                radialAxisStart={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
                circularAxisOuter={{
                  tickSize: 5,
                  tickPadding: 12,
                  tickRotation: 0,
                }}
                legends={[
                  {
                    anchor: "right",
                    direction: "column",
                    justify: false,
                    translateX: 80,
                    translateY: 0,
                    itemsSpacing: 6,
                    itemDirection: "left-to-right",
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: "#999",
                    symbolSize: 18,
                    symbolShape: "square",
                    effects: [
                      {
                        on: "hover",
                        style: {
                          itemTextColor: "#000",
                        },
                      },
                    ],
                  },
                ]}
                colors={{ scheme: "category10" }}
                borderWidth={1}
                borderColor={{ from: "color" }}
                enableTracks={true}
                tracksColor="#f0f0f0"
                enableRadialGrid={true}
                enableCircularGrid={true}
                isInteractive={true}
                animate={true}
                motionConfig="gentle"
              />
            </div>
          </div> */}

          {/* Health Score Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthScoreBreakdown.map((item) => (
              <div
                key={item.name}
                className="bg-white rounded-lg p-4 shadow-sm border border-green-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">
                      {item.score}
                    </div>
                    <div className="text-xs text-gray-500">/ {item.maxScore}</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-1 text-right">
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div> */}
        </section>

        {/* Overview */}
        <section className="p-6 bg-indigo-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
            Overview
          </h2>
          <div className="space-y-4">
            {overviewText.map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Executive Summary */}
        <section className="p-6 bg-amber-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-amber-700 mb-4">
            Executive Summary
          </h2>
          <div className="space-y-4">
            {executiveSummary.map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Interpretations */}
        <section className="p-6 bg-teal-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-teal-700 mb-6">
            Interpretations
          </h2>

          {/* Main Interpretation Text */}
          <div className="space-y-4 mb-8">
            {interpretations.text.map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Employee Exhibits */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">Employee's exhibit:</h3>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-teal-100">
              <ul className="space-y-3">
                {interpretations.employeeExhibits.map((exhibit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 shrink-0"></div>
                    <p className="text-gray-700">{exhibit}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stage-Specific Risks */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">However, classic {reportInfo.dominantStage}-stage risks are also visible:</h3>
            <div className="bg-orange-50 rounded-lg p-6 shadow-sm border border-orange-200">
              <ul className="space-y-3">
                {interpretations.honeymoonRisks.map((risk, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0"></div>
                    <p className="text-gray-700">{risk}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Behavioral Energy */}
          <div className="bg-teal-100 rounded-lg p-6 border-l-4 border-teal-500">
            <p className="text-gray-800 font-medium italic">
              {interpretations.behavioralEnergy}
            </p>
          </div>
        </section>

        {/* Stage Analysis Distribution */}
        <section className="p-6 bg-slate-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">
            {stageAnalysisDistribution.title} across {stageAnalysisDistribution.employeeCount} Employees
          </h2>

          {/* Stage Distribution Table */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Main Stage</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Employees</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">% of Org</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Avg Stage Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {stageDistribution.map((stage, index) => (
                    <tr key={stage.stage} className={index === 0 ? "bg-green-50" : "hover:bg-slate-50"}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          ></div>
                          <span className="text-sm font-medium text-slate-900">{stage.stage}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-700 font-medium">
                        {stage.employeeCount}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-700 font-medium">
                        {stage.percentage}%
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-700 font-medium">
                        {stage.avgStageScore}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-semibold">
                    <td className="px-6 py-4 text-sm text-slate-900">Total</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-900">{stageAnalysisDistribution.employeeCount}</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-900">100%</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-900">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Pie Chart */}
              <div className="w-full h-80" data-chart-id="stageDistributionPie">
                <h3 className="text-lg font-semibold text-purple-700 mb-4 text-center">
                  Stage Analysis Pie Chart
                </h3>
                <ResponsivePie
                  data={stageDistribution.map((item) => ({
                    id: item.stage,
                    label: item.stage,
                    value: item.employeeCount,
                    color: item.color,
                  }))}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={{ datum: "data.color" }}
                  borderWidth={1}
                  borderColor={{
                    from: "color",
                    modifiers: [["darker", 0.2]],
                  }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: "color" }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{
                    from: "color",
                    modifiers: [["darker", 2]],
                  }}
                  animate={true}
                  motionConfig="wobbly"
                />
              </div>

              {/* Stage Distribution Cards */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-700 mb-4 text-center">
                  Stage Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stageDistribution.map((item) => (
                    <div
                      key={item.stage}
                      className="bg-white rounded-lg p-4 shadow-sm border border-purple-100"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <h4 className="font-semibold text-gray-800">{item.stage}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-purple-600">
                            {item.employeeCount}
                          </div>
                          <div className="text-xs text-gray-500">employees</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color
                          }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 mt-2 text-right">
                        {item.percentage}% of workforce
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Dominant Stage Analysis */}
          <div className="mb-6">
            <div className="bg-green-100 rounded-lg p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                Dominant Organizational Stage = {reportInfo.dominantStage} ({reportInfo.dominantStagePercentage}%)
              </h3>
              <p className="text-gray-800 leading-relaxed">
                {stageAnalysisDistribution.analysis}
              </p>
            </div>
          </div>

          {/* Visual Stage Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart */}
            {/* <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">
                Stage Distribution Visualization
              </h3>
              <div className="w-full h-80" data-chart-id="stageAnalysisBar">
                <ResponsiveBar
                  data={stageDistribution.map((stage) => ({
                    stage: stage.stage,
                    employees: stage.employeeCount,
                    percentage: stage.percentage,
                    score: stage.avgStageScore,
                  }))}
                  keys={["employees"]}
                  indexBy="stage"
                  margin={{ top: 50, right: 60, bottom: 80, left: 60 }}
                  padding={0.3}
                  valueScale={{ type: "linear" }}
                  indexScale={{ type: "band", round: true }}
                  colors={({ data }) => {
                    const stageData = stageDistribution.find(s => s.stage === data.stage);
                    return stageData ? stageData.color : "#94a3b8";
                  }}
                  borderColor={{
                    from: "color",
                    modifiers: [["darker", 1.6]],
                  }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: "Behavioral Stages",
                    legendPosition: "middle",
                    legendOffset: 60,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Number of Employees",
                    legendPosition: "middle",
                    legendOffset: -40,
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{
                    from: "color",
                    modifiers: [["darker", 1.6]],
                  }}
                  animate={true}
                  motionConfig="gentle"
                />
              </div>
            </div> */}

            {/* Stage Score Analysis */}
            {/* <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">
                Stage Score Analysis
              </h3>
              {stageDistribution.map((stage, index) => (
                <div
                  key={stage.stage}
                  className={`rounded-lg p-4 shadow-sm border ${index === 0
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-slate-200"
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      ></div>
                      <h4 className="font-semibold text-slate-800">{stage.stage}</h4>
                      {index === 0 && (
                        <span className="bg-green-200 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          Dominant
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-700">
                        {stage.avgStageScore}
                      </div>
                      <div className="text-xs text-slate-500">Avg Score</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                    <span>{stage.employeeCount} employees</span>
                    <span className="font-medium">{stage.percentage}% of workforce</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${stage.percentage}%`,
                        backgroundColor: stage.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div> */}
          </div>
        </section>

        {/* Stage Analysis */}
        <section className="p-6 bg-emerald-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-6">
            {stageAnalysis.title} - {stageAnalysis.stage} Stage
          </h2>

          {/* Introduction */}
          <div className="mb-8">
            {stageAnalysis.introduction.map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Understanding Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-emerald-700 mb-4">
              Understanding of {stageAnalysis.stage} Stage
            </h3>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-emerald-100">
              <div className="space-y-4">
                {stageAnalysis.understanding.description.map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Stage Characteristics */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-emerald-700 mb-6">
              {stageAnalysis.stageCharacteristics.title}
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Defining Features */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-emerald-100">
                <h4 className="text-lg font-semibold text-emerald-700 mb-4">
                  {stageAnalysis.stageCharacteristics.definingFeatures.title}
                </h4>
                <ul className="space-y-3">
                  {stageAnalysis.stageCharacteristics.definingFeatures.items.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0"></div>
                      <p className="text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Behavioral Indicators */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-emerald-100">
                <h4 className="text-lg font-semibold text-emerald-700 mb-4">
                  {stageAnalysis.stageCharacteristics.behavioralIndicators.title}
                </h4>
                <ul className="space-y-3">
                  {stageAnalysis.stageCharacteristics.behavioralIndicators.items.map((indicator, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0"></div>
                      <p className="text-gray-700">{indicator}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Visual Summary */}
          {/* <div className="bg-emerald-100 rounded-lg p-6 border-l-4 border-emerald-500">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{stageAnalysis.stage.charAt(0)}</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-emerald-800">{stageAnalysis.stage} Stage Summary</h4>
                <p className="text-emerald-700 text-sm">Dominant organizational behavioral state</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-600">98</div>
                <div className="text-sm text-emerald-700">Employees</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-600">62.8%</div>
                <div className="text-sm text-emerald-700">of Workforce</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-600">4.48</div>
                <div className="text-sm text-emerald-700">Avg Stage Score</div>
              </div>
            </div>
          </div> */}
        </section>

        {/* Sub-Stage Analysis */}
        <section className="p-6 bg-amber-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-amber-700 mb-6">
            {stageAnalysis.subStageAnalysis.title} within {reportInfo.dominantStage} stage
          </h2>

          {/* Introduction */}
          <div className="mb-6">
            {stageAnalysis.subStageAnalysis.introduction.map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Sub-Stage Distribution Table */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-amber-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-amber-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-800">{reportInfo.dominantStage} Sub-Stage</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-amber-800">Employees</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-amber-800">% of {reportInfo.dominantStage} Stage</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-amber-800">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200">
                  {stageAnalysis.subStageAnalysis.subStageDistribution.map((subStage, index) => (
                    <tr key={subStage.subStage} className={index === 0 ? "bg-amber-50" : "hover:bg-amber-25"}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subStage.color }}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">{subStage.subStage}</span>
                          {index === 0 && (
                            <span className="bg-amber-200 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
                              Predominant
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">
                        {subStage.employees}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">
                        {subStage.percentageOfHoneymoon}%
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">
                        {subStage.avgScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Predominant Sub-Stage Highlight */}
          <div className="mb-8">
            <div className="bg-white rounded-lg p-6 border-l-4 border-blue-500">
              <h4 className="text-lg font-semibold text-blue-800 mb-3">
                Predominant Sub-Stage = "{stageAnalysis.subStageAnalysis.predominantSubStage}"
              </h4>
              {stageAnalysis.subStageAnalysis.overallInsight.map((paragraph, index) => (
                <p key={index} className="text-gray-800 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Detailed Sub-Stage Analysis */}
          <div className="space-y-8">
            {/* Excitement & Optimism */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-amber-500">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-amber-800">
                  {stageAnalysis.subStageAnalysis.detailedAnalysis.excitementOptimism.title}
                </h4>
                {stageAnalysis.subStageAnalysis.detailedAnalysis.excitementOptimism.subtitle && (
                  <p className="text-sm text-amber-600 font-medium mt-1">
                    {stageAnalysis.subStageAnalysis.detailedAnalysis.excitementOptimism.subtitle}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  {stageAnalysis.subStageAnalysis.detailedAnalysis.excitementOptimism.percentage} of {stageAnalysis.stage} Stage
                </p>
              </div>
              <div className="space-y-4 mb-6">
                {stageAnalysis.subStageAnalysis.detailedAnalysis.excitementOptimism.description.map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="bg-amber-100 rounded-lg p-4 border-l-4 border-amber-400">
                <h5 className="font-semibold text-amber-800 mb-2">Organizational Implication:</h5>
                <p className="text-gray-700 leading-relaxed">
                  {stageAnalysis.subStageAnalysis.detailedAnalysis.excitementOptimism.organizationalImplication}
                </p>
              </div>
            </div>

            {/* Confidence & Over-Reliance */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-100">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-blue-700">
                  {stageAnalysis.subStageAnalysis.detailedAnalysis.confidenceOverReliance.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {stageAnalysis.subStageAnalysis.detailedAnalysis.confidenceOverReliance.percentage} of {stageAnalysis.stage} Stage
                </p>
              </div>
              <div className="space-y-4 mb-6">
                {stageAnalysis.subStageAnalysis.detailedAnalysis.confidenceOverReliance.description.map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                <h5 className="font-semibold text-blue-800 mb-2">Organizational Implication:</h5>
                <p className="text-gray-700 leading-relaxed">
                  {stageAnalysis.subStageAnalysis.detailedAnalysis.confidenceOverReliance.organizationalImplication}
                </p>
              </div>
            </div>

            {/* Initial Reality Check */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-amber-100">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-amber-700">
                  {stageAnalysis.subStageAnalysis.detailedAnalysis.initialRealityCheck.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {stageAnalysis.subStageAnalysis.detailedAnalysis.initialRealityCheck.percentage} of {stageAnalysis.stage} Stage
                </p>
              </div>
              <div className="space-y-4 mb-6">
                {stageAnalysis.subStageAnalysis.detailedAnalysis.initialRealityCheck.description.map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-400">
                <h5 className="font-semibold text-amber-800 mb-2">Organizational Implication:</h5>
                <p className="text-gray-700 leading-relaxed">
                  {stageAnalysis.subStageAnalysis.detailedAnalysis.initialRealityCheck.organizationalImplication}
                </p>
              </div>
            </div>

            {/* Sustained Confidence with Complacency */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-red-100">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-red-700">
                  {stageAnalysis.subStageAnalysis.detailedAnalysis.sustainedConfidenceComplacency.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {stageAnalysis.subStageAnalysis.detailedAnalysis.sustainedConfidenceComplacency.percentage} of {stageAnalysis.stage} Stage
                </p>
              </div>
              <div className="space-y-4 mb-6">
                {stageAnalysis.subStageAnalysis.detailedAnalysis.sustainedConfidenceComplacency.description.map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
                <h5 className="font-semibold text-red-800 mb-2">Organizational Implication:</h5>
                <p className="text-gray-700 leading-relaxed">
                  {stageAnalysis.subStageAnalysis.detailedAnalysis.sustainedConfidenceComplacency.organizationalImplication}
                </p>
              </div>
            </div>
          </div>

          {/* Integration Insight */}
          <div className="mt-8">
            <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
              <h4 className="text-xl font-semibold text-amber-800 mb-4">
                {stageAnalysis.subStageAnalysis.integrationInsight.title}
              </h4>
              <div className="space-y-4 mb-6">
                {stageAnalysis.subStageAnalysis.integrationInsight.description.map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {stageAnalysis.subStageAnalysis.integrationInsight.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-3 bg-white rounded-lg p-4">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 shrink-0"></div>
                    <p className="text-gray-700 text-sm">{point}</p>
                  </div>
                ))}
              </div>

              <div className="bg-amber-100 rounded-lg p-4 border-l-4 border-amber-500">
                <p className="text-amber-800 leading-relaxed font-medium">
                  {stageAnalysis.subStageAnalysis.integrationInsight.conclusion}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Department Breakdown */}
        <section className="p-6 bg-rose-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-rose-700 mb-6">
            Department-wise Analysis
          </h2>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-rose-700 mb-4">
              Department Health Scores
            </h3>
            <div className="w-full h-80" data-chart-id="departmentHealthRadial">
              <ResponsiveRadialBar
                data={departmentBreakdown.map((dept) => ({
                  id: dept.department,
                  data: [
                    {
                      x: "Health Score",
                      y: dept.healthScore,
                    },
                  ],
                }))}
                valueFormat=">-.2f"
                padding={0.4}
                cornerRadius={2}
                margin={{ top: 40, right: 120, bottom: 40, left: 40 }}
                radialAxisStart={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
                circularAxisOuter={{ tickSize: 5, tickPadding: 12, tickRotation: 0 }}
                colors={(bar) => {
                  // Use a predefined color palette that cycles through different colors
                  const colorPalette = [
                    "#e74c3c", "#3498db", "#9b59b6", "#f39c12", "#2ecc71", 
                    "#e67e22", "#1abc9c", "#34495e", "#f1c40f", "#e91e63",
                    "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#00bcd4",
                    "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107"
                  ];
                  
                  const index = departmentBreakdown.findIndex(dept => dept.department === bar.id);
                  return colorPalette[index % colorPalette.length];
                }}
                borderColor={{
                  from: "color",
                  modifiers: [["darker", 0.8]],
                }}
                enableTracks={true}
                tracksColor="#f0f0f0"
                enableRadialGrid={true}
                enableCircularGrid={true}
                motionConfig="wobbly"
                legends={[
                  {
                    anchor: "right",
                    direction: "column",
                    justify: false,
                    translateX: 80,
                    translateY: 0,
                    itemsSpacing: 6,
                    itemDirection: "left-to-right",
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: "#999",
                    symbolSize: 18,
                    symbolShape: "square",
                    effects: [
                      {
                        on: "hover",
                        style: {
                          itemTextColor: "#000",
                        },
                      },
                    ],
                  },
                ]}
              />
            </div>
          </div>

          {/* Department Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departmentBreakdown.map((dept) => (
              <div
                key={dept.department}
                className="bg-white rounded-lg p-6 shadow-sm border border-rose-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">{dept.department}</h4>
                  <div className="text-right">
                    <div className="text-xl font-bold text-rose-600">
                      {dept.healthScore}
                    </div>
                    <div className="text-xs text-gray-500">Health Score</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Employees</span>
                    <span>{dept.employeeCount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>Dominant Stage</span>
                    <span className="font-medium text-rose-700">{dept.dominantStage}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(dept.healthScore / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-xs text-gray-600">
                  <div className="mb-2">
                    <span className="font-medium">Interpretation:</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {dept.interpretation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Departmental Insights */}
        <section className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-6">
            {keyDepartmentalInsights.title}
          </h2>

          <div className="space-y-8">
            {keyDepartmentalInsights.insights.map((insight, index) => (
              <div key={insight.department} className="bg-white rounded-lg p-6 shadow-sm border border-indigo-100">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-800">{insight.department}</h3>
                    <p className="text-sm text-indigo-600">{insight.title}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {insight.analysis.map((point, pointIndex) => (
                    <div key={pointIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 shrink-0"></div>
                      <p className="text-gray-700 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SWOT Analysis */}
        <section className="p-6 bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-slate-700 mb-8 text-center">
            {swotAnalysis.title}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Strengths */}
            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  S
                </div>
                <h3 className="text-xl font-semibold text-green-700">Strengths</h3>
              </div>
              <ul className="space-y-3">
                {swotAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">{strength}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  W
                </div>
                <h3 className="text-xl font-semibold text-red-700">Weaknesses</h3>
              </div>
              <ul className="space-y-3">
                {swotAnalysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">{weakness}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  O
                </div>
                <h3 className="text-xl font-semibold text-blue-700">Opportunities</h3>
              </div>
              <ul className="space-y-3">
                {swotAnalysis.opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">{opportunity}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-orange-500">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  T
                </div>
                <h3 className="text-xl font-semibold text-orange-700">Threats</h3>
              </div>
              <ul className="space-y-3">
                {swotAnalysis.threats.map((threat, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">{threat}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Recommendations */}
        <section className="p-6 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-8 text-center">
            {recommendations.title}
          </h2>

          <div className="space-y-6">
            {recommendations.items.map((recommendation) => (
              <div key={recommendation.id} className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-emerald-500 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {recommendation.id}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-emerald-800 mb-3">
                      {recommendation.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {recommendation.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Plan */}
        <section className="p-6 bg-linear-to-br from-violet-50 to-purple-100 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-violet-700 mb-8 text-center">
            {actionPlan.title}
          </h2>

          {/* Phase Details */}
          <div className="space-y-8">
            {actionPlan.phases.map((phase) => (
              <div key={phase.id} className="bg-white rounded-lg p-6 shadow-sm border-l-4" style={{ borderLeftColor: phase.color }}>
                <div className="flex items-start space-x-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ backgroundColor: phase.color }}
                  >
                    {phase.id}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {phase.title}
                      </h3>
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: phase.color }}
                      >
                        {phase.duration}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {phase.actions.map((action, actionIndex) => (
                        <div key={actionIndex} className="flex items-start space-x-3">
                          <div
                            className="w-2 h-2 rounded-full mt-2 shrink-0"
                            style={{ backgroundColor: phase.color }}
                          ></div>
                          <p className="text-gray-700 leading-relaxed">{action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conclusion */}
        <section className="p-6 bg-linear-to-br from-gray-50 to-slate-100 rounded-2xl shadow-inner border-2 border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            {conclusion.title}
          </h2>

          {/* Main Conclusion Text */}
          <div className="mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <p className="text-gray-700 leading-relaxed text-lg">
                {conclusion.mainText}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrganizationHealthReport;