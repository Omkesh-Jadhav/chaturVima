import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import assessmentData from '@/data/assessmentReportData.json';

export interface ChartImages {
  radialBar?: string;
  radar?: string;
  chord?: string;
  areaBump?: string;
}

export const captureChartsFromPage = async (
  reportRef: React.RefObject<HTMLDivElement | null>
): Promise<ChartImages> => {
  if (!reportRef?.current) {
    console.warn("Report reference not found");
    return {};
  }

  console.log("Starting chart capture process...");
  const images: ChartImages = {};

  try {
    const radialBarChart = reportRef.current.querySelector('[data-chart-id="radialBar"]');
    const radarChart = reportRef.current.querySelector('[data-chart-id="radar"]');
    const chordChart = reportRef.current.querySelector('[data-chart-id="chord"]');
    const areaBumpChart = reportRef.current.querySelector('[data-chart-id="areaBump"]');

    const charts = [
      { element: radialBarChart, id: "radialBar" as keyof ChartImages, name: "Radial Bar Chart" },
      { element: radarChart, id: "radar" as keyof ChartImages, name: "Radar Chart" },
      { element: chordChart, id: "chord" as keyof ChartImages, name: "Chord Chart" },
      { element: areaBumpChart, id: "areaBump" as keyof ChartImages, name: "Area Bump Chart" },
    ];

    for (const chart of charts) {
      if (chart.element) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const svgElement = chart.element.querySelector("svg");
          if (!svgElement) {
            console.warn(`No SVG found in ${chart.name}, skipping...`);
            continue;
          }

          const canvas = await html2canvas(chart.element as HTMLElement, {
            backgroundColor: "#ffffff",
            scale: 2,
            useCORS: true,
            allowTaint: false,
            width: chart.element.clientWidth,
            height: chart.element.clientHeight,
          });
          
          const dataUrl = canvas.toDataURL('image/png', 0.95);
          if (dataUrl && dataUrl.startsWith("data:image/")) {
            images[chart.id] = dataUrl;
            console.log(`✅ Successfully captured ${chart.name}`);
          }
        } catch (error) {
          console.error(`❌ Failed to capture ${chart.name}:`, error);
        }
      }
    }

    return images;
  } catch (error) {
    console.error("Error during chart capture process:", error);
    return {};
  }
};

interface PDFGeneratorOptions {
  chartImages: ChartImages;
  employeeName: string;
  employeeDepartment: string;
}

