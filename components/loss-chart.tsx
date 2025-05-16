"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import "chart.js/auto"

Chart.register(...registerables)

interface LossChartProps {
  trainingLossHistory: number[]
  testingLossHistory: number[]
  epochHistory: number[]
  selectedEpoch: number
  setSelectedEpoch: (epoch: number) => void
}

export default function LossChart({
  trainingLossHistory,
  testingLossHistory,
  epochHistory,
  selectedEpoch,
  setSelectedEpoch,
}: LossChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || trainingLossHistory.length === 0) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Create chart
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: epochHistory,
        datasets: [
          {
            label: "Training Loss (MSE)",
            data: trainingLossHistory,
            borderColor: "rgba(59, 130, 246, 1)",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            fill: true,
            tension: 0.1,
            pointRadius: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? 6 : 3
            },
            pointBackgroundColor: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? "rgba(220, 38, 38, 1)" : "rgba(59, 130, 246, 1)"
            },
            pointBorderColor: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? "rgba(220, 38, 38, 1)" : "rgba(59, 130, 246, 1)"
            },
            pointBorderWidth: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? 2 : 1
            },
          },
          {
            label: "Testing Loss (MSE)",
            data: testingLossHistory,
            borderColor: "rgba(245, 158, 11, 1)",
            backgroundColor: "rgba(245, 158, 11, 0.2)",
            fill: true,
            tension: 0.1,
            pointRadius: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? 6 : 3
            },
            pointBackgroundColor: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? "rgba(220, 38, 38, 1)" : "rgba(245, 158, 11, 1)"
            },
            pointBorderColor: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? "rgba(220, 38, 38, 1)" : "rgba(245, 158, 11, 1)"
            },
            pointBorderWidth: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? 2 : 1
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: "Mean Squared Error",
            },
            min: 0,
          },
          x: {
            title: {
              display: true,
              text: "Epoch",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const datasetLabel = context.dataset.label || ""
                return `${datasetLabel}: ${context.parsed.y.toFixed(4)}`
              },
            },
          },
          legend: {
            position: "bottom",
          },
        },
        onClick: (e, elements) => {
          if (elements && elements.length > 0) {
            const index = elements[0].index
            setSelectedEpoch(epochHistory[index])
          }
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [trainingLossHistory, testingLossHistory, epochHistory, selectedEpoch, setSelectedEpoch])

  if (trainingLossHistory.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        Start training to see loss history
      </div>
    )
  }

  return <canvas ref={chartRef} />
}
