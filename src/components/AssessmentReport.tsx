import React, { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ScatterChart,
    Scatter,
    ZAxis,
    Cell,
} from "recharts";

interface SkillScore {
    skill: string;
    score: number;
}

interface RadarData {
    subject: string;
    A: number;
    fullMark: number;
}

interface HeatmapPoint {
    x: string;
    y: string;
    value: number;
}

const AssessmentReport: React.FC = () => {
    const reportRef = useRef<HTMLDivElement>(null);

    // 🧠 Dummy Data
    const skillScores: SkillScore[] = [
        { skill: "Communication", score: 82 },
        { skill: "Leadership", score: 68 },
        { skill: "Problem Solving", score: 90 },
        { skill: "Adaptability", score: 74 },
        { skill: "Time Management", score: 56 },
    ];

    const radarData: RadarData[] = skillScores.map((s) => ({
        subject: s.skill,
        A: s.score,
        fullMark: 100,
    }));

    const quarters = ["Q1", "Q2", "Q3", "Q4"];
    const categories = ["Productivity", "Communication", "Teamwork", "Initiative"];
    const heatmapData: HeatmapPoint[] = [];
    categories.forEach((cat) => {
        quarters.forEach((q) => {
            heatmapData.push({
                x: q,
                y: cat,
                value: Math.floor(55 + Math.random() * 40),
            });
        });
    });

    const getColor = (value: number): string => {
        const intensity = (value - 50) / 50;
        return `rgba(99,102,241, ${intensity})`; // Indigo tone
    };

    const generatePDF = async () => {
        const element = reportRef.current;
        if (!element) return;

        // Wait for rendering
        await new Promise((r) => setTimeout(r, 500));

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            scrollY: -window.scrollY,
        });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("Employee_Assessment_Report.pdf");
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 min-h-screen flex flex-col items-center p-8">
            <div
                ref={reportRef}
                className="bg-white shadow-2xl rounded-3xl max-w-4xl w-full p-10 space-y-10"
            >
                {/* Header */}
                <header className="text-center">
                    <h1 className="text-4xl font-bold text-indigo-700 mb-2">
                        Employee Assessment Report
                    </h1>
                    <p className="text-gray-600">
                        Employee: <strong>Jane Doe</strong> | Department: Engineering | Period: 2025
                    </p>
                </header>

                {/* Overview */}
                <section className="text-gray-700 leading-relaxed">
                    <p>
                        This report provides a comprehensive overview of Jane Doe’s performance across multiple skill areas.
                        Using data from quarterly assessments, it highlights strengths, improvement areas, and growth patterns over time.
                    </p>
                    <p className="mt-2">
                        Each visualization in this report has been crafted to convey meaningful insights into key competencies,
                        helping guide performance development strategies and personalized learning paths.
                    </p>
                </section>

                {/* Bar Chart Section */}
                <section className="p-6 bg-indigo-50 rounded-2xl shadow-inner">
                    <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
                        Skill Performance Overview
                    </h2>
                    <p className="text-gray-700 mb-4">
                        The bar chart below displays Jane’s performance across core skills such as communication, leadership, and problem-solving.
                        Scores are normalized on a scale of 100. A balanced distribution indicates a well-rounded skill set.
                    </p>

                    <div className="w-full h-72">
                        <ResponsiveContainer>
                            <BarChart data={skillScores}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="skill" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Radar Chart Section */}
                <section className="p-6 bg-purple-50 rounded-2xl shadow-inner">
                    <h2 className="text-2xl font-semibold text-purple-700 mb-4">
                        Competency Balance Radar
                    </h2>
                    <p className="text-gray-700 mb-4">
                        The radar chart represents Jane’s competency balance across the same skill areas.
                        A uniform shape suggests even development, while uneven spikes highlight areas of strength or improvement potential.
                    </p>

                    <div className="w-full h-80 flex justify-center">
                        <ResponsiveContainer width="80%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis />
                                <Radar
                                    name="Score"
                                    dataKey="A"
                                    stroke="#7e22ce"
                                    fill="#a78bfa"
                                    fillOpacity={0.6}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Heatmap Section */}
                <section className="p-6 bg-pink-50 rounded-2xl shadow-inner">
                    <h2 className="text-2xl font-semibold text-pink-700 mb-4">
                        Quarterly Performance Heatmap
                    </h2>
                    <p className="text-gray-700 mb-4">
                        The heatmap below visualizes Jane’s quarterly performance across key behavioral and productivity categories.
                        Darker shades represent higher scores, showing where consistency or volatility may exist across time periods.
                    </p>

                    <div className="w-full h-80">
                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid />
                                <XAxis type="category" dataKey="x" name="Quarter" />
                                <YAxis
                                    type="category"
                                    dataKey="y"
                                    name="Category"
                                    width={120}
                                />
                                <ZAxis type="number" dataKey="value" range={[60, 400]} />
                                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                                <Scatter data={heatmapData}>
                                    {heatmapData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={getColor(entry.value)}
                                            stroke="#fff"
                                        />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Summary Section */}
                <section className="p-6 bg-indigo-100 rounded-2xl shadow-inner">
                    <h3 className="text-2xl font-semibold text-indigo-800 mb-3">
                        Summary & Recommendations
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        Jane exhibits a strong analytical mindset and exceptional problem-solving abilities.
                        Her communication skills contribute positively to team dynamics and collaboration.
                        However, leadership and time management stand out as growth opportunities.
                    </p>

                    <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        <li>Enroll in leadership and people management training programs.</li>
                        <li>Utilize time-blocking or productivity tracking tools.</li>
                        <li>Continue leveraging communication strengths in cross-functional roles.</li>
                    </ul>
                </section>

                {/* Footer */}
                <footer className="text-center text-gray-500 text-sm pt-6 border-t border-gray-200">
                    Generated on {new Date().toLocaleDateString()} • Employee Performance AI System
                </footer>
            </div>

            {/* Download Button */}
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