export const generateComprehensivePDF = async (options: PDFGeneratorOptions): Promise<void> => {
  const { chartImages, employeeName, employeeDepartment } = options;
  
  try {
    console.log('Starting comprehensive PDF generation...');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * (fontSize * 0.35));
    };

    // Helper function to check if we need a new page
    const checkNewPage = (requiredHeight: number): number => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        return margin;
      }
      return yPosition;
    };

    // Helper function to add a chart image
    const addChartImage = (chartKey: keyof ChartImages, title: string, description?: string): void => {
      const chartImage = chartImages[chartKey];
      
      yPosition = checkNewPage(100);
      
      // Add chart title
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin, yPosition);
      yPosition += 10;
      
      if (description) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        yPosition = addWrappedText(description, margin, yPosition, pageWidth - 2 * margin, 10);
        yPosition += 5;
      }

      if (chartImage) {
        try {
          const chartWidth = pageWidth - (2 * margin);
          const chartHeight = 80;
          
          yPosition = checkNewPage(chartHeight + 10);
          
          pdf.addImage(chartImage, 'PNG', margin, yPosition, chartWidth, chartHeight);
          yPosition += chartHeight + 15;
          console.log(`✅ Added ${title} to PDF`);
        } catch (error) {
          console.error(`❌ Error adding ${title} to PDF:`, error);
          pdf.setFontSize(10);
          pdf.setTextColor(150, 150, 150);
          pdf.text(`[${title} - Chart could not be rendered]`, margin, yPosition);
          yPosition += 15;
        }
      } else {
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`[${title} - Chart not captured]`, margin, yPosition);
        yPosition += 15;
      }
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
    };

    // Title Page
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Employee Assessment Report', margin, yPosition);
    yPosition += 20;

    // Employee Information
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Employee Information', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Name: ${employeeName}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Department: ${employeeDepartment}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 20;

    // 1. Overview Section
    yPosition = checkNewPage(30);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. Overview', margin, yPosition);
    yPosition += 15;

    // Overview content (matches overviewText from UI)
    assessmentData.overview.text.forEach((paragraph: string) => {
      yPosition = checkNewPage(20);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(paragraph, margin, yPosition, pageWidth - 2 * margin, 11);
      yPosition += 8;
    });

    yPosition += 10;

    // 2. Interpretation Section
    yPosition = checkNewPage(30);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('2. Interpretation', margin, yPosition);
    yPosition += 15;

    // Interpretation text content (matches interpretationText from UI)
    assessmentData.interpretation.stageInterpretation.forEach((paragraph: string) => {
      yPosition = checkNewPage(20);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(paragraph, margin, yPosition, pageWidth - 2 * margin, 11);
      yPosition += 8;
    });

    yPosition += 10;

    // Add Radial Bar Chart
    addChartImage('radialBar', 'Stage Distribution Chart', 'This radial bar chart shows the distribution of employees across different organizational stages.');

    // Stage Distribution Analysis (matches the UI section after the chart)
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Stage Distribution Analysis', margin, yPosition);
    yPosition += 15;

    // Distribution data cards (matches the grid in UI)
    assessmentData.interpretation.distribution.forEach((item: any) => {
      yPosition = checkNewPage(35);
      
      // Stage name and score header
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.stage, margin, yPosition);
      
      // Score percentage and level on the right
      pdf.text(`${item.scorePercentage}%`, pageWidth - margin - 30, yPosition);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(item.level.toUpperCase(), pageWidth - margin - 30, yPosition + 6);
      
      yPosition += 12;
      
      // Stage description text
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(item.text, margin, yPosition, pageWidth - 2 * margin, 10);
      yPosition += 15;
    });

    yPosition += 10;

    // 3. Main Stage Analysis Section
    yPosition = checkNewPage(40);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    
    // Get the main stage from the first distribution item
    const mainStage = assessmentData.interpretation.distribution[0]?.stage || 'Honeymoon';
    const mainStageScore = assessmentData.interpretation.distribution[0]?.score || 0;
    
    pdf.text(`3. Main Stage Analysis - ${mainStage}`, margin, yPosition);
    yPosition += 15;

    // Stage Score Display
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Current Stage', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(mainStage, margin, yPosition);
    
    // Stage Score on the right side
    pdf.text('Stage Score', pageWidth - margin - 40, yPosition - 8);
    pdf.setFontSize(16);
    pdf.text(mainStageScore.toString(), pageWidth - margin - 20, yPosition);
    yPosition += 15;

    // Employee Assessment (Employee Stage Description)
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Employee Assessment', margin, yPosition);
    yPosition += 10;

    assessmentData.interpretation.employeeStageDescription.forEach((paragraph: string) => {
      yPosition = checkNewPage(20);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(paragraph, margin, yPosition, pageWidth - 2 * margin, 10);
      yPosition += 8;
    });

    yPosition += 10;

    // Understanding the [Stage] Stage (Dominant Stage Description)
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Understanding the ${mainStage} Stage`, margin, yPosition);
    yPosition += 10;

    assessmentData.interpretation.dominantStageDescription.forEach((paragraph: string) => {
      yPosition = checkNewPage(20);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(paragraph, margin, yPosition, pageWidth - 2 * margin, 10);
      yPosition += 8;
    });

    yPosition += 10;

    // 4. Sub-Stage Analysis within [Main Stage]
    yPosition = checkNewPage(30);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    
    // Get the main stage from the first distribution item for the title
    const mainStageForSubAnalysis = assessmentData.interpretation.distribution[0]?.stage || 'Honeymoon';
    pdf.text(`4. Sub-Stage Analysis within ${mainStageForSubAnalysis}`, margin, yPosition);
    yPosition += 15;

    // Summary Section (matches subStageScoresSummary from UI)
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', margin, yPosition);
    yPosition += 10;

    // Get the main stage details for summary
    const mainStageDetails = assessmentData.interpretation.distribution[0];
    if (mainStageDetails && mainStageDetails.subStageSummary && mainStageDetails.subStageSummary.length > 0) {
      mainStageDetails.subStageSummary.forEach((summary: string) => {
        yPosition = checkNewPage(20);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        yPosition = addWrappedText(summary, margin, yPosition, pageWidth - 2 * margin, 11);
        yPosition += 8;
      });
    }

    yPosition += 10;

    // Performance Overview (Radar Chart)
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Performance Overview', margin, yPosition);
    yPosition += 10;

    // Add Radar Chart
    addChartImage('radar', 'Performance Overview Chart', 'This radar chart displays performance metrics across different sub-stages.');

    // Detailed Analysis Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed Analysis', margin, yPosition);
    yPosition += 15;

    // Sub-stage details (matches subStageScoresData from UI)
    if (mainStageDetails && mainStageDetails.subStageDetails && mainStageDetails.subStageDetails.length > 0) {
      mainStageDetails.subStageDetails.forEach((item: any) => {
        yPosition = checkNewPage(40);
        
        // Sub-Stage Header (matches UI structure)
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.subStage, margin, yPosition);
        
        // Score on the right side
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.subStageScore.toString(), pageWidth - margin - 20, yPosition);
        yPosition += 12;

        // Sub-Stage Introduction
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        yPosition = addWrappedText(item.subStageIntro, margin, yPosition, pageWidth - 2 * margin, 11);
        yPosition += 8;

        // Sub-Stage Description (bullet points)
        if (item.subStageDescription && item.subStageDescription.length > 0) {
          item.subStageDescription.forEach((desc: string) => {
            yPosition = checkNewPage(15);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            yPosition = addWrappedText(`• ${desc}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 10);
            yPosition += 5;
          });
        }

        yPosition += 5;

        // Sub-Stage Conclusion (highlighted section)
        yPosition = checkNewPage(15);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        yPosition = addWrappedText(`Conclusion: ${item.subStageConclusion}`, margin, yPosition, pageWidth - 2 * margin, 10);
        yPosition += 15;
      });
    }

    // 5. SWOT Analysis
    yPosition = checkNewPage(30);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('5. SWOT Analysis', margin, yPosition);
    yPosition += 15;

    // Strengths
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Strengths:', margin, yPosition);
    yPosition += 10;

    assessmentData.swot.strengths.forEach((strength: any) => {
      yPosition = checkNewPage(25);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPosition = addWrappedText(`• ${strength.title}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 12);
      yPosition += 5;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(strength.text, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
      yPosition += 5;
      
      yPosition = addWrappedText(`Why it matters: ${strength.whyMatters}`, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
      yPosition += 5;
      
      yPosition = addWrappedText(`Action: ${strength.actionableInsight}`, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
      yPosition += 10;
    });

    yPosition += 5;

    // Weaknesses
    yPosition = checkNewPage(20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Weaknesses:', margin, yPosition);
    yPosition += 10;

    assessmentData.swot.weaknesses.forEach((weakness: any) => {
      yPosition = checkNewPage(25);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPosition = addWrappedText(`• ${weakness.title}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 12);
      yPosition += 5;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(weakness.text, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
      yPosition += 5;
      
      yPosition = addWrappedText(`Why it matters: ${weakness.whyMatters}`, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
      yPosition += 5;
      
      yPosition = addWrappedText(`Action: ${weakness.actionableInsight}`, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
      yPosition += 10;
    });

    yPosition += 5;

    // Opportunities
    yPosition = checkNewPage(20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Opportunities:', margin, yPosition);
    yPosition += 10;

    assessmentData.swot.opportunities.forEach((opportunity: any) => {
      yPosition = checkNewPage(25);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPosition = addWrappedText(`• ${opportunity.title}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 12);
      yPosition += 5;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(opportunity.text, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
      yPosition += 5;
      
      yPosition = addWrappedText(`Why it matters: ${opportunity.whyMatters}`, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
      yPosition += 5;
      
      yPosition = addWrappedText(`Action: ${opportunity.actionableInsight}`, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
      yPosition += 10;
    });

    yPosition += 5;

    // Threats
    yPosition = checkNewPage(20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Threats:', margin, yPosition);
    yPosition += 10;

    assessmentData.swot.threats.forEach((threat: any) => {
      yPosition = checkNewPage(25);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPosition = addWrappedText(`• ${threat.title}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 12);
      yPosition += 5;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(threat.text, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
      yPosition += 5;
      
      yPosition = addWrappedText(`Why it matters: ${threat.whyMatters}`, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
      yPosition += 5;
      
      yPosition = addWrappedText(`Action: ${threat.actionableInsight}`, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
      yPosition += 10;
    });

    yPosition += 15;

    // 8. Recommendations
    yPosition = checkNewPage(30);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('8. Recommendations', margin, yPosition);
    yPosition += 15;

    yPosition = addWrappedText(assessmentData.recommendations.recommendationsIntro, margin, yPosition, pageWidth - 2 * margin, 11);
    yPosition += 10;

    assessmentData.recommendations.sections.forEach((section: any) => {
      yPosition = checkNewPage(25);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${section.id}. ${section.title}`, margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(section.description, margin, yPosition, pageWidth - 2 * margin, 11);
      yPosition += 8;

      section.recommendations.forEach((recommendation: any) => {
        yPosition = checkNewPage(15);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        yPosition = addWrappedText(`• ${recommendation.title}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 11);
        yPosition += 5;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        yPosition = addWrappedText(recommendation.description, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
        yPosition += 8;
      });

      yPosition += 10;
    });

    // 6. Action Plan
    yPosition = checkNewPage(30);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('6. Action Plan', margin, yPosition);
    yPosition += 15;

    assessmentData.actionPlan.categories.forEach((category: any) => {
      yPosition = checkNewPage(25);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${category.id}. ${category.title}`, margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(category.description, margin, yPosition, pageWidth - 2 * margin, 11);
      yPosition += 8;

      category.actions.forEach((action: any) => {
        yPosition = checkNewPage(15);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        yPosition = addWrappedText(`• ${action.title}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 11);
        yPosition += 5;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        yPosition = addWrappedText(action.description, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
        yPosition += 8;
      });

      yPosition += 10;
    });

    // 7. Conclusion
    yPosition = checkNewPage(30);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('7. Conclusion', margin, yPosition);
    yPosition += 15;

    // Conclusion content
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    yPosition = addWrappedText(assessmentData.detailedInterpretation.text, margin, yPosition, pageWidth - 2 * margin, 11);

    // Save the PDF
    const fileName = `Employee_Assessment_Report_${employeeName.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);
    
    console.log('✅ Comprehensive PDF generated successfully!');
    console.log(`📄 File saved as: ${fileName}`);
    
  } catch (error) {
    console.error('❌ Error generating comprehensive PDF:', error);
    throw error;
  }
};
