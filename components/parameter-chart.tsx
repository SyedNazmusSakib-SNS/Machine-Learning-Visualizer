"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import "chart.js/auto"

Chart.register(...registerables)

interface ParameterChartProps {
  mHistory: number[]
  cHistory: number[]
  epochHistory: number[]
  trueSlope: number
  trueIntercept: number
  selectedEpoch: number
  setSelectedEpoch: (epoch: number) => void
}

export default function ParameterChart({
  mHistory,
  cHistory,
  epochHistory,
  trueSlope,
  trueIntercept,
  selectedEpoch,
  setSelectedEpoch,
}: ParameterChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || mHistory.length === 0) return

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
            label: "Slope (m)",
            data: mHistory,
            borderColor: "rgba(255, 159, 64, 1)",
            backgroundColor: "rgba(255, 159, 64, 0.2)",
            fill: false,
            tension: 0.1,
            yAxisID: "y",
            pointRadius: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? 6 : 3
            },
            pointBackgroundColor: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? "rgba(220, 38, 38, 1)" : "rgba(255, 159, 64, 1)"
            },
            pointBorderColor: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? "rgba(220, 38, 38, 1)" : "rgba(255, 159, 64, 1)"
            },
            pointBorderWidth: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? 2 : 1
            },
          },
          {
            label: "Intercept (c)",
            data: cHistory,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: false,
            tension: 0.1,
            yAxisID: "y1",
            pointRadius: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? 6 : 3
            },
            pointBackgroundColor: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? "rgba(220, 38, 38, 1)" : "rgba(75, 192, 192, 1)"
            },
            pointBorderColor: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? "rgba(220, 38, 38, 1)" : "rgba(75, 192, 192, 1)"
            },
            pointBorderWidth: (ctx) => {
              const index = ctx.dataIndex
              return epochHistory[index] === selectedEpoch ? 2 : 1
            },
          },
          {
            label: "True Slope",
            data: Array(epochHistory.length).fill(trueSlope),
            borderColor: "rgba(255, 159, 64, 0.5)",
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            yAxisID: "y",
          },
          {
            label: "True Intercept",
            data: Array(epochHistory.length).fill(trueIntercept),
            borderColor: "rgba(75, 192, 192, 0.5)",
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Slope (m)",
            },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Intercept (c)",
            },
            grid: {
              drawOnChartArea: false,
            },
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
                const label = context.dataset.label || ""
                const value = context.parsed.y
                return `${label}: ${value.toFixed(4)}`
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
  }, [mHistory, cHistory, epochHistory, trueSlope, trueIntercept, selectedEpoch, setSelectedEpoch])

  if (mHistory.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        Start training to see parameter history
      </div>
    )
  }

  return <canvas ref={chartRef} />
}
