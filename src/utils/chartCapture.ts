import html2canvas from 'html2canvas';

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
    // Find chart containers in the actual page
    const radialBarChart = reportRef.current.querySelector(
      '[data-chart-id="radialBar"]'
    );
    const radarChart = reportRef.current.querySelector(
      '[data-chart-id="radar"]'
    );
    const chordChart = reportRef.current.querySelector(
      '[data-chart-id="chord"]'
    );
    const areaBumpChart = reportRef.current.querySelector(
      '[data-chart-id="areaBump"]'
    );

    const charts = [
      {
        element: radialBarChart,
        id: "radialBar" as keyof ChartImages,
        name: "Radial Bar Chart",
      },
      {
        element: radarChart,
        id: "radar" as keyof ChartImages,
        name: "Radar Chart",
      },
      {
        element: chordChart,
        id: "chord" as keyof ChartImages,
        name: "Chord Chart",
      },
      {
        element: areaBumpChart,
        id: "areaBump" as keyof ChartImages,
        name: "Area Bump Chart",
      },
    ];

    console.log(
      `Found ${
        charts.filter((c) => c.element).length
      } chart elements to capture`
    );

    for (const chart of charts) {
      if (chart.element) {
        try {
          console.log(`Capturing ${chart.name}...`);

          // Wait for chart to be fully rendered
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check if the chart has SVG content (indicating it's rendered)
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
          } else {
            console.warn(
              `❌ Failed to capture ${chart.name}: Invalid data URL`
            );
          }
        } catch (error) {
          console.error(`❌ Failed to capture ${chart.name}:`, error);
        }
      } else {
        console.warn(`❌ Chart element not found for ${chart.name}`);
      }
    }

    const capturedCount = Object.keys(images).length;
    console.log(
      `Chart capture completed: ${capturedCount}/4 charts captured successfully`
    );

    return images;
  } catch (error) {
    console.error("Error during chart capture process:", error);
    return {};
  }
};
