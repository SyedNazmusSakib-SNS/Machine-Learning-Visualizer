"use client"

import { useRef, useEffect } from "react"
import type { LinearRegressionModel } from "@/lib/linear-regression"

interface RegressionVisualizerProps {
  data: { x: number; y: number }[]
  model: LinearRegressionModel
  trueSlope: number
  trueIntercept: number
}

export default function RegressionVisualizer({ data, model, trueSlope, trueIntercept }: RegressionVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Find data range
    let minX = Math.min(...data.map((p) => p.x))
    let maxX = Math.max(...data.map((p) => p.x))
    let minY = Math.min(...data.map((p) => p.y))
    let maxY = Math.max(...data.map((p) => p.y))

    // Add padding to range
    const padding = 0.1
    const rangeX = maxX - minX
    const rangeY = maxY - minY
    minX -= rangeX * padding
    maxX += rangeX * padding
    minY -= rangeY * padding
    maxY += rangeY * padding

    // Scale function to convert data coordinates to canvas coordinates
    const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * width
    const scaleY = (y: number) => height - ((y - minY) / (maxY - minY)) * height

    // Draw axes
    ctx.strokeStyle = "#ccc"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, scaleY(0))
    ctx.lineTo(width, scaleY(0))
    ctx.moveTo(scaleX(0), 0)
    ctx.lineTo(scaleX(0), height)
    ctx.stroke()

    // Draw data points
    ctx.fillStyle = "rgba(59, 130, 246, 0.6)"
    data.forEach((point) => {
      ctx.beginPath()
      ctx.arc(scaleX(point.x), scaleY(point.y), 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw true line (dashed)
    ctx.strokeStyle = "rgba(16, 185, 129, 0.7)"
    ctx.lineWidth = 2
    ctx.setLineDash([5, 3])
    ctx.beginPath()
    ctx.moveTo(scaleX(minX), scaleY(trueSlope * minX + trueIntercept))
    ctx.lineTo(scaleX(maxX), scaleY(trueSlope * maxX + trueIntercept))
    ctx.stroke()

    // Draw current model line
    ctx.strokeStyle = "rgba(239, 68, 68, 0.9)"
    ctx.lineWidth = 2
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.moveTo(scaleX(minX), scaleY(model.predict(minX)))
    ctx.lineTo(scaleX(maxX), scaleY(model.predict(maxX)))
    ctx.stroke()

    // Add legend
    ctx.font = "12px sans-serif"
    ctx.fillStyle = "rgba(16, 185, 129, 1)"
    ctx.fillText("True Line (y = 7x + 3)", 10, 20)
    ctx.fillStyle = "rgba(239, 68, 68, 1)"
    ctx.fillText("Current Model", 10, 40)
  }, [data, model, trueSlope, trueIntercept])

  return <canvas ref={canvasRef} width={600} height={400} className="w-full h-auto border rounded-md bg-white" />
}
