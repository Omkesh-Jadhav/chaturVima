import React, { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ResponsiveChord } from "@nivo/chord";
import { ResponsiveAreaBump } from "@nivo/bump";
import { ResponsiveStream } from "@nivo/stream";
import { ResponsiveSwarmPlot } from "@nivo/swarmplot";
import { ResponsiveCirclePacking } from "@nivo/circle-packing";
import { ResponsiveRadialBar } from "@nivo/radial-bar";
import { ResponsivePie } from "@nivo/pie";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { ResponsiveRadar } from "@nivo/radar";
import assessmentData from "@/data/assessmentReportData.json";
import { InteractiveMindMap } from "@/components/assessment";
import AssessmentReportPdf from "./AssessmentReportPdf";
import { getStagePieColor } from "@/utils/assessmentConfig";
import { PIE_GRADIENTS, PIE_FILL } from "@/components/assessmentDashboard";
import { pieChartTheme } from "@/components/assessmentDashboard/pieChartTheme";



// Questionnaire display name mapping
const QUESTIONNAIRE_DISPLAY_NAMES: Record<string, string> = {
  Self: "Employee Self Assessment",
  SELF: "Employee Self Assessment",
  Boss: "Manager Relationship Assessment",
  BOSS: "Manager Relationship Assessment",
  Department: "Department Assessment",
  DEPT: "Department Assessment",
  "4D": "Department Assessment",
  Company: "Company Assessment",
};

const mapQuestionnaireToDisplayName = (questionnaire: string): string => {
  return QUESTIONNAIRE_DISPLAY_NAMES[questionnaire] || questionnaire;
};

