import React from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import assessmentData from "@/data/assessmentReportData.json";

interface AssessmentReportPdfProps {
  reportRef: React.RefObject<HTMLDivElement | null>;
}

const AssessmentReportPdf: React.FC<AssessmentReportPdfProps> = ({ reportRef }) => {
  const overviewText = assessmentData.overview.text;

  const generatePDF = async () => {
    const element = reportRef.current;
    
    console.log("Starting PDF generation...");
    console.log("Element found:", !!element);
    
    if (!element) {
      console.error("Report element not found");
      alert("Report element not found. Please try again.");
      return;
    }

    try {
      console.log("Waiting for render completion...");
      // Wait for any animations or renders to complete
      await new Promise((r) => setTimeout(r, 2000));
      
      // Wait for all charts to render by checking for SVG elements
      const svgElements = element.querySelectorAll('svg');
      console.log(`Found ${svgElements.length} SVG elements (charts)`);
      
      // Additional wait for chart animations
      if (svgElements.length > 0) {
        console.log("Waiting for chart animations to complete...");
        await new Promise((r) => setTimeout(r, 1000));
      }

      console.log("Element dimensions:", {
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight
      });

      console.log("Starting html2canvas...");
      
      // Optimized html2canvas options for better quality
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false, // Disable logging for cleaner output
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          // Skip problematic elements
          const tagName = element.tagName?.toLowerCase();
          return tagName === "script" || tagName === "style" || tagName === "noscript";
        },
        onclone: (clonedDoc) => {
          // Preserve styling while fixing oklch() issues
          const style = clonedDoc.createElement("style");
          style.textContent = `
            /* Fix oklch colors with hex equivalents while preserving layout */
            * {
              animation: none !important;
              transition: none !important;
            }
            
            /* Preserve Tailwind classes but fix colors */
            .text-4xl { font-size: 2.25rem !important; line-height: 2.5rem !important; }
            .text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
            .text-xl { font-size: 1.25rem !important; line-height: 1.75rem !important; }
            .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
            .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
            
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-medium { font-weight: 500 !important; }
            
            .text-center { text-align: center !important; }
            .text-left { text-align: left !important; }
            .text-right { text-align: right !important; }
            
            /* Color fixes */
            .text-indigo-700 { color: #4338ca !important; }
            .text-purple-700 { color: #7c3aed !important; }
            .text-pink-700 { color: #be185d !important; }
            .text-rose-700 { color: #be123c !important; }
            .text-green-700 { color: #15803d !important; }
            .text-red-700 { color: #b91c1c !important; }
            .text-blue-700 { color: #1d4ed8 !important; }
            .text-yellow-700 { color: #a16207 !important; }
            .text-gray-600 { color: #4b5563 !important; }
            .text-gray-700 { color: #374151 !important; }
            .text-gray-500 { color: #6b7280 !important; }
            .text-gray-800 { color: #1f2937 !important; }
            .text-white { color: #ffffff !important; }
            
            /* Background colors */
            .bg-white { background-color: #ffffff !important; }
            .bg-indigo-50 { background-color: #eef2ff !important; }
            .bg-purple-50 { background-color: #faf5ff !important; }
            .bg-pink-50 { background-color: #fdf2f8 !important; }
            .bg-rose-50 { background-color: #fff1f2 !important; }
            .bg-indigo-100 { background-color: #e0e7ff !important; }
            .bg-purple-100 { background-color: #f3e8ff !important; }
            .bg-green-50 { background-color: #f0fdf4 !important; }
            .bg-green-100 { background-color: #dcfce7 !important; }
            .bg-red-100 { background-color: #fee2e2 !important; }
            .bg-blue-100 { background-color: #dbeafe !important; }
            .bg-yellow-100 { background-color: #fef3c7 !important; }
            .bg-teal-50 { background-color: #f0fdfa !important; }
            .bg-violet-50 { background-color: #f5f3ff !important; }
            .bg-amber-50 { background-color: #fffbeb !important; }
            .bg-emerald-50 { background-color: #ecfdf5 !important; }
            .bg-cyan-50 { background-color: #ecfeff !important; }
            .bg-orange-50 { background-color: #fff7ed !important; }
            
            /* Layout classes */
            .p-6 { padding: 1.5rem !important; }
            .p-4 { padding: 1rem !important; }
            .p-10 { padding: 2.5rem !important; }
            .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
            .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
            .mb-2 { margin-bottom: 0.5rem !important; }
            .mb-4 { margin-bottom: 1rem !important; }
            .mt-8 { margin-top: 2rem !important; }
            .pt-6 { padding-top: 1.5rem !important; }
            
            .rounded-2xl { border-radius: 1rem !important; }
            .rounded-3xl { border-radius: 1.5rem !important; }
            .rounded-lg { border-radius: 0.5rem !important; }
            
            .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important; }
            .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06) !important; }
            
            .space-y-10 > * + * { margin-top: 2.5rem !important; }
            .space-y-6 > * + * { margin-top: 1.5rem !important; }
            .space-y-1 > * + * { margin-top: 0.25rem !important; }
            
            .grid { display: grid !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .gap-6 { gap: 1.5rem !important; }
            
            /* Border colors */
            .border-teal-200 { border-color: #99f6e4 !important; }
            .border-violet-200 { border-color: #c4b5fd !important; }
            .border-purple-200 { border-color: #c4b5fd !important; }
            .border-amber-200 { border-color: #fde68a !important; }
            .border-emerald-200 { border-color: #a7f3d0 !important; }
            .border-cyan-200 { border-color: #a5f3fc !important; }
            .border-orange-200 { border-color: #fed7aa !important; }
            .border-pink-200 { border-color: #fbcfe8 !important; }
            .border-gray-200 { border-color: #e5e7eb !important; }
            
            /* Remove gradients but preserve other backgrounds */
            .bg-gradient-to-r, .bg-linear-to-br, .bg-linear-to-r {
              background: #ffffff !important;
              background-image: none !important;
            }
            
            /* Chart container styling */
            .recharts-wrapper {
              width: 100% !important;
              height: auto !important;
              min-height: 250px !important;
            }
            
            /* SVG chart fixes - preserve colors but remove animations */
            svg {
              overflow: visible !important;
            }
            
            svg text {
              font-family: system-ui, -apple-system, sans-serif !important;
              fill: #374151 !important;
            }
            
            /* Nivo chart specific fixes */
            .nivo-container {
              width: 100% !important;
              height: 300px !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          
          // Only remove style attributes that contain oklch, preserve others
          const problematicElements = clonedDoc.querySelectorAll('[style*="oklch"]');
          problematicElements.forEach(el => {
            const style = el.getAttribute('style');
            if (style) {
              // Remove only oklch parts, keep other styles
              const cleanStyle = style.replace(/[^;]*oklch[^;]*;?/g, '');
              if (cleanStyle.trim()) {
                el.setAttribute('style', cleanStyle);
              } else {
                el.removeAttribute('style');
              }
            }
          });
          
          // Remove gradient classes but preserve other classes
          const gradientElements = clonedDoc.querySelectorAll('[class*="gradient"], [class*="linear"]');
          gradientElements.forEach(el => {
            if (typeof el.className === 'string') {
              el.className = el.className.replace(/\b[\w-]*gradient[\w-]*\b|\b[\w-]*linear[\w-]*\b/g, '').trim();
            } else if (el.className && typeof (el.className as any).baseVal === 'string') {
              (el.className as any).baseVal = (el.className as any).baseVal.replace(/\b[\w-]*gradient[\w-]*\b|\b[\w-]*linear[\w-]*\b/g, '').trim();
            }
          });
        }
      });

      console.log("Canvas created successfully:", {
        width: canvas.width,
        height: canvas.height
      });
      
      // Validate canvas dimensions
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error(`Invalid canvas dimensions: ${canvas.width}x${canvas.height}`);
      }

      console.log("Converting to image data...");
      const imgData = canvas.toDataURL("image/png");
      
      if (!imgData || imgData === "data:,") {
        throw new Error("Failed to generate image data from canvas");
      }

      console.log("Creating PDF...");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      console.log("PDF dimensions:", { pdfWidth, pdfHeight });

      // Handle multi-page PDFs if content is too long
      const maxPageHeight = pdf.internal.pageSize.getHeight();
      
      if (pdfHeight > maxPageHeight) {
        console.log("Creating multi-page PDF...");
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= maxPageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
          heightLeft -= maxPageHeight;
        }
      } else {
        console.log("Creating single-page PDF...");
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      }

      console.log("Saving PDF...");
      pdf.save("Employee_Assessment_Report.pdf");
      console.log("PDF generated successfully!");
      
    } catch (error) {
      console.error("Detailed error generating PDF:", error);
      console.error("Error stack:", (error as Error)?.stack);
      
      // Try a simpler approach as fallback - ignore SVG elements completely
      console.log("Attempting fallback PDF generation (ignoring charts)...");
      try {
        const canvas = await html2canvas(element, {
          scale: 0.5,
          backgroundColor: "#ffffff",
          logging: false,
          ignoreElements: (element) => {
            // Skip all SVG elements and problematic elements
            const tagName = element.tagName?.toLowerCase();
            return tagName === "svg" || tagName === "script" || tagName === "style" || 
                   element.closest('svg') !== null ||
                   element.className?.includes?.('recharts') ||
                   element.className?.includes?.('nivo');
          },
          onclone: (clonedDoc) => {
            // Ultra-simple styling for fallback
            const style = clonedDoc.createElement("style");
            style.textContent = `
              * { 
                color: #374151 !important; 
                background: #ffffff !important;
                background-color: #ffffff !important;
                background-image: none !important;
                border-color: #e5e7eb !important;
                animation: none !important;
                transition: none !important;
                transform: none !important;
                box-shadow: none !important;
                font-family: Arial, sans-serif !important;
              }
              h1, h2, h3, h4 { 
                color: #1f2937 !important; 
                font-weight: bold !important; 
                margin: 1rem 0 !important;
                font-family: Arial, sans-serif !important;
              }
              p, div, span { 
                font-family: Arial, sans-serif !important;
                line-height: 1.5 !important;
              }
              section { 
                background: #f9fafb !important; 
                padding: 1rem !important; 
                margin: 1rem 0 !important; 
                border: 1px solid #e5e7eb !important;
              }
              .space-y-10 > * + * { margin-top: 2rem !important; }
              .space-y-6 > * + * { margin-top: 1rem !important; }
              .grid { display: block !important; }
              .grid > * { margin-bottom: 1rem !important; }
            `;
            clonedDoc.head.appendChild(style);
            
            // Remove all SVG elements and chart containers completely
            const svgElements = clonedDoc.querySelectorAll('svg, .recharts-wrapper, [class*="recharts"], [class*="nivo"]');
            svgElements.forEach(el => {
              const replacement = clonedDoc.createElement('div');
              replacement.textContent = '[Chart - Not available in PDF version]';
              replacement.style.cssText = 'padding: 2rem; text-align: center; background: #f3f4f6; border: 1px solid #d1d5db; color: #6b7280; font-family: Arial, sans-serif; margin: 1rem 0;';
              el.parentNode?.replaceChild(replacement, el);
            });
            
            // Clean up any remaining problematic elements
            const problematicEls = clonedDoc.querySelectorAll('[style*="oklch"], [class*="gradient"]');
            problematicEls.forEach(el => {
              el.removeAttribute('style');
            });
          }
        });
        
        if (canvas.width > 0 && canvas.height > 0) {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight()));
          pdf.save("Employee_Assessment_Report.pdf");
          console.log("Fallback PDF generated successfully!");
          return;
        }
      } catch (fallbackError) {
        console.error("Fallback PDF generation also failed:", fallbackError);
        
        // Last resort: Create a simple text-only PDF
        console.log("Attempting text-only PDF generation...");
        try {
          const pdf = new jsPDF("p", "mm", "a4");
          const pageWidth = pdf.internal.pageSize.getWidth();
          const margin = 20;
          let yPosition = margin;
          
          // Add title
          pdf.setFontSize(16);
          pdf.text("Employee Assessment Report", margin, yPosition);
          yPosition += 15;
          
          // Add basic info
          pdf.setFontSize(12);
          pdf.text(`Employee: ${assessmentData.employee.name}`, margin, yPosition);
          yPosition += 10;
          pdf.text(`Department: ${assessmentData.employee.department}`, margin, yPosition);
          yPosition += 10;
          pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
          yPosition += 20;
          
          // Add overview text
          pdf.setFontSize(14);
          pdf.text("Overview:", margin, yPosition);
          yPosition += 10;
          
          pdf.setFontSize(10);
          overviewText.forEach((paragraph) => {
            const lines = pdf.splitTextToSize(paragraph, pageWidth - 2 * margin);
            lines.forEach((line: string) => {
              if (yPosition > 280) { // Near bottom of page
                pdf.addPage();
                yPosition = margin;
              }
              pdf.text(line, margin, yPosition);
              yPosition += 5;
            });
            yPosition += 5;
          });
          
          pdf.text("Note: Charts and visualizations are not available in this text-only version.", margin, yPosition + 10);
          
          pdf.save("Employee_Assessment_Report_TextOnly.pdf");
          console.log("Text-only PDF generated successfully!");
          return;
        } catch (textOnlyError) {
          console.error("Even text-only PDF generation failed:", textOnlyError);
        }
      }
      
      // More specific error messages
      let errorMessage = "There was an error generating the PDF. ";
      const errorMsg = (error as Error)?.message || "";
      
      if (errorMsg.includes("html2canvas") || errorMsg.includes("oklch")) {
        errorMessage += "Issue with capturing the page content (color format incompatibility). ";
      } else if (errorMsg.includes("jsPDF")) {
        errorMessage += "Issue with PDF creation. ";
      } else if (errorMsg.includes("toDataURL")) {
        errorMessage += "Issue with image conversion. ";
      } else if (errorMsg.includes("canvas dimensions")) {
        errorMessage += "Issue with page layout or size. ";
      }
      
      errorMessage += "Please check the console for more details and try again.";
      
      alert(errorMessage);
    }
  };

  return (
    <button
      onClick={generatePDF}
      className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
    >
      📄 Download PDF Report
    </button>
  );
};

export default AssessmentReportPdf;