import React, { useState } from "react";
import { captureChartsFromPage } from "@/utils/chartCapture";
import { generateComprehensivePDF } from "@/utils/comprehensivePdfGenerator";
import assessmentData from "@/data/assessmentReportData.json";

interface AssessmentReportPdfProps {
  reportRef: React.RefObject<HTMLDivElement | null>;
}

const AssessmentReportPdf: React.FC<AssessmentReportPdfProps> = ({ reportRef }) => {
  const [isCapturingCharts, setIsCapturingCharts] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleCaptureCharts = async () => {
    if (!reportRef?.current) {
      alert('Report element not found. Please try again.');
      return;
    }

    setIsCapturingCharts(true);
    try {
      console.log('Starting chart capture...');
      const chartImages = await captureChartsFromPage(reportRef);
      console.log('Charts captured successfully:', Object.keys(chartImages));
      return chartImages;
    } catch (error) {
      console.error('Error capturing charts:', error);
      alert('Error capturing charts. Please try again.');
      return {};
    } finally {
      setIsCapturingCharts(false);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      console.log('Starting PDF generation with charts...');
      
      // First capture charts
      const chartImages = await captureChartsFromPage(reportRef);
      
      // Then generate PDF with captured charts
      await generateComprehensivePDF({
        chartImages,
        employeeName: assessmentData.employee.name,
        employeeDepartment: assessmentData.employee.department,
      });
      
      console.log('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {/* Capture Charts Button */}
      <button
        onClick={handleCaptureCharts}
        disabled={isCapturingCharts}
        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        📸 {isCapturingCharts ? 'Capturing Charts...' : 'Capture Charts'}
      </button>

      {/* Generate PDF Button */}
      <button
        onClick={handleGeneratePDF}
        disabled={isGeneratingPDF}
        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        📄 {isGeneratingPDF ? 'Generating Comprehensive PDF...' : 'Download Complete PDF Report'}
      </button>
    </div>
  );
};

export default AssessmentReportPdf;