const AssessmentReport: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const selectedQuestionnaire = searchParams.get('questionnaire');

  // Get display name for selected questionnaire
  const questionnaireDisplayName = selectedQuestionnaire 
    ? mapQuestionnaireToDisplayName(selectedQuestionnaire)
    : "Overall Assessment";

  // Assessment Data from JSON
  const overviewText = assessmentData.overview.text;
  const interpretationText = assessmentData.interpretation.stageInterpretation;
  const distributionData = assessmentData.interpretation.distribution;
  
  // Get the dominant stage (first item in distribution array)
  const dominantStageData = distributionData[0];
  const mainStage = dominantStageData.stage;
  const mainStageScore = dominantStageData.score;
  const employeeStageDescription = assessmentData.interpretation.employeeStageDescription;
  const stageDescription = assessmentData.interpretation.dominantStageDescription;
  const subStageScoresSummary = dominantStageData.subStageSummary;
  const subStageScoresData = dominantStageData.subStageDetails;
  const strengths = assessmentData.swot.strengths;
  const weaknesses = assessmentData.swot.weaknesses;
  const opportunities = assessmentData.swot.opportunities;
  const threats = assessmentData.swot.threats;
  const actionPlan = assessmentData.actionPlan.categories;
  const recommendations = assessmentData.recommendations;

  // Stage Transition Flow Data
  const transitionFlowData = assessmentData.transitionFlow.data;
  const transitionStats = assessmentData.transitionFlow.stats;

  // Predictive Trends Data (Next 90 Days)
  const generatePredictiveData = () => {
    const baseValues = [20, 30, 25, 25]; // Starting percentages
    const data = [];

    const startDate = new Date();
    for (let i = 0; i <= 90; i += 7) {
      // Weekly data points
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const dataPoint = {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        day: i,
        Honeymoon: Math.max(
          5,
          baseValues[0] + Math.sin(i * 0.1) * 3 + Math.random() * 2 - 1
        ),
        "Self-Reflection": Math.max(
          15,
          baseValues[1] + Math.cos(i * 0.08) * 2 + Math.random() * 2 - 1
        ),
        "Soul-searching": Math.max(
          10,
          baseValues[2] + Math.sin(i * 0.12) * 2.5 + Math.random() * 2 - 1
        ),
        "Steady State": Math.max(
          15,
          baseValues[3] + Math.cos(i * 0.09) * 1.5 + Math.random() * 2 - 1
        ),
      };
      data.push(dataPoint);
    }
    return data;
  };

  const predictiveData = generatePredictiveData();

  const predictionMetrics = assessmentData.predictive.metrics;

  // Chord Diagram Data - Stage Relationships
  const chordData = assessmentData.chord.data;
  const chordKeys = assessmentData.chord.keys;

  // Area Bump Chart Data - Stage Rankings Over Time
  const areaBumpData = assessmentData.areaBump.data;

  // Stream Chart Data - Employee Flow Over Time
  const streamData = assessmentData.stream.data;

  // SwarmPlot Data - Individual Employee Distribution
  const swarmPlotData = assessmentData.swarmPlot.data;

  // Circle Packing Data - Skill Hierarchies
  const circlePackingData = assessmentData.circlePacking.data;


  return (
    <div className="bg-linear-to-br from-indigo-50 to-purple-100 min-h-screen flex flex-col items-center p-8">
      <div
        ref={reportRef}
        className="bg-white shadow-2xl rounded-3xl max-w-4xl w-full p-10 space-y-10"
      >
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">
            {questionnaireDisplayName} Report
          </h1>
          <p className="text-gray-600">
            Employee: <strong>{assessmentData.employee.name}</strong> |
            Department: {assessmentData.employee.department} | Assessment Date:{" "}
            {new Date().toLocaleDateString()}
          </p>
          {selectedQuestionnaire && (
            <div className="mt-2 inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              {questionnaireDisplayName}
            </div>
          )}
        </header>

        {/* Overview */}
        <section className="p-6 bg-indigo-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
            1. Overview
          </h2>
          <div className="space-y-4">
            {overviewText.map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Interpretation */}
        <section className="p-6 bg-purple-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">
            2. Interpretation
          </h2>
          <div className="space-y-4">
            {interpretationText.map((paragraph, index) => (
              <p className="text-gray-700 leading-relaxed" key={index}>
                {paragraph}
              </p>
            ))}
          </div>

          {/* Stage Distribution Aura */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-purple-700 mb-6">
              Stage Distribution Aura
            </h3>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
              <div className="flex items-center justify-between">
                {/* Pie Chart Container */}
                <div className="flex-1 h-80 relative">
                  <ResponsivePie
                    data={distributionData.map((item) => ({
                      id: item.stage,
                      label: item.stage,
                      value: item.scorePercentage,
                    }))}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    innerRadius={0.65}
                    padAngle={2}
                    cornerRadius={6}
                    activeOuterRadiusOffset={10}
                    colors={(d: { id: string; label: string; value: number }) => getStagePieColor(d.label)}
                    enableArcLinkLabels={false}
                    arcLabelsSkipAngle={10}
                    arcLabel={(d: { id: string; label: string; value: number }) => `${d.value}%`}
                    arcLabelsTextColor={{
                      from: "color",
                      modifiers: [["darker", 2.2]],
                    }}
                    arcLabelsRadiusOffset={0.55}
                    defs={PIE_GRADIENTS}
                    fill={PIE_FILL}
                    theme={pieChartTheme}
                    animate
                    motionConfig="gentle"
                    onMouseEnter={() => {}}
                    onMouseLeave={() => {}}
                  />

                  {/* Human Figure Overlay - Centered */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg width="160" height="160" viewBox="0 0 154 154">
                        <defs>
                          <filter id="strongGlow">
                            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>

                          {/* Dynamic holographic gradient for human figure based on data */}
                          <linearGradient
                            id="holoGradient"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            {distributionData.map((item, index) => {
                              const cumulativePercentage = distributionData
                                .slice(0, index + 1)
                                .reduce((sum, d) => sum + d.scorePercentage, 0);
                              return (
                                <stop
                                  key={index}
                                  offset={`${cumulativePercentage}%`}
                                  stopColor={getStagePieColor(item.stage)}
                                  stopOpacity="0.8"
                                />
                              );
                            })}
                          </linearGradient>
                        </defs>

                        <g transform="translate(77, 77)" filter="url(#strongGlow)">
                          <g transform="translate(-77, -77) scale(0.7)">
                            <path
                              d="M104.265,117.959c-0.304,3.58,2.126,22.529,3.38,29.959c0.597,3.52,2.234,9.255,1.645,12.3
                            c-0.841,4.244-1.084,9.736-0.621,12.934c0.292,1.942,1.211,10.899-0.104,14.175c-0.688,1.718-1.949,10.522-1.949,10.522
                            c-3.285,8.294-1.431,7.886-1.431,7.886c1.017,1.248,2.759,0.098,2.759,0.098c1.327,0.846,2.246-0.201,2.246-0.201
                            c1.139,0.943,2.467-0.116,2.467-0.116c1.431,0.743,2.758-0.627,2.758-0.627c0.822,0.414,1.023-0.109,1.023-0.109
                            c2.466-0.158-1.376-8.05-1.376-8.05c-0.92-7.088,0.913-11.033,0.913-11.033c6.004-17.805,6.309-22.53,3.909-29.24
                            c-0.676-1.937-0.847-2.704-0.536-3.545c0.719-1.941,0.195-9.748,1.072-12.848c1.692-5.979,3.361-21.142,4.231-28.217
                            c1.169-9.53-4.141-22.308-4.141-22.308c-1.163-5.2,0.542-23.727,0.542-23.727c2.381,3.705,2.29,10.245,2.29,10.245
                            c-0.378,6.859,5.541,17.342,5.541,17.342c2.844,4.332,3.921,8.442,3.921,8.747c0,1.248-0.273,4.269-0.273,4.269l0.109,2.631
                            c0.049,0.67,0.426,2.977,0.365,4.092c-0.444,6.862,0.646,5.571,0.646,5.571c0.92,0,1.931-5.522,1.931-5.522
                            c0,1.424-0.348,5.687,0.42,7.295c0.919,1.918,1.595-0.329,1.607-0.78c0.243-8.737,0.768-6.448,0.768-6.448
                            c0.511,7.088,1.139,8.689,2.265,8.135c0.853-0.407,0.073-8.506,0.073-8.506c1.461,4.811,2.569,5.577,2.569,5.577
                            c2.411,1.693,0.92-2.983,0.585-3.909c-1.784-4.92-1.839-6.625-1.839-6.625c2.229,4.421,3.909,4.257,3.909,4.257
                            c2.174-0.694-1.9-6.954-4.287-9.953c-1.218-1.528-2.789-3.574-3.245-4.789c-0.743-2.058-1.304-8.674-1.304-8.674
                            c-0.225-7.807-2.155-11.198-2.155-11.198c-3.3-5.282-3.921-15.135-3.921-15.135l-0.146-16.635
                            c-1.157-11.347-9.518-11.429-9.518-11.429c-8.451-1.258-9.627-3.988-9.627-3.988c-1.79-2.576-0.767-7.514-0.767-7.514
                            c1.485-1.208,2.058-4.415,2.058-4.415c2.466-1.891,2.345-4.658,1.206-4.628c-0.914,0.024-0.707-0.733-0.707-0.733
                            C115.068,0.636,104.01,0,104.01,0h-1.688c0,0-11.063,0.636-9.523,13.089c0,0,0.207,0.758-0.715,0.733
                            c-1.136-0.03-1.242,2.737,1.215,4.628c0,0,0.572,3.206,2.058,4.415c0,0,1.023,4.938-0.767,7.514c0,0-1.172,2.73-9.627,3.988
                            c0,0-8.375,0.082-9.514,11.429l-0.158,16.635c0,0-0.609,9.853-3.922,15.135c0,0-1.921,3.392-2.143,11.198
                            c0,0-0.563,6.616-1.303,8.674c-0.451,1.209-2.021,3.255-3.249,4.789c-2.408,2.993-6.455,9.24-4.29,9.953
                            c0,0,1.689,0.164,3.909-4.257c0,0-0.046,1.693-1.827,6.625c-0.35,0.914-1.839,5.59,0.573,3.909c0,0,1.117-0.767,2.569-5.577
                            c0,0-0.779,8.099,0.088,8.506c1.133,0.555,1.751-1.047,2.262-8.135c0,0,0.524-2.289,0.767,6.448
                            c0.012,0.451,0.673,2.698,1.596,0.78c0.779-1.608,0.429-5.864,0.429-7.295c0,0,0.999,5.522,1.933,5.522
                            c0,0,1.099,1.291,0.648-5.571c-0.073-1.121,0.32-3.422,0.369-4.092l0.106-2.631c0,0-0.274-3.014-0.274-4.269
                            c0-0.311,1.078-4.415,3.921-8.747c0,0,5.913-10.488,5.532-17.342c0,0-0.082-6.54,2.299-10.245c0,0,1.69,18.526,0.545,23.727
                            c0,0-5.319,12.778-4.146,22.308c0.864,7.094,2.53,22.237,4.226,28.217c0.886,3.094,0.362,10.899,1.072,12.848
                            c0.32,0.847,0.152,1.627-0.536,3.545c-2.387,6.71-2.083,11.436,3.921,29.24c0,0,1.848,3.945,0.914,11.033
                            c0,0-3.836,7.892-1.379,8.05c0,0,0.192,0.523,1.023,0.109c0,0,1.327,1.37,2.761,0.627c0,0,1.328,1.06,2.463,0.116
                            c0,0,0.91,1.047,2.237,0.201c0,0,1.742,1.175,2.777-0.098c0,0,1.839,0.408-1.435-7.886c0,0-1.254-8.793-1.945-10.522
                            c-1.318-3.275-0.387-12.251-0.106-14.175c0.453-3.216,0.21-8.695-0.618-12.934c-0.606-3.038,1.035-8.774,1.641-12.3
                            c1.245-7.423,3.685-26.373,3.38-29.959l1.008,0.354C103.809,118.312,104.265,117.959,104.265,117.959z"
                              fill="url(#holoGradient)"
                              stroke="url(#holoGradient)"
                              strokeWidth="1"
                              opacity="0.9"
                            />
                          </g>
                        </g>
                      </svg>
                  </div>

                </div>

                {/* Legend on the Right */}
                <div className="ml-8 space-y-4 min-w-[200px]">
                  <h4 className="text-lg font-semibold text-purple-700 mb-4">Stage Legend</h4>
                  {distributionData.map((item) => (
                    <div
                      key={item.stage}
                      className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
                      onMouseEnter={() => {}}
                      onMouseLeave={() => {}}
                    >
                      <div
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: getStagePieColor(item.stage) }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-sm">{item.stage}</div>
                        <div className="text-xs text-gray-600">{item.level}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          {item.scorePercentage}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.score.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-96" data-chart-id="radialBar">
            <ResponsiveRadialBar
              data={distributionData.map((item) => ({
                id: item.stage,
                data: [{ x: item.stage, y: item.score }],
              }))}
              valueFormat=">-.2f"
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
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-purple-700 mb-6">
              Stage Distribution Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {distributionData.map((item, index) => (
                <div
                  key={item.stage}
                  className="bg-white rounded-lg p-4 shadow-sm border border-purple-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full ${index === 0
                          ? "bg-indigo-500"
                          : index === 1
                            ? "bg-purple-500"
                            : index === 2
                              ? "bg-cyan-500"
                              : "bg-green-500"
                          }`}
                      ></div>
                      <h4 className="font-semibold text-gray-800">{item.stage}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {item.scorePercentage}%
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {item.level}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.text}
                  </p>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${index === 0
                          ? "bg-indigo-500"
                          : index === 1
                            ? "bg-purple-500"
                            : index === 2
                              ? "bg-cyan-500"
                              : "bg-green-500"
                          }`}
                        style={{ width: `${item.scorePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Stage */}
        <section className="p-6 bg-pink-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-pink-700 mb-4">
            3. Main Stage Analysis - {mainStage}
          </h2>

          {/* Stage Score Display */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-pink-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-pink-700">Current Stage</h3>
                <p className="text-2xl font-bold text-pink-600">{mainStage}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Stage Score</p>
                <p className="text-3xl font-bold text-pink-600">{mainStageScore}</p>
              </div>
            </div>
          </div>

          {/* Employee Stage Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-pink-700 mb-3">Employee Assessment</h3>
            <div className="space-y-3">
              {employeeStageDescription.map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-pink-100">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Stage Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-pink-700 mb-3">Understanding the {mainStage} Stage</h3>
            <div className="space-y-4">
              {stageDescription.map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Sub-Stage Analysis */}
        <section className="p-6 bg-rose-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-rose-700 mb-4">
            4. Sub-Stage Analysis within {mainStage}
          </h2>

          {/* Summary Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-rose-700 mb-4">Summary</h3>
            <div className="space-y-3">
              {subStageScoresSummary.map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-rose-100">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Radar Chart */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-rose-700 mb-4">Performance Overview</h3>
            <div className="w-full h-80" data-chart-id="radar">
              <ResponsiveRadar
                data={subStageScoresData.map((item) => ({
                  subStage: item.subStage,
                  score: item.subStageScore,
                }))}
                keys={["score"]}
                indexBy="subStage"
                valueFormat=">-.2f"
                margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
                borderColor={{ from: "color" }}
                gridLevels={5}
                gridShape="circular"
                gridLabelOffset={36}
                enableDots={true}
                dotSize={10}
                dotColor={{ theme: "background" }}
                dotBorderWidth={2}
                dotBorderColor={{ from: "color" }}
                enableDotLabel={true}
                dotLabel="value"
                dotLabelYOffset={-12}
                colors={{ scheme: "nivo" }}
                fillOpacity={0.25}
                blendMode="multiply"
                animate={true}
                motionConfig="wobbly"
                isInteractive={true}
              />
            </div>
          </div>

          {/* Detailed Sub-Stage Analysis */}
          <div>
            <h3 className="text-lg font-semibold text-rose-700 mb-6">Detailed Analysis</h3>
            <div className="space-y-6">
              {subStageScoresData.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-rose-100">
                  {/* Sub-Stage Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-semibold text-rose-700">{item.subStage}</h4>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-rose-600">{item.subStageScore}</div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-rose-500 h-2 rounded-full"
                          style={{ width: `${item.subStageScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Stage Introduction */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed font-medium">{item.subStageIntro}</p>
                  </div>

                  {/* Sub-Stage Description */}
                  <div className="mb-4">
                    <ul className="space-y-2">
                      {item.subStageDescription.map((desc, descIndex) => (
                        <li key={descIndex} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-rose-400 rounded-full mt-2 shrink-0"></div>
                          <p className="text-gray-600 leading-relaxed">{desc}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sub-Stage Conclusion */}
                  <div className="bg-rose-50 p-4 rounded-lg border-l-4 border-rose-400">
                    <p className="text-gray-700 leading-relaxed italic">{item.subStageConclusion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SWOT Analysis */}
        <section className="p-6 bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-inner space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-indigo-800 mb-2">
              5. SWOT Analysis
            </h2>
            <p className="text-indigo-600">Strategic Assessment Overview</p>
          </div>

          {/* Interactive SWOT Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths Quadrant */}
            <div className="bg-linear-to-br from-green-50 to-emerald-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg mr-4">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-800">Strengths</h3>
                  <p className="text-green-600 text-sm">Internal Positive Factors</p>
                </div>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {strengths.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-500">
                    <div className="flex items-start justify-between mb-2">
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                        #{i + 1}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">{item.title}</h4>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">{item.text}</p>
                    <div className="space-y-2">
                      <div className="bg-green-50 p-2 rounded-lg">
                        <p className="text-xs text-green-800">
                          <span className="font-semibold">Impact:</span> {item.whyMatters}
                        </p>
                      </div>
                      <div className="bg-green-100 p-2 rounded-lg">
                        <p className="text-xs text-green-900">
                          <span className="font-semibold">Action:</span> {item.actionableInsight}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses Quadrant */}
            <div className="bg-linear-to-br from-red-50 to-rose-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg mr-4">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-800">Weaknesses</h3>
                  <p className="text-red-600 text-sm">Internal Areas for Improvement</p>
                </div>

              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {weaknesses.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-red-500">
                    <div className="flex items-start justify-between mb-2">
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                        #{i + 1}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">{item.title}</h4>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">{item.text}</p>
                    <div className="space-y-2">
                      <div className="bg-red-50 p-2 rounded-lg">
                        <p className="text-xs text-red-800">
                          <span className="font-semibold">Risk:</span> {item.whyMatters}
                        </p>
                      </div>
                      <div className="bg-red-100 p-2 rounded-lg">
                        <p className="text-xs text-red-900">
                          <span className="font-semibold">Solution:</span> {item.actionableInsight}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities Quadrant */}
            <div className="bg-linear-to-br from-blue-50 to-cyan-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg mr-4">
                  <span className="text-white font-bold text-lg">O</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-800">Opportunities</h3>
                  <p className="text-blue-600 text-sm">External Growth Potential</p>
                </div>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {opportunities.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500">
                    <div className="flex items-start justify-between mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                        #{i + 1}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">{item.title}</h4>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">{item.text}</p>
                    <div className="space-y-2">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <p className="text-xs text-blue-800">
                          <span className="font-semibold">Value:</span> {item.whyMatters}
                        </p>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <p className="text-xs text-blue-900">
                          <span className="font-semibold">Strategy:</span> {item.actionableInsight}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Threats Quadrant */}
            <div className="bg-linear-to-br from-yellow-50 to-amber-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center shadow-lg mr-4">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-800">Threats</h3>
                  <p className="text-yellow-600 text-sm">External Risk Factors</p>
                </div>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {threats.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-yellow-500">
                    <div className="flex items-start justify-between mb-2">
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                        #{i + 1}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">{item.title}</h4>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">{item.text}</p>
                    <div className="space-y-2">
                      <div className="bg-yellow-50 p-2 rounded-lg">
                        <p className="text-xs text-yellow-800">
                          <span className="font-semibold">Concern:</span> {item.whyMatters}
                        </p>
                      </div>
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <p className="text-xs text-yellow-900">
                          <span className="font-semibold">Mitigation:</span> {item.actionableInsight}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SWOT Summary Insights */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Strategic Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{strengths.length}</div>
                <div className="text-sm text-green-800 font-medium">Core Strengths</div>
                <div className="text-xs text-green-600 mt-1">Build upon these</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-2xl font-bold text-red-600">{weaknesses.length}</div>
                <div className="text-sm text-red-800 font-medium">Key Weaknesses</div>
                <div className="text-xs text-red-600 mt-1">Address urgently</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{opportunities.length}</div>
                <div className="text-sm text-blue-800 font-medium">Growth Opportunities</div>
                <div className="text-xs text-blue-600 mt-1">Capitalize on these</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <div className="text-2xl font-bold text-yellow-600">{threats.length}</div>
                <div className="text-sm text-yellow-800 font-medium">Potential Threats</div>
                <div className="text-xs text-yellow-600 mt-1">Monitor closely</div>
              </div>
            </div>
          </div>
        </section>

        {/* Recommendations - Interactive Mind Map */}
        <section className="p-6 bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
            5. Recommendations
          </h2>
          <p className="text-gray-700 mb-6">
            {recommendations.recommendationsIntro}
          </p>

          {/* <div className="bg-white rounded-xl p-6 border border-indigo-200"> */}
          <InteractiveMindMap
            sections={recommendations.sections}
          />
          {/* </div> */}
        </section>

        {/* Action Plan - Radar Wheel */}
        <section className="p-6 bg-green-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">
            6. Action Plan
          </h2>
          <p className="text-gray-700 mb-1">
            Interactive radar wheel showing progress across 5 key development areas.
            Click on any segment to view detailed action items and recommendations.
          </p>

          <div className="space-y-1">
            {/* Radar Wheel */}
            <div className="flex flex-col items-center">
              <div className="relative w-[500px] h-[500px] mb-2">
                {/* Single SVG for all segments */}
                <svg className="w-full h-full" viewBox="0 0 500 500">
                  <defs>
                    {/* Gradients for each segment */}
                    <linearGradient id="gradient-0" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#B8860B" />
                    </linearGradient>
                    <linearGradient id="gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6A5ACD" />
                      <stop offset="100%" stopColor="#483D8B" />
                    </linearGradient>
                    <linearGradient id="gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF6347" />
                      <stop offset="100%" stopColor="#CD5C5C" />
                    </linearGradient>
                    <linearGradient id="gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF6347" />
                      <stop offset="100%" stopColor="#CD5C5C" />
                    </linearGradient>
                    <linearGradient id="gradient-4" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#20B2AA" />
                      <stop offset="100%" stopColor="#008B8B" />
                    </linearGradient>
                  </defs>

                  {/* Radar Segments */}
                  {actionPlan.map((category, index) => {
                    const startAngle = (index * 72) - 90; // 360/5 = 72 degrees between segments
                    const endAngle = startAngle + 72;

                    const startRadian = (startAngle * Math.PI) / 180;
                    const endRadian = (endAngle * Math.PI) / 180;

                    const outerRadius = 200;
                    const innerRadius = 80;
                    const centerX = 250;
                    const centerY = 250;

                    // Calculate arc path
                    const x1 = centerX + Math.cos(startRadian) * innerRadius;
                    const y1 = centerY + Math.sin(startRadian) * innerRadius;
                    const x2 = centerX + Math.cos(startRadian) * outerRadius;
                    const y2 = centerY + Math.sin(startRadian) * outerRadius;
                    const x3 = centerX + Math.cos(endRadian) * outerRadius;
                    const y3 = centerY + Math.sin(endRadian) * outerRadius;
                    const x4 = centerX + Math.cos(endRadian) * innerRadius;
                    const y4 = centerY + Math.sin(endRadian) * innerRadius;

                    const largeArcFlag = 0; // Since each segment is 72 degrees (< 180)

                    const pathData = [
                      `M ${x1} ${y1}`, // Move to start point (inner)
                      `L ${x2} ${y2}`, // Line to start point (outer)
                      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}`, // Arc along outer edge
                      `L ${x4} ${y4}`, // Line to end point (inner)
                      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`, // Arc along inner edge
                      'Z' // Close path
                    ].join(' ');

                    return (
                      <path
                        key={category.id}
                        d={pathData}
                        fill={`url(#gradient-${index})`}
                        stroke="white"
                        strokeWidth="2"
                        opacity={selectedSegment === null || selectedSegment === index ? "0.9" : "0.4"}
                        className="hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => setSelectedSegment(selectedSegment === index ? null : index)}
                      />
                    );
                  })}
                </svg>

                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full border-4 border-gray-200 flex items-center justify-center shadow-lg z-10">
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-800">Action</div>
                    <div className="text-xs font-bold text-gray-800">Plan</div>
                  </div>
                </div>

                {/* Category Names Inside Segments */}
                {actionPlan.map((category, index) => {
                  const angle = (index * 72) - 90 + 36; // Center of each segment
                  const radian = (angle * Math.PI) / 180;
                  const textRadius = 140; // Position text in the middle of each segment
                  const x = Math.cos(radian) * textRadius + 250;
                  const y = Math.sin(radian) * textRadius + 250;

                  return (
                    <div
                      key={`text-${category.id}`}
                      className="absolute pointer-events-none"
                      style={{
                        left: x,
                        top: y,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className="text-center max-w-32">
                        <div className="text-base font-bold text-white drop-shadow-lg leading-tight">
                          {category.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Detailed Action Items */}
            <div className="w-full">
              <h3 className="text-lg font-semibold text-green-700 mb-6 text-center">
                {selectedSegment !== null ? `${actionPlan[selectedSegment].title}` : 'Detailed Action Categories'}
              </h3>
              {selectedSegment !== null && (
                <div className="text-center mb-4">
                  <button
                    onClick={() => setSelectedSegment(null)}
                    className="text-sm text-green-600 hover:text-green-800 underline"
                  >
                    ← Show All Categories
                  </button>
                </div>
              )}
              <div className="grid gap-4">

                {(selectedSegment !== null ? [actionPlan[selectedSegment]] : actionPlan).map((category: any, index: number) => {
                  const actualIndex = selectedSegment !== null ? selectedSegment : index;
                  const colors = ['border-green-200 bg-green-50', 'border-blue-200 bg-blue-50', 'border-orange-200 bg-orange-50', 'border-red-200 bg-red-50', 'border-purple-200 bg-purple-50'];
                  const textColors = ['text-green-700', 'text-blue-700', 'text-orange-700', 'text-red-700', 'text-purple-700'];

                  return (
                    <div key={category.id} className={`border rounded-lg p-4 ${colors[actualIndex]}`}>
                      <div className="mb-2">
                        <h4 className={`font-semibold ${textColors[actualIndex]}`}>
                          {category.id}. {category.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {category.description}
                      </p>
                      <ul className="space-y-2">
                        {category.actions.map((action: { title: string; description: string }, actionIndex: number) => (
                          <li key={actionIndex} className="text-sm">
                            <div className="font-medium text-gray-800">
                              {actionIndex + 1}. {action.title}
                            </div>
                            <div className="text-gray-600 ml-4">
                              {action.description}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Interpretation */}
        <section className="p-6 bg-purple-100 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-purple-800 mb-4">
            7. Conclusion
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {assessmentData.detailedInterpretation.text}
          </p>
        </section>

        {/* 7. Stage Relationships - Chord Diagram */}
        <section className="p-6 bg-amber-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-amber-700 mb-4">
            7. Stage Relationships & Interactions
          </h2>
          <p className="text-gray-700 mb-6">
            This chord diagram visualizes the interconnections and transition
            patterns between different employee stages, showing the strength of
            relationships and flow dynamics.
          </p>

          <div className="bg-white rounded-xl p-4 border border-amber-200 mb-4">
            <div className="w-full h-96" data-chart-id="chord">
              <ResponsiveChord
                data={chordData}
                keys={chordKeys}
                margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
                valueFormat=".2f"
                padAngle={0.02}
                innerRadiusRatio={0.96}
                innerRadiusOffset={0.02}
                arcOpacity={1}
                arcBorderWidth={1}
                arcBorderColor={{
                  from: "color",
                  modifiers: [["darker", 0.4]],
                }}
                ribbonOpacity={0.5}
                ribbonBorderWidth={1}
                ribbonBorderColor={{
                  from: "color",
                  modifiers: [["darker", 0.4]],
                }}
                enableLabel={true}
                label="id"
                labelOffset={12}
                labelRotation={-90}
                labelTextColor={{
                  from: "color",
                  modifiers: [["darker", 1]],
                }}
                colors={{ scheme: "nivo" }}
                isInteractive={true}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-4 rounded-xl">
              <h4 className="font-semibold text-orange-700 mb-2">
                Understanding Connections
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Thicker ribbons indicate stronger stage relationships</li>
                <li>• Colors represent different employee stages</li>
              </ul>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl">
              <h4 className="font-semibold text-yellow-700 mb-2">
                Key Insights
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Hover over segments to see detailed connections</li>
                <li>• Identifies most common transition pathways</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 8. Stage Transition Flow */}
        <section className="p-6 bg-teal-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-teal-700 mb-4">
            8. Stage Transition Flow
          </h2>
          <p className="text-gray-700 mb-6">
            This visualization shows how employees move between different stages
            over time, providing insights into career progression patterns and
            development trajectories.
          </p>

          {/* Statistics Overview */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-teal-200">
              <div className="text-sm text-gray-600">
                High-intensity stage transitions
              </div>
              <div className="text-2xl font-bold text-teal-700">
                {transitionStats.highIntensity}%
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-teal-200">
              <div className="text-sm text-gray-600">
                Low-intensity stage transitions
              </div>
              <div className="text-2xl font-bold text-teal-700">
                {transitionStats.lowIntensity}%
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-teal-200">
              <div className="text-sm text-gray-600">
                Employee count shown making this transition
              </div>
              <div className="text-2xl font-bold text-teal-700">
                {transitionStats.employeeCount}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-teal-200">
              <div className="text-sm text-gray-600">
                Percentage relative to their transitions from source stage
              </div>
              <div className="text-2xl font-bold text-teal-700">
                {transitionStats.transitionCount}
              </div>
            </div>
          </div>

          {/* Transition Flow Visualization */}
          <div className="space-y-4">
            {transitionFlowData.map((stageData, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 border border-gray-200"
              >
                {/* Stage Header */}
                <div className="flex items-center mb-3">
                  <div
                    className="w-6 h-6 rounded-full mr-3"
                    style={{ backgroundColor: stageData.stageColor }}
                  ></div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {stageData.stage}
                  </h3>
                  <span className="ml-2 text-sm text-gray-500">
                    Stage {index + 1}
                  </span>
                </div>

                {/* Transition Bars */}
                <div className="space-y-2">
                  {stageData.transitions.map((transition, transIndex) => (
                    <div key={transIndex} className="flex items-center">
                      <div className="w-24 text-sm text-gray-600 shrink-0">
                        {transition.to}
                      </div>
                      <div className="flex-1 mx-3">
                        <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${transition.percentage}%`,
                              backgroundColor: stageData.stageColor,
                              opacity: 0.8,
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                            {transition.percentage}%
                          </div>
                        </div>
                      </div>
                      <div className="w-8 text-sm text-gray-600 text-right">
                        {transition.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Understanding Section */}
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="font-semibold text-blue-700 mb-2">
                Understanding Transition Flow
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  • High-intensity color indicates strong transition flow
                  (&gt;30%)
                </li>
                <li>
                  • Employee count shows number of people making this transition
                </li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <h4 className="font-semibold text-green-700 mb-2">
                Key Insights
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  • Low-intensity color indicates weak transition flow (&lt;30%)
                </li>
                <li>
                  • Percentage relative to their transitions from source stage
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 9. Predictive Trends */}
        <section className="p-6 bg-violet-50 rounded-2xl shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-violet-700">
              9. Predictive Trends (Next 90 Days)
            </h2>
            <div className="flex items-center text-sm text-violet-600">
              <span className="mr-2">🔮</span>
              <span>Forecast Active</span>
            </div>
          </div>

          <p className="text-gray-700 mb-6">
            AI-powered projection based on current trajectory. Forecasts
            employee stage distribution patterns for strategic workforce
            planning.
          </p>

          {/* Prediction Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-3 rounded-lg border border-violet-200 text-center">
              <div className="text-lg font-bold text-violet-700">
                {predictionMetrics.forecastAccuracy}%
              </div>
              <div className="text-xs text-gray-600">Forecast Accuracy</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-violet-200 text-center">
              <div className="text-lg font-bold text-violet-700">
                {predictionMetrics.confidenceInterval}%
              </div>
              <div className="text-xs text-gray-600">Confidence Interval</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-violet-200 text-center">
              <div className="text-lg font-bold text-violet-700">
                {predictionMetrics.dataPoints}
              </div>
              <div className="text-xs text-gray-600">Data Points</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-violet-200 text-center">
              <div className="text-lg font-bold text-violet-700">90</div>
              <div className="text-xs text-gray-600">Days Forecast</div>
            </div>
          </div>

          {/* Predictive Chart */}
          <div className="bg-white rounded-xl p-4 border border-violet-200 mb-6">
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictiveData}>
                  <defs>
                    <linearGradient id="honeymoon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#FFD700"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="selfReflection"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6A5ACD" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#6A5ACD"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="soulSearching"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#FF6347" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#FF6347"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="readyState" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#20B2AA" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#20B2AA"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="#6B7280"
                  />
                  <YAxis
                    label={{
                      value: "Percentage (%)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                    tick={{ fontSize: 12 }}
                    stroke="#6B7280"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #D1D5DB",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Honeymoon"
                    stackId="1"
                    stroke="#FFD700"
                    fill="url(#honeymoon)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Self-Reflection"
                    stackId="1"
                    stroke="#6A5ACD"
                    fill="url(#selfReflection)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Soul-searching"
                    stackId="1"
                    stroke="#FF6347"
                    fill="url(#soulSearching)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Steady State"
                    stackId="1"
                    stroke="#20B2AA"
                    fill="url(#readyState)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center mt-4 space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                <span className="text-sm text-gray-700">Honeymoon</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <span className="text-sm text-gray-700">Self-Reflection</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></div>
                <span className="text-sm text-gray-700">Soul-searching</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                <span className="text-sm text-gray-700">Steady State</span>
              </div>
            </div>
          </div>

          {/* Prediction Model Info */}
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <h4 className="font-semibold text-purple-700 mb-2">
              🧠 Prediction Model: {predictionMetrics.modelType}
            </h4>
            <p className="text-sm text-gray-700">
              Based on last 90 days of data. Actual results may vary based on
              organizational changes, interventions, and external factors. Use
              as directional guidance, not absolute forecast.
            </p>
          </div>
        </section>

        {/* Stage Rankings Over Time - Area Bump Chart */}
        <section className="p-6 bg-emerald-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-4">
            10. Stage Rankings Over Time
          </h2>
          <p className="text-gray-700 mb-6">
            This area bump chart shows how different employee stages rank in
            prevalence over quarterly periods, revealing seasonal patterns and
            organizational trends.
          </p>

          <div className="bg-white rounded-xl p-4 border border-emerald-200 mb-4">
            <div className="w-full h-80" data-chart-id="areaBump">
              <ResponsiveAreaBump
                data={areaBumpData}
                margin={{ top: 40, right: 100, bottom: 40, left: 100 }}
                spacing={8}
                colors={{ scheme: "nivo" }}
                blendMode="multiply"
                defs={[
                  {
                    id: "dots",
                    type: "patternDots",
                    background: "inherit",
                    color: "#38bcb2",
                    size: 4,
                    padding: 1,
                    stagger: true,
                  },
                  {
                    id: "lines",
                    type: "patternLines",
                    background: "inherit",
                    color: "#eed312",
                    rotation: -45,
                    lineWidth: 6,
                    spacing: 10,
                  },
                ]}
                fill={[
                  {
                    match: {
                      id: "Honeymoon",
                    },
                    id: "dots",
                  },
                  {
                    match: {
                      id: "Soul-searching",
                    },
                    id: "lines",
                  },
                ]}
                startLabel={(d) => d.id}
                endLabel={(d) => d.id}
                axisTop={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "",
                  legendPosition: "middle",
                  legendOffset: -36,
                }}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Quarter",
                  legendPosition: "middle",
                  legendOffset: 32,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-xl">
              <h4 className="font-semibold text-green-700 mb-2">
                Reading the Chart
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Lower position = higher ranking (better performance)</li>
                <li>• Area size represents relative importance</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="font-semibold text-blue-700 mb-2">
                Quarterly Insights
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Track stage dominance changes over time</li>
                <li>• Identify seasonal organizational patterns</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Employee Flow Patterns - Stream Chart */}
        <section className="p-6 bg-cyan-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-cyan-700 mb-4">
            11. Employee Flow Patterns
          </h2>
          <p className="text-gray-700 mb-6">
            This stream chart visualizes the continuous flow of employees across
            different stages over monthly periods, showing volume changes and
            distribution patterns.
          </p>

          <div className="bg-white rounded-xl p-4 border border-cyan-200 mb-4">
            <div className="w-full h-80">
              <ResponsiveStream
                data={streamData}
                keys={[
                  "Honeymoon",
                  "Self-Reflection",
                  "Soul-searching",
                  "Steady State",
                ]}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Month",
                  legendOffset: 36,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Employee Count",
                  legendOffset: -40,
                }}
                enableGridX={true}
                enableGridY={false}
                offsetType="silhouette"
                colors={{ scheme: "nivo" }}
                fillOpacity={0.85}
                borderColor={{ theme: "background" }}
                defs={[
                  {
                    id: "dots",
                    type: "patternDots",
                    background: "inherit",
                    color: "#2563eb",
                    size: 4,
                    padding: 2,
                    stagger: true,
                  },
                  {
                    id: "squares",
                    type: "patternSquares",
                    background: "inherit",
                    color: "#e11d48",
                    size: 6,
                    padding: 2,
                    stagger: true,
                  },
                ]}
                fill={[
                  {
                    match: {
                      id: "Honeymoon",
                    },
                    id: "dots",
                  },
                  {
                    match: {
                      id: "Steady State",
                    },
                    id: "squares",
                  },
                ]}
                legends={[
                  {
                    anchor: "bottom-right",
                    direction: "column",
                    translateX: 100,
                    itemWidth: 80,
                    itemHeight: 20,
                    itemTextColor: "#999999",
                    symbolSize: 12,
                    symbolShape: "circle",
                    effects: [
                      {
                        on: "hover",
                        style: {
                          itemTextColor: "#000000",
                        },
                      },
                    ],
                  },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="font-semibold text-blue-700 mb-2">
                Flow Analysis
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Stream thickness indicates employee volume</li>
                <li>• Patterns reveal seasonal hiring trends</li>
              </ul>
            </div>
            <div className="bg-teal-50 p-4 rounded-xl">
              <h4 className="font-semibold text-teal-700 mb-2">
                Monthly Insights
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Track workforce distribution changes</li>
                <li>• Identify peak transition periods</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Department Distribution - SwarmPlot */}
        <section className="p-6 bg-orange-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-orange-700 mb-4">
            12. Department Distribution
          </h2>
          <p className="text-gray-700 mb-6">
            This swarm plot visualization shows individual employees grouped by
            department, with each point representing an employee's performance
            score. Point size reflects experience level, and colors distinguish
            departments.
          </p>

          <div className="bg-white rounded-xl p-4 border border-orange-200 mb-4">
            <div className="w-full h-96">
              <ResponsiveSwarmPlot
                data={swarmPlotData}
                groups={["Engineering", "Product", "Marketing"]}
                value="value"
                valueFormat=".0f"
                valueScale={{ type: "linear", min: 60, max: 95 }}
                size={8}
                forceStrength={4}
                simulationIterations={100}
                margin={{ top: 80, right: 100, bottom: 80, left: 100 }}
                colors={{ scheme: "nivo" }}
                colorBy="group"
                borderColor={{
                  from: "color",
                  modifiers: [["darker", 0.6]],
                }}
                borderWidth={1}
                motionConfig="wobbly"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 10,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Department",
                  legendPosition: "middle",
                  legendOffset: 46,
                }}
                axisLeft={{
                  tickSize: 10,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Performance Score",
                  legendPosition: "middle",
                  legendOffset: -76,
                }}
                tooltip={({ data }) => (
                  <div
                    style={{
                      background: "white",
                      padding: "9px 12px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    <strong>{data.id}</strong>
                    <br />
                    Department: {data.group}
                    <br />
                    Team: {data.team}
                    <br />
                    Experience: {data.experience} years
                    <br />
                    Performance: {data.value}
                    <br />
                    Stage: {data.stage}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 p-4 rounded-xl">
              <h4 className="font-semibold text-red-700 mb-2">
                Department Insights
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• X-axis groups employees by department</li>
                <li>• Y-axis shows performance score</li>
                <li>• Point size represents experience level</li>
                <li>• Colors distinguish departments</li>
                <li>• Each point is an individual employee</li>
              </ul>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl">
              <h4 className="font-semibold text-yellow-700 mb-2">
                Performance Analysis
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  • Swarm pattern shows performance distribution within
                  departments
                </li>
                <li>• Easily compare department performance ranges</li>
                <li>• Identify high-performing employees and outliers</li>
                <li>• Analyze performance clustering patterns</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Skill Hierarchies - Circle Packing */}
        <section className="p-6 bg-pink-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-pink-700 mb-4">
            13. Skill Hierarchies
          </h2>
          <p className="text-gray-700 mb-6">
            This circle packing chart displays the hierarchical structure of
            skills and competencies, with circle sizes representing skill
            importance and nesting showing skill categories.
          </p>

          <div className="bg-white rounded-xl p-4 border border-pink-200 mb-4">
            <div className="w-full h-96">
              <ResponsiveCirclePacking
                data={circlePackingData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                id="name"
                value="value"
                colors={{ scheme: "nivo" }}
                childColor={{
                  from: "color",
                  modifiers: [["brighter", 0.4]],
                }}
                padding={4}
                enableLabels={true}
                labelsFilter={function (n) {
                  return 2 === n.node.depth;
                }}
                labelsSkipRadius={10}
                labelTextColor={{
                  from: "color",
                  modifiers: [["darker", 2]],
                }}
                borderWidth={1}
                borderColor={{
                  from: "color",
                  modifiers: [["darker", 0.5]],
                }}
                defs={[
                  {
                    id: "lines",
                    type: "patternLines",
                    background: "none",
                    color: "inherit",
                    rotation: -45,
                    lineWidth: 5,
                    spacing: 8,
                  },
                ]}
                fill={[
                  {
                    match: {
                      depth: 1,
                    },
                    id: "lines",
                  },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 p-4 rounded-xl">
              <h4 className="font-semibold text-purple-700 mb-2">
                Skill Categories
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Larger circles indicate higher skill importance</li>
                <li>• Nested structure shows skill relationships</li>
              </ul>
            </div>
            <div className="bg-indigo-50 p-4 rounded-xl">
              <h4 className="font-semibold text-indigo-700 mb-2">
                Development Focus
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Identify key skill development areas</li>
                <li>• Plan targeted training programs</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm pt-6 border-t border-gray-200">
          Generated on {new Date().toLocaleDateString()} • Employee Personality
          Assessment AI System
        </footer>
      </div>

      <div className="mt-8">
        <AssessmentReportPdf reportRef={reportRef} />
      </div>
    </div>
  );
};

export default AssessmentReport;
