import React, { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ResponsiveChord } from "@nivo/chord";
import { ResponsiveAreaBump } from "@nivo/bump";
import { ResponsiveStream } from "@nivo/stream";
import { ResponsiveSwarmPlot } from "@nivo/swarmplot";
import { ResponsiveCirclePacking } from "@nivo/circle-packing";
import { ResponsiveRadialBar } from "@nivo/radial-bar";
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
import assessmentData from "../../../data/assessmentReportData.json";

interface CategoryScore {
  category: string;
  score: number;
}

interface SubCategoryScore {
  subCategory: string;
  score: number;
}

const AssessmentReport: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);

  // Assessment Data from JSON
  const overviewText = assessmentData.overview.text;
  const interpretationText = assessmentData.interpretation.text;
  const categoryScores: CategoryScore[] = assessmentData.categoryScores;
  const mainCategory = assessmentData.mainCategory;
  const subCategoryScores: SubCategoryScore[] =
    assessmentData.subCategoryScores;
  const strengths = assessmentData.swot.strengths;
  const weaknesses = assessmentData.swot.weaknesses;
  const opportunities = assessmentData.swot.opportunities;
  const threats = assessmentData.swot.threats;
  const actionPlan = assessmentData.actionPlan.items;
  const actionPlanData = assessmentData.actionPlan.data;

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

  const generatePDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    try {
      // Wait for any animations or renders to complete
      await new Promise((r) => setTimeout(r, 500));

      // Create canvas with options to handle modern CSS features
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        ignoreElements: (element) => {
          // Skip elements that might cause issues
          return element.tagName === "SCRIPT" || element.tagName === "STYLE";
        },
        onclone: (clonedDoc) => {
          // Replace problematic CSS properties and fix layout issues
          const style = clonedDoc.createElement("style");
          style.textContent = `
                        * {
                            box-sizing: border-box !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        
                        body {
                            margin: 0 !important;
                            padding: 0 !important;
                            font-family: system-ui, -apple-system, sans-serif !important;
                        }
                        
                        /* Fix positioning and layout */
                        * {
                            position: relative !important;
                            transform: none !important;
                            animation: none !important;
                            transition: none !important;
                        }
                        
                        /* Ensure proper spacing and no overlapping */
                        .space-y-10 > * + * {
                            margin-top: 2.5rem !important;
                        }
                        
                        .space-y-6 > * + * {
                            margin-top: 1.5rem !important;
                        }
                        
                        .space-y-1 > * + * {
                            margin-top: 0.25rem !important;
                        }
                        
                        /* Fix chart containers */
                        .recharts-wrapper {
                            width: 100% !important;
                            height: auto !important;
                            min-height: 250px !important;
                            overflow: visible !important;
                        }
                        
                        .recharts-surface {
                            overflow: visible !important;
                        }
                        
                        /* Grid layout fixes */
                        .grid {
                            display: grid !important;
                        }
                        
                        .grid-cols-2 {
                            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        }
                        
                        .gap-6 {
                            gap: 1.5rem !important;
                        }
                        
                        /* Padding and margins */
                        .p-6 { padding: 1.5rem !important; }
                        .p-4 { padding: 1rem !important; }
                        .p-10 { padding: 2.5rem !important; }
                        .mb-2 { margin-bottom: 0.5rem !important; }
                        .mb-4 { margin-bottom: 1rem !important; }
                        .mt-8 { margin-top: 2rem !important; }
                        .pt-6 { padding-top: 1.5rem !important; }
                        .pl-5 { padding-left: 1.25rem !important; }
                        
                        /* Text and color fixes */
                        .text-4xl { font-size: 2.25rem !important; line-height: 2.5rem !important; }
                        .text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
                        .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
                        
                        .font-bold { font-weight: 700 !important; }
                        .font-semibold { font-weight: 600 !important; }
                        
                        .leading-relaxed { line-height: 1.625 !important; }
                        
                        .text-center { text-align: center !important; }
                        
                        /* Background colors */
                        .bg-white { background-color: rgb(255 255 255) !important; }
                        .bg-indigo-50 { background-color: rgb(238 242 255) !important; }
                        .bg-purple-50 { background-color: rgb(250 245 255) !important; }
                        .bg-pink-50 { background-color: rgb(253 242 248) !important; }
                        .bg-rose-50 { background-color: rgb(255 241 242) !important; }
                        .bg-indigo-100 { background-color: rgb(224 231 255) !important; }
                        .bg-purple-100 { background-color: rgb(243 232 255) !important; }
                        .bg-green-50 { background-color: rgb(240 253 244) !important; }
                        .bg-green-100 { background-color: rgb(220 252 231) !important; }
                        .bg-red-100 { background-color: rgb(254 226 226) !important; }
                        .bg-blue-100 { background-color: rgb(219 234 254) !important; }
                        .bg-yellow-100 { background-color: rgb(254 249 195) !important; }
                        .bg-teal-50 { background-color: rgb(240 253 250) !important; }
                        .border-teal-200 { border-color: rgb(153 246 228) !important; }
                        .bg-violet-50 { background-color: rgb(245 243 255) !important; }
                        .border-violet-200 { border-color: rgb(196 181 253) !important; }
                        .bg-purple-50 { background-color: rgb(250 245 255) !important; }
                        .border-purple-200 { border-color: rgb(196 181 253) !important; }
                        .bg-amber-50 { background-color: rgb(255 251 235) !important; }
                        .border-amber-200 { border-color: rgb(253 230 138) !important; }
                        .bg-emerald-50 { background-color: rgb(236 253 245) !important; }
                        .border-emerald-200 { border-color: rgb(167 243 208) !important; }
                        .bg-cyan-50 { background-color: rgb(236 254 255) !important; }
                        .border-cyan-200 { border-color: rgb(165 243 252) !important; }
                        .bg-orange-50 { background-color: rgb(255 247 237) !important; }
                        .border-orange-200 { border-color: rgb(254 215 170) !important; }
                        .bg-pink-50 { background-color: rgb(253 242 248) !important; }
                        .border-pink-200 { border-color: rgb(251 207 232) !important; }
                        
                        /* Text colors */
                        .text-indigo-700 { color: rgb(67 56 202) !important; }
                        .text-purple-700 { color: rgb(126 34 206) !important; }
                        .text-pink-700 { color: rgb(190 24 93) !important; }
                        .text-rose-700 { color: rgb(190 18 60) !important; }
                        .text-indigo-800 { color: rgb(55 48 163) !important; }
                        .text-purple-800 { color: rgb(107 33 168) !important; }
                        .text-green-700 { color: rgb(21 128 61) !important; }
                        .text-red-700 { color: rgb(185 28 28) !important; }
                        .text-blue-700 { color: rgb(29 78 216) !important; }
                        .text-yellow-700 { color: rgb(161 98 7) !important; }
                        .text-gray-600 { color: rgb(75 85 99) !important; }
                        .text-gray-700 { color: rgb(55 65 81) !important; }
                        .text-gray-500 { color: rgb(107 114 128) !important; }
                        .text-gray-800 { color: rgb(31 41 55) !important; }
                        .text-teal-700 { color: rgb(15 118 110) !important; }
                        .text-violet-700 { color: rgb(109 40 217) !important; }
                        .text-violet-600 { color: rgb(124 58 237) !important; }
                        .text-purple-700 { color: rgb(126 34 206) !important; }
                        .text-amber-700 { color: rgb(180 83 9) !important; }
                        .text-emerald-700 { color: rgb(4 120 87) !important; }
                        .text-cyan-700 { color: rgb(14 116 144) !important; }
                        .text-orange-700 { color: rgb(194 65 12) !important; }
                        .text-pink-700 { color: rgb(190 24 93) !important; }
                        
                        /* Border and shadow fixes */
                        .rounded-3xl { border-radius: 1.5rem !important; }
                        .rounded-2xl { border-radius: 1rem !important; }
                        .rounded-xl { border-radius: 0.75rem !important; }
                        
                        .shadow-2xl, .shadow-lg, .shadow, .shadow-inner {
                            box-shadow: none !important;
                        }
                        
                        .border-t { border-top: 1px solid rgb(229 231 235) !important; }
                        .border-gray-200 { border-color: rgb(229 231 235) !important; }
                        
                        /* List styles */
                        .list-disc {
                            list-style-type: disc !important;
                            list-style-position: inside !important;
                        }
                        
                        /* Flexbox fixes */
                        .flex { display: flex !important; }
                        .flex-col { flex-direction: column !important; }
                        .items-center { align-items: center !important; }
                        .justify-center { justify-content: center !important; }
                        
                        /* Width and height fixes */
                        .w-full { width: 100% !important; }
                        .max-w-4xl { max-width: 56rem !important; }
                        .h-72 { height: 18rem !important; }
                        .h-80 { height: 20rem !important; }
                        
                        /* Remove gradients that might cause issues */
                        .bg-gradient-to-br, .bg-gradient-to-r {
                            background: rgb(255 255 255) !important;
                        }
                    `;
          clonedDoc.head.appendChild(style);
        },
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Handle multi-page PDFs if content is too long
      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
        const pageHeight = pdf.internal.pageSize.getHeight();
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save("Employee_Assessment_Report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    }
  };

  return (
    <div className="bg-linear-to-br from-indigo-50 to-purple-100 min-h-screen flex flex-col items-center p-8">
      <div
        ref={reportRef}
        className="bg-white shadow-2xl rounded-3xl max-w-4xl w-full p-10 space-y-10"
      >
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">
            Employee Personality Assessment Report
          </h1>
          <p className="text-gray-600">
            Employee: <strong>{assessmentData.employee.name}</strong> |
            Department: {assessmentData.employee.department} | Assessment Date:{" "}
            {new Date().toLocaleDateString()}
          </p>
        </header>

        {/* 1. Overview */}
        <section className="p-6 bg-indigo-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
            1. Overview
          </h2>
          <p className="text-gray-700 leading-relaxed">{overviewText}</p>
        </section>

        {/* 2. Interpretation */}
        <section className="p-6 bg-purple-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">
            2. Interpretation
          </h2>
          <p className="text-gray-700 leading-relaxed">{interpretationText}</p>
        </section>

        {/* 3. Main Category */}
        <section className="p-6 bg-pink-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-pink-700 mb-4">
            3. Main Category Placement
          </h2>
          <p className="text-gray-700 mb-4">
            Based on overall assessment, the employee predominantly aligns with
            the <strong>{mainCategory}</strong> stage. However, traits from
            other categories are also evident, reflecting a well-balanced
            personality mix.
          </p>

          <div className="w-full h-96">
            <ResponsiveRadialBar
              data={categoryScores.map((item) => ({
                id: item.category,
                data: [{ x: item.category, y: item.score }],
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
        </section>

        {/* 4. Subcategories */}
        <section className="p-6 bg-rose-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-rose-700 mb-4">
            4. Sub-Categories within {mainCategory}
          </h2>
          <p className="text-gray-700 mb-4">
            The radar chart below depicts the employee’s performance across
            various sub-traits that contribute to the {mainCategory} archetype.
          </p>

          <div className="w-full h-80">
            <ResponsiveRadar
              data={subCategoryScores.map((item) => ({
                subCategory: item.subCategory,
                score: item.score,
              }))}
              keys={["score"]}
              indexBy="subCategory"
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
        </section>

        {/* 5. Stage Relationships - Chord Diagram */}
        <section className="p-6 bg-amber-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-amber-700 mb-4">
            5. Stage Relationships & Interactions
          </h2>
          <p className="text-gray-700 mb-6">
            This chord diagram visualizes the interconnections and transition
            patterns between different employee stages, showing the strength of
            relationships and flow dynamics.
          </p>

          <div className="bg-white rounded-xl p-4 border border-amber-200 mb-4">
            <div className="w-full h-96">
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

        {/* 6. Stage Transition Flow */}
        <section className="p-6 bg-teal-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-teal-700 mb-4">
            6. Stage Transition Flow
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
                      <div className="w-24 text-sm text-gray-600 flex-shrink-0">
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

        {/* 7. Predictive Trends */}
        <section className="p-6 bg-violet-50 rounded-2xl shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-violet-700">
              7. Predictive Trends (Next 90 Days)
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
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#6366F1"
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
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#8B5CF6"
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
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#06B6D4"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="readyState" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#10B981"
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
                    stroke="#6366F1"
                    fill="url(#honeymoon)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Self-Reflection"
                    stackId="1"
                    stroke="#8B5CF6"
                    fill="url(#selfReflection)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Soul-searching"
                    stackId="1"
                    stroke="#06B6D4"
                    fill="url(#soulSearching)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Steady State"
                    stackId="1"
                    stroke="#10B981"
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

        {/* 8. Stage Rankings Over Time - Area Bump Chart */}
        <section className="p-6 bg-emerald-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-4">
            8. Stage Rankings Over Time
          </h2>
          <p className="text-gray-700 mb-6">
            This area bump chart shows how different employee stages rank in
            prevalence over quarterly periods, revealing seasonal patterns and
            organizational trends.
          </p>

          <div className="bg-white rounded-xl p-4 border border-emerald-200 mb-4">
            <div className="w-full h-80">
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

        {/* 9-12 SWOT */}
        <section className="p-6 bg-indigo-100 rounded-2xl shadow-inner space-y-6">
          <h2 className="text-2xl font-semibold text-indigo-800 mb-2">
            9–12. SWOT Analysis
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-green-100 p-4 rounded-xl shadow">
              <h3 className="text-green-700 font-semibold mb-2">Strengths</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-red-100 p-4 rounded-xl shadow">
              <h3 className="text-red-700 font-semibold mb-2">Weaknesses</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {weaknesses.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-100 p-4 rounded-xl shadow">
              <h3 className="text-blue-700 font-semibold mb-2">
                Opportunities
              </h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {opportunities.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-100 p-4 rounded-xl shadow">
              <h3 className="text-yellow-700 font-semibold mb-2">Threats</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {threats.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 13. Employee Flow Patterns - Stream Chart */}
        <section className="p-6 bg-cyan-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-cyan-700 mb-4">
            13. Employee Flow Patterns
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

        {/* 14. Interpretation */}
        <section className="p-6 bg-purple-100 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-purple-800 mb-4">
            14. Detailed Interpretation
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {assessmentData.detailedInterpretation.text}
          </p>
        </section>

        {/* 15. Department Distribution - SwarmPlot */}
        <section className="p-6 bg-orange-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-orange-700 mb-4">
            15. Department Distribution
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

        {/* 16. Skill Hierarchies - Circle Packing */}
        <section className="p-6 bg-pink-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-pink-700 mb-4">
            16. Skill Hierarchies
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

        {/* 17. Action Plan */}
        <section className="p-6 bg-green-50 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">
            17. Action Plan – Recommended Next Steps
          </h2>
          <p className="text-gray-700 mb-6">
            Interactive progress cards for recommended development actions. Each
            card shows current progress with gradient bars, target markers, and
            status indicators with timeline information.
          </p>

          {/* Action Plan Progress Cards */}
          <div className="grid gap-6 mb-6">
            {actionPlanData.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-6 border border-green-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0
                          ? "bg-blue-500"
                          : index === 1
                          ? "bg-purple-500"
                          : "bg-orange-500"
                      }`}
                    >
                      {index === 0 ? "📚" : index === 1 ? "🤝" : "🎯"}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {item.measures[0]}%
                    </div>
                    <div className="text-xs text-gray-500">Progress</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Current Progress</span>
                    <span>Target: {item.markers[0]}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 relative">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${item.measures[0]}%` }}
                    ></div>
                    {/* Target Marker */}
                    <div
                      className="absolute top-0 w-1 h-3 bg-red-500 rounded"
                      style={{ left: `${item.markers[0]}%` }}
                      title={`Target: ${item.markers[0]}%`}
                    ></div>
                  </div>
                </div>

                {/* Status and Timeline */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.measures[0] >= item.markers[0]
                          ? "bg-green-500"
                          : item.measures[0] >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-sm font-medium">
                      {item.measures[0] >= item.markers[0]
                        ? "On Track"
                        : item.measures[0] >= 50
                        ? "In Progress"
                        : "Needs Attention"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {index === 0
                      ? "Q1 2024"
                      : index === 1
                      ? "Q2 2024"
                      : "Q3 2024"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Traditional Action Items */}
          <div className="bg-emerald-50 p-4 rounded-xl mb-4">
            <h3 className="text-lg font-semibold text-emerald-700 mb-3">
              Detailed Action Items:
            </h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              {actionPlan.map((s, i) => (
                <li key={i} className="leading-relaxed">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Progress Legend */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border border-green-200 text-center">
              <div className="w-full h-2 bg-gradient-to-r from-green-400 to-green-600 rounded mb-2"></div>
              <div className="text-sm font-medium text-green-700">
                Progress Bar
              </div>
              <div className="text-xs text-gray-600">
                Current completion level
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-200 text-center">
              <div className="w-1 h-2 bg-red-500 rounded mx-auto mb-2"></div>
              <div className="text-sm font-medium text-green-700">
                Target Marker
              </div>
              <div className="text-xs text-gray-600">
                Goal achievement point
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-200 text-center">
              <div className="flex justify-center space-x-1 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div className="text-sm font-medium text-green-700">
                Status Indicators
              </div>
              <div className="text-xs text-gray-600">
                On Track / In Progress / Needs Attention
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-200 text-center">
              <div className="flex justify-center space-x-1 mb-2">
                <span className="text-lg">📚</span>
                <span className="text-lg">🤝</span>
                <span className="text-lg">🎯</span>
              </div>
              <div className="text-sm font-medium text-green-700">
                Action Icons
              </div>
              <div className="text-xs text-gray-600">
                Training / Collaboration / Goals
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm pt-6 border-t border-gray-200">
          Generated on {new Date().toLocaleDateString()} • Employee Personality
          Assessment AI System
        </footer>
      </div>

      <button
        onClick={generatePDF}
        className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg transition-all duration-300"
      >
        📄 Download PDF Report
      </button>
    </div>
  );
};

export default AssessmentReport;
