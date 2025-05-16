"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import "chart.js/auto"

Chart.register(...registerables)

interface LossLandscapeProps {
  data: { x: number; y: number }[]
  currentM: number
  currentC: number
  mHistory: number[]
  cHistory: number[]
  lossHistory: number[]
  trueSlope: number
  trueIntercept: number
}

export default function LossLandscape({
  data,
  currentM,
  currentC,
  mHistory,
  cHistory,
  lossHistory,
  trueSlope,
  trueIntercept,
}: LossLandscapeProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  // Calculate loss for a given m and c
  const calculateLoss = (m: number, c: number) => {
    let loss = 0
    for (let i = 0; i < data.length; i++) {
      const { x, y } = data[i]
      const yPred = m * x + c
      loss += Math.pow(y - yPred, 2)
    }
    return loss / data.length
  }

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Generate loss landscape data
    const mRange = 10
    const cRange = 10
    const mStep = 0.5
    const cStep = 0.5

    const mMin = Math.max(0, trueSlope - mRange / 2)
    const mMax = trueSlope + mRange / 2
    const cMin = Math.max(0, trueIntercept - cRange / 2)
    const cMax = trueIntercept + cRange / 2

    const contourData = []

    for (let m = mMin; m <= mMax; m += mStep) {
      for (let c = cMin; c <= cMax; c += cStep) {
        const loss = calculateLoss(m, c)
        contourData.push({
          x: m,
          y: c,
          z: loss,
        })
      }
    }

    // Create path data from history
    const pathData = mHistory.map((m, i) => ({
      x: m,
      y: cHistory[i],
    }))

    // Create chart
    chartInstance.current = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Loss Landscape",
            data: contourData,
            backgroundColor: (ctx) => {
              const value = ctx.raw as { z: number }
              // Normalize the loss value for color mapping
              const maxLoss = Math.max(...contourData.map((d) => d.z))
              const normalizedValue = value.z / maxLoss

              // Color gradient from blue (low loss) to red (high loss)
              const r = Math.floor(normalizedValue * 255)
              const g = Math.floor((1 - normalizedValue) * 100)
              const b = Math.floor((1 - normalizedValue) * 255)

              return `rgba(${r}, ${g}, ${b}, 0.7)`
            },
            pointRadius: 5,
            pointHoverRadius: 7,
          },
          {
            label: "Optimization Path",
            data: pathData,
            showLine: true,
            fill: false,
            borderColor: "rgba(255, 255, 255, 0.8)",
            borderWidth: 2,
            pointBackgroundColor: (ctx) => {
              const index = ctx.dataIndex
              // Color gradient along the path from blue to red
              const normalizedIndex = index / (pathData.length - 1)
              const r = Math.floor(normalizedIndex * 255)
              const g = Math.floor((1 - normalizedIndex) * 100)
              const b = Math.floor((1 - normalizedIndex) * 255)

              return `rgba(${r}, ${g}, ${b}, 1)`
            },
            pointBorderColor: "rgba(255, 255, 255, 0.8)",
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: "Current Position",
            data: [
              {
                x: currentM,
                y: currentC,
              },
            ],
            backgroundColor: "rgba(255, 255, 255, 1)",
            borderColor: "rgba(0, 0, 0, 1)",
            borderWidth: 2,
            pointRadius: 8,
            pointHoverRadius: 10,
          },
          {
            label: "True Parameters",
            data: [
              {
                x: trueSlope,
                y: trueIntercept,
              },
            ],
            backgroundColor: "rgba(16, 185, 129, 1)",
            borderColor: "rgba(0, 0, 0, 1)",
            borderWidth: 2,
            pointRadius: 8,
            pointStyle: "star",
            pointHoverRadius: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Slope (m)",
            },
            min: mMin,
            max: mMax,
          },
          y: {
            title: {
              display: true,
              text: "Intercept (c)",
            },
            min: cMin,
            max: cMax,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const dataset = context.dataset.label
                const point = context.raw as { x: number; y: number; z?: number }

                if (dataset === "Loss Landscape") {
                  return `m: ${point.x.toFixed(2)}, c: ${point.y.toFixed(2)}, loss: ${point.z?.toFixed(4)}`
                } else if (dataset === "Optimization Path") {
                  const index = context.dataIndex
                  return `Epoch ${index}: m=${point.x.toFixed(4)}, c=${point.y.toFixed(4)}, loss=${lossHistory[index]?.toFixed(4) || "N/A"}`
                } else if (dataset === "Current Position") {
                  return `Current: m=${point.x.toFixed(4)}, c=${point.y.toFixed(4)}`
                } else {
                  return `True: m=${point.x.toFixed(4)}, c=${point.y.toFixed(4)}`
                }
              },
            },
          },
          legend: {
            position: "bottom",
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, currentM, currentC, mHistory, cHistory, lossHistory, trueSlope, trueIntercept])

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        Start training to see loss landscape
      </div>
    )
  }

  return <canvas ref={chartRef} />
}
