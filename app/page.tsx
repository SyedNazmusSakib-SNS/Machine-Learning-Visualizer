"use client"
import LinearRegressionVisualization from "@/components/linear-regression-visualization"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Linear Regression Learning Visualization</h1>
      <LinearRegressionVisualization />
    </main>
  )
}
