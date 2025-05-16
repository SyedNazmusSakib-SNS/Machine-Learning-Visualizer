export interface LinearRegressionModel {
  slope: number
  intercept: number
  predict: (x: number) => number
}

// Generate synthetic data following y = mx + c + noise
export function generateData(
  n: number,
  trueSlope: number,
  trueIntercept: number,
  noiseLevel: number,
): { x: number; y: number }[] {
  const data: { x: number; y: number }[] = []

  for (let i = 0; i < n; i++) {
    // Generate x values between -10 and 10
    const x = Math.random() * 20 - 10

    // Generate y with noise
    const noise = (Math.random() * 2 - 1) * noiseLevel
    const y = trueSlope * x + trueIntercept + noise

    data.push({ x, y })
  }

  return data
}

// Compute MSE loss
export function computeLoss(data: { x: number; y: number }[], model: LinearRegressionModel): number {
  let totalLoss = 0

  for (const point of data) {
    const prediction = model.predict(point.x)
    const error = prediction - point.y
    totalLoss += error * error
  }

  return totalLoss / data.length
}
