"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import "chart.js/auto"

Chart.register(...registerables)

interface DataChartProps {
  trainingData: { x: number; y: number }[]
  testingData: { x: number; y: number }[]
  m: number
  c: number
  functionType: string
  evaluateTrueFunction: (x: number) => number
  showTrueLine: boolean
  showPredictionLines: boolean
  showConfidenceInterval: boolean
  confidenceIntervals: { upper: { m: number; c: number }; lower: { m: number; c: number } }
  showDataLabels: boolean
  autoScale: boolean
  mHistory: number[]
  cHistory: number[]
  selectedEpoch: number
  showTestData: boolean
}

export default function DataChart({
  trainingData,
  testingData,
  m,
  c,
  functionType,
  evaluateTrueFunction,
  showTrueLine,
  showPredictionLines,
  showConfidenceInterval,
  confidenceIntervals,
  showDataLabels,
  autoScale,
  mHistory,
  cHistory,
  selectedEpoch,
  showTestData,
}: DataChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Combine data for range calculation
    const allData = [...trainingData, ...(showTestData ? testingData : [])]

    if (allData.length === 0) return

    // Find data range
    const xValues = allData.map((point) => point.x)
    const yValues = allData.map((point) => point.y)

    const minX = Math.min(...xValues)
    const maxX = Math.max(...xValues)
    const minY = Math.min(...yValues)
    const maxY = Math.max(...yValues)

    // Add padding
    const xPadding = (maxX - minX) * 0.1
    const yPadding = (maxY - minY) * 0.1

    // Generate line data
    const numPoints = 100
    const lineX = Array.from({ length: numPoints }, (_, i) => minX + (i / (numPoints - 1)) * (maxX - minX))

    // Current model line
    const currentLine = lineX.map((x) => ({
      x,
      y: m * x + c,
    }))

    // True line
    const trueLine = lineX.map((x) => ({
      x,
      y: evaluateTrueFunction(x),
    }))

    // Confidence interval lines
    const upperLine = lineX.map((x) => ({
      x,
      y: confidenceIntervals.upper.m * x + confidenceIntervals.upper.c,
    }))

    const lowerLine = lineX.map((x) => ({
      x,
      y: confidenceIntervals.lower.m * x + confidenceIntervals.lower.c,
    }))

    // Historical lines (for selected epoch)
    const selectedLine = lineX.map((x) => ({
      x,
      y: mHistory[selectedEpoch] * x + cHistory[selectedEpoch],
    }))

    // Create datasets
    const datasets = [
      {
        label: "Training Data",
        data: trainingData,
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        pointRadius: 5,
        pointHoverRadius: 7,
        showLine: false,
        type: "scatter" as const,
      },
    ]

    // Add testing data if enabled
    if (showTestData) {
      datasets.push({
        label: "Testing Data",
        data: testingData,
        backgroundColor: "rgba(245, 158, 11, 0.6)",
        pointRadius: 5,
        pointHoverRadius: 7,
        showLine: false,
        type: "scatter" as const,
      })
    }

    // Add current line
    datasets.push({
      label: "Current Model",
      data: currentLine,
      borderColor: "rgba(239, 68, 68, 1)",
      borderWidth: 3,
      pointRadius: 0,
      fill: false,
      tension: 0,
    })

    // Add selected epoch line if different from current
    if (
      showPredictionLines &&
      selectedEpoch < mHistory.length &&
      (mHistory[selectedEpoch] !== m || cHistory[selectedEpoch] !== c)
    ) {
      datasets.push({
        label: `Epoch ${selectedEpoch} Model`,
        data: selectedLine,
        borderColor: "rgba(245, 158, 11, 0.8)",
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0,
      })
    }

    // Add true line
    if (showTrueLine) {
      datasets.push({
        label: "True Function",
        data: trueLine,
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        tension: 0,
      })
    }

    // Add confidence intervals
    if (showConfidenceInterval) {
      datasets.push({
        label: "Upper Confidence",
        data: upperLine,
        borderColor: "rgba(239, 68, 68, 0.3)",
        borderWidth: 1,
        borderDash: [3, 3],
        pointRadius: 0,
        fill: false,
        tension: 0,
      })

      datasets.push({
        label: "Lower Confidence",
        data: lowerLine,
        borderColor: "rgba(239, 68, 68, 0.3)",
        borderWidth: 1,
        borderDash: [3, 3],
        pointRadius: 0,
        fill: "+1",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0,
      })
    }

    // Add historical lines
    if (showPredictionLines) {
      // Add a subset of historical lines (to avoid cluttering)
      const step = Math.max(1, Math.floor(mHistory.length / 10))
      for (let i = 0; i < mHistory.length; i += step) {
        if (i === selectedEpoch) continue // Skip selected epoch as it's already added

        const histLine = lineX.map((x) => ({
          x,
          y: mHistory[i] * x + cHistory[i],
        }))

        datasets.push({
          label: `Epoch ${i}`,
          data: histLine,
          borderColor: `rgba(99, 102, 241, ${0.1 + (i / mHistory.length) * 0.5})`,
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
          tension: 0,
        })
      }
    }

    // Create chart
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "linear",
            position: "bottom",
            title: {
              display: true,
              text: "X",
            },
            min: autoScale ? minX - xPadding : 0,
            max: autoScale ? maxX + xPadding : 10,
          },
          y: {
            title: {
              display: true,
              text: "Y",
            },
            min: autoScale ? minY - yPadding : 0,
            max: autoScale ? maxY + yPadding : 80,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const point = context.raw as { x: number; y: number }
                return `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`
              },
            },
          },
          legend: {
            position: "bottom",
            labels: {
              filter: (item, chart) => {
                // Hide confidence interval labels if not showing them
                if (!showConfidenceInterval && (item.text === "Upper Confidence" || item.text === "Lower Confidence")) {
                  return false
                }
                return true
              },
            },
          },
        },
        animation: {
          duration: 0, // Disable animations for better performance
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [
    trainingData,
    testingData,
    m,
    c,
    functionType,
    evaluateTrueFunction,
    showTrueLine,
    showPredictionLines,
    showConfidenceInterval,
    confidenceIntervals,
    showDataLabels,
    autoScale,
    mHistory,
    cHistory,
    selectedEpoch,
    showTestData,
  ])

  if (trainingData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        Generate data to see visualization
      </div>
    )
  }

  return <canvas ref={chartRef} />
}
