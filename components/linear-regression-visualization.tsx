"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pause, Play, SkipForward, RefreshCw, Download } from "lucide-react"
import DataChart from "./data-chart"
import LossChart from "./loss-chart"
import ParameterChart from "./parameter-chart"
import ParameterTable from "./parameter-table"
import LossLandscape from "./loss-landscape"
import FunctionInput from "./function-input"

export default function LinearRegressionVisualization() {
  // Function parameters
  const [trueSlope, setTrueSlope] = useState(7)
  const [trueIntercept, setTrueIntercept] = useState(3)
  const [numPoints, setNumPoints] = useState(50)
  const [trainTestSplit, setTrainTestSplit] = useState(80) // 80% training, 20% testing
  const [functionType, setFunctionType] = useState("linear") // linear, polynomial, custom
  const [polynomialDegree, setPolynomialDegree] = useState(2)
  const [customFunction, setCustomFunction] = useState("7 * x + 3 + Math.sin(x) * 5")

  // Configuration parameters
  const [epochs, setEpochs] = useState(50)
  const [learningRate, setLearningRate] = useState(0.01)
  const [noiseLevel, setNoiseLevel] = useState(5)
  const [speed, setSpeed] = useState(200)
  const [batchSize, setBatchSize] = useState(10)
  const [optimizer, setOptimizer] = useState("sgd")
  const [showTrueLine, setShowTrueLine] = useState(true)
  const [showPredictionLines, setShowPredictionLines] = useState(true)
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(false)
  const [showDataLabels, setShowDataLabels] = useState(false)
  const [autoScale, setAutoScale] = useState(true)
  const [showTestData, setShowTestData] = useState(true)

  // Training state
  const [trainingData, setTrainingData] = useState([])
  const [testingData, setTestingData] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [m, setM] = useState(0) // Slope
  const [c, setC] = useState(0) // Intercept
  const [trainingLossHistory, setTrainingLossHistory] = useState([])
  const [testingLossHistory, setTestingLossHistory] = useState([])
  const [epochHistory, setEpochHistory] = useState([])
  const [mHistory, setMHistory] = useState([])
  const [cHistory, setCHistory] = useState([])
  const [gradientHistory, setGradientHistory] = useState([])
  const [selectedEpoch, setSelectedEpoch] = useState(0)
  const [stepMode, setStepMode] = useState(false)

  const animationRef = useRef(null)

  // Evaluate the true function based on the selected function type
  const evaluateTrueFunction = (x) => {
    if (functionType === "linear") {
      return trueSlope * x + trueIntercept
    } else if (functionType === "polynomial") {
      let result = 0
      for (let i = 0; i <= polynomialDegree; i++) {
        if (i === 0) {
          result += trueIntercept // constant term
        } else if (i === 1) {
          result += trueSlope * x // linear term
        } else {
          result += (trueSlope / i) * Math.pow(x, i) // higher order terms with decreasing coefficients
        }
      }
      return result
    } else if (functionType === "custom") {
      try {
        // Using Function constructor to evaluate the custom function
        // This is safe in this context as it's user-defined and not exposed to external inputs
        return new Function("x", `return ${customFunction}`)(x)
      } catch (error) {
        console.error("Error evaluating custom function:", error)
        return trueSlope * x + trueIntercept // Fallback to linear
      }
    }
    return trueSlope * x + trueIntercept // Default fallback
  }

  // Generate dataset with noise based on the true function
  const generateData = () => {
    const allData = []
    const xMin = 0
    const xMax = 10

    for (let i = 0; i < numPoints; i++) {
      const x = xMin + Math.random() * (xMax - xMin)
      // Add random noise
      const noise = (Math.random() - 0.5) * 2 * noiseLevel
      const y = evaluateTrueFunction(x) + noise
      allData.push({ x, y })
    }

    // Sort by x value for better visualization
    allData.sort((a, b) => a.x - b.x)

    // Split into training and testing sets
    const splitIndex = Math.floor(allData.length * (trainTestSplit / 100))
    const training = allData.slice(0, splitIndex)
    const testing = allData.slice(splitIndex)

    return { training, testing }
  }

  // Calculate MSE loss
  const calculateLoss = (m, c, data) => {
    if (data.length === 0) return 0

    let loss = 0
    for (let i = 0; i < data.length; i++) {
      const { x, y } = data[i]
      const yPred = m * x + c
      loss += Math.pow(y - yPred, 2)
    }
    return loss / data.length
  }

  // Single step of gradient descent
  const gradientDescentStep = (currentM, currentC, data, learningRate) => {
    let mGradient = 0
    let cGradient = 0
    const n = data.length

    if (n === 0) return { m: currentM, c: currentC, mGradient: 0, cGradient: 0 }

    // For SGD, select a random batch
    let batchData = data
    if (optimizer === "sgd" && batchSize < data.length) {
      batchData = []
      const indices = new Set()
      while (indices.size < Math.min(batchSize, data.length)) {
        indices.add(Math.floor(Math.random() * data.length))
      }
      Array.from(indices).forEach((i) => batchData.push(data[i]))
    }

    for (let i = 0; i < batchData.length; i++) {
      const { x, y } = batchData[i]
      const yPred = currentM * x + currentC
      mGradient += (-2 / batchData.length) * x * (y - yPred)
      cGradient += (-2 / batchData.length) * (y - yPred)
    }

    // Apply different optimizers
    let newM, newC

    if (optimizer === "momentum") {
      // Simple momentum implementation
      const momentum = 0.9
      const prevMGradient = gradientHistory.length > 0 ? gradientHistory[gradientHistory.length - 1].m : 0
      const prevCGradient = gradientHistory.length > 0 ? gradientHistory[gradientHistory.length - 1].c : 0

      const mStep = momentum * prevMGradient - learningRate * mGradient
      const cStep = momentum * prevCGradient - learningRate * cGradient

      newM = currentM + mStep
      newC = currentC + cStep

      setGradientHistory((prev) => [...prev, { m: mStep, c: cStep }])
    } else if (optimizer === "rmsprop") {
      // Simple RMSProp implementation
      const beta = 0.9
      const epsilon = 1e-8

      const prevMSqGrad =
        gradientHistory.length > 0 ? gradientHistory[gradientHistory.length - 1].mSq : mGradient * mGradient
      const prevCSqGrad =
        gradientHistory.length > 0 ? gradientHistory[gradientHistory.length - 1].cSq : cGradient * cGradient

      const mSqGrad = beta * prevMSqGrad + (1 - beta) * mGradient * mGradient
      const cSqGrad = beta * prevCSqGrad + (1 - beta) * cGradient * cGradient

      newM = currentM - (learningRate * mGradient) / (Math.sqrt(mSqGrad) + epsilon)
      newC = currentC - (learningRate * cGradient) / (Math.sqrt(cSqGrad) + epsilon)

      setGradientHistory((prev) => [...prev, { mSq: mSqGrad, cSq: cSqGrad }])
    } else {
      // Default SGD
      newM = currentM - learningRate * mGradient
      newC = currentC - learningRate * cGradient

      setGradientHistory((prev) => [...prev, { m: mGradient, c: cGradient }])
    }

    return { m: newM, c: newC, mGradient, cGradient }
  }

  // Initialize
  useEffect(() => {
    resetTraining()
  }, [noiseLevel, trueSlope, trueIntercept, numPoints, trainTestSplit, functionType, polynomialDegree, customFunction])

  const resetTraining = () => {
    const { training, testing } = generateData()
    setTrainingData(training)
    setTestingData(testing)

    // Initialize with random values
    const initialM = Math.random() * 2
    const initialC = Math.random() * 2
    setM(initialM)
    setC(initialC)

    setCurrentEpoch(0)
    setTrainingLossHistory([])
    setTestingLossHistory([])
    setEpochHistory([])
    setMHistory([initialM])
    setCHistory([initialC])
    setGradientHistory([])
    setSelectedEpoch(0)
  }

  // Run the learning process
  const runLinearRegression = () => {
    setIsRunning(true)
    setIsPaused(false)

    if (currentEpoch === 0) {
      // Reset with random values if starting from beginning
      const initialM = Math.random() * 2
      const initialC = Math.random() * 2
      setM(initialM)
      setC(initialC)

      setTrainingLossHistory([])
      setTestingLossHistory([])
      setEpochHistory([])
      setMHistory([initialM])
      setCHistory([initialC])
      setGradientHistory([])

      // Store the initial loss
      const initialTrainingLoss = calculateLoss(initialM, initialC, trainingData)
      const initialTestingLoss = calculateLoss(initialM, initialC, testingData)
      setTrainingLossHistory([initialTrainingLoss])
      setTestingLossHistory([initialTestingLoss])
      setEpochHistory([0])
    }
  }

  const pauseTraining = () => {
    setIsPaused(!isPaused)
  }

  const stepForward = () => {
    if (currentEpoch >= epochs) return

    // Calculate new m and c with gradient descent
    const { m: newM, c: newC } = gradientDescentStep(m, c, trainingData, learningRate)
    setM(newM)
    setC(newC)

    // Calculate loss with new parameters
    const newTrainingLoss = calculateLoss(newM, newC, trainingData)
    const newTestingLoss = calculateLoss(newM, newC, testingData)

    // Update histories
    setTrainingLossHistory((prev) => [...prev, newTrainingLoss])
    setTestingLossHistory((prev) => [...prev, newTestingLoss])
    setEpochHistory((prev) => [...prev, currentEpoch + 1])
    setMHistory((prev) => [...prev, newM])
    setCHistory((prev) => [...prev, newC])

    // Increment epoch
    setCurrentEpoch((prev) => prev + 1)
    setSelectedEpoch(currentEpoch + 1)
  }

  // Animation frame
  useEffect(() => {
    if (!isRunning || isPaused || stepMode) return

    if (currentEpoch >= epochs) {
      setIsRunning(false)
      return
    }

    const timeoutId = setTimeout(() => {
      stepForward()
    }, speed)

    return () => clearTimeout(timeoutId)
  }, [
    currentEpoch,
    isRunning,
    isPaused,
    stepMode,
    m,
    c,
    trainingData,
    learningRate,
    epochs,
    speed,
    optimizer,
    batchSize,
  ])

  // Calculate confidence intervals
  const calculateConfidenceIntervals = () => {
    // Simple approximation of confidence intervals
    const stdDev = Math.sqrt(trainingLossHistory[trainingLossHistory.length - 1] || 0)
    return {
      upper: { m: m + stdDev, c: c + stdDev },
      lower: { m: m - stdDev, c: c - stdDev },
    }
  }

  // Export data as CSV
  const exportData = () => {
    let csv = "epoch,slope,intercept,training_loss,testing_loss\n"

    for (let i = 0; i < epochHistory.length; i++) {
      csv += `${epochHistory[i]},${mHistory[i]},${cHistory[i]},${trainingLossHistory[i]},${testingLossHistory[i]}\n`
    }

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", "linear_regression_data.csv")
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Calculate R-squared
  const calculateRSquared = (data) => {
    if (data.length === 0) return 0

    const yMean = data.reduce((sum, point) => sum + point.y, 0) / data.length

    let ssTotal = 0
    let ssResidual = 0

    for (const point of data) {
      const yPred = m * point.x + c
      ssTotal += Math.pow(point.y - yMean, 2)
      ssResidual += Math.pow(point.y - yPred, 2)
    }

    return 1 - ssResidual / ssTotal
  }

  const confidenceIntervals = calculateConfidenceIntervals()
  const trainingRSquared = calculateRSquared(trainingData)
  const testingRSquared = calculateRSquared(testingData)

  // Get function description for display
  const getFunctionDescription = () => {
    if (functionType === "linear") {
      return `y = ${trueSlope}x + ${trueIntercept}`
    } else if (functionType === "polynomial") {
      const terms = []
      for (let i = polynomialDegree; i >= 0; i--) {
        if (i === 0) {
          terms.push(`${trueIntercept}`)
        } else if (i === 1) {
          terms.push(`${trueSlope}x`)
        } else {
          terms.push(`${(trueSlope / i).toFixed(2)}x^${i}`)
        }
      }
      return `y = ${terms.join(" + ")}`
    } else {
      return `y = ${customFunction}`
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          <div className="flex flex-col space-y-2">
            <h2 className="text-xl font-bold">Linear Regression Learning Process</h2>
            <p className="text-gray-700">True function: {getFunctionDescription()} (with noise)</p>
            <p className="text-gray-700">
              Current model: y = {m.toFixed(4)}x + {c.toFixed(4)}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentEpoch / epochs) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm whitespace-nowrap">
                Epoch: {currentEpoch} / {epochs}
              </span>
            </div>
            {trainingLossHistory.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-gray-500">Training Loss (MSE):</p>
                  <p className="font-medium">{trainingLossHistory[trainingLossHistory.length - 1].toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Testing Loss (MSE):</p>
                  <p className="font-medium">{testingLossHistory[testingLossHistory.length - 1].toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Training R²:</p>
                  <p className="font-medium">{trainingRSquared.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Testing R²:</p>
                  <p className="font-medium">{testingRSquared.toFixed(4)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={runLinearRegression}
              disabled={isRunning && !isPaused && !stepMode}
              className="flex items-center gap-2"
            >
              <Play size={16} />
              {isRunning && !isPaused ? "Running..." : "Start Training"}
            </Button>

            {isRunning && (
              <Button onClick={pauseTraining} variant="outline" className="flex items-center gap-2">
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
            )}

            {stepMode && (
              <Button
                onClick={stepForward}
                variant="outline"
                disabled={currentEpoch >= epochs || (!isRunning && !isPaused)}
                className="flex items-center gap-2"
              >
                <SkipForward size={16} />
                Step Forward
              </Button>
            )}

            <Button
              onClick={resetTraining}
              variant="outline"
              disabled={isRunning && !isPaused && !stepMode}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              New Dataset
            </Button>

            <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              Export Data
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <Tabs defaultValue="visualization">
            <TabsList className="mb-4">
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="landscape">Loss Landscape</TabsTrigger>
              <TabsTrigger value="function">Function Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="visualization" className="h-[400px]">
              <DataChart
                trainingData={trainingData}
                testingData={testingData}
                m={m}
                c={c}
                functionType={functionType}
                evaluateTrueFunction={evaluateTrueFunction}
                showTrueLine={showTrueLine}
                showPredictionLines={showPredictionLines}
                showConfidenceInterval={showConfidenceInterval}
                confidenceIntervals={confidenceIntervals}
                showDataLabels={showDataLabels}
                autoScale={autoScale}
                mHistory={mHistory}
                cHistory={cHistory}
                selectedEpoch={selectedEpoch}
                showTestData={showTestData}
              />
            </TabsContent>

            <TabsContent value="landscape" className="h-[400px]">
              <LossLandscape
                data={trainingData}
                currentM={m}
                currentC={c}
                mHistory={mHistory}
                cHistory={cHistory}
                lossHistory={trainingLossHistory}
                trueSlope={trueSlope}
                trueIntercept={trueIntercept}
              />
            </TabsContent>

            <TabsContent value="function" className="h-[400px] overflow-y-auto">
              <FunctionInput
                functionType={functionType}
                setFunctionType={setFunctionType}
                trueSlope={trueSlope}
                setTrueSlope={setTrueSlope}
                trueIntercept={trueIntercept}
                setTrueIntercept={setTrueIntercept}
                polynomialDegree={polynomialDegree}
                setPolynomialDegree={setPolynomialDegree}
                customFunction={customFunction}
                setCustomFunction={setCustomFunction}
                numPoints={numPoints}
                setNumPoints={setNumPoints}
                trainTestSplit={trainTestSplit}
                setTrainTestSplit={setTrainTestSplit}
                noiseLevel={noiseLevel}
                setNoiseLevel={setNoiseLevel}
                isRunning={isRunning && !isPaused}
              />
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Training Parameters</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="epochs">Epochs: {epochs}</Label>
              </div>
              <Slider
                id="epochs"
                value={[epochs]}
                onValueChange={(value) => setEpochs(value[0])}
                min={1}
                max={200}
                step={1}
                disabled={isRunning && !isPaused}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="learningRate">Learning Rate: {learningRate}</Label>
              </div>
              <Slider
                id="learningRate"
                value={[learningRate * 1000]}
                onValueChange={(value) => setLearningRate(value[0] / 1000)}
                min={1}
                max={100}
                step={1}
                disabled={isRunning && !isPaused}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="speed">Animation Speed: {speed}ms</Label>
              </div>
              <Slider
                id="speed"
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={10}
                max={500}
                step={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="optimizer">Optimizer</Label>
              <Select value={optimizer} onValueChange={setOptimizer} disabled={isRunning && !isPaused}>
                <SelectTrigger>
                  <SelectValue placeholder="Select optimizer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sgd">Stochastic Gradient Descent</SelectItem>
                  <SelectItem value="momentum">Momentum</SelectItem>
                  <SelectItem value="rmsprop">RMSProp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {optimizer === "sgd" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="batchSize">Batch Size: {batchSize}</Label>
                </div>
                <Slider
                  id="batchSize"
                  value={[batchSize]}
                  onValueChange={(value) => setBatchSize(value[0])}
                  min={1}
                  max={Math.min(50, trainingData.length)}
                  step={1}
                  disabled={isRunning && !isPaused}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="stepMode"
                checked={stepMode}
                onCheckedChange={setStepMode}
                disabled={isRunning && !isPaused}
              />
              <Label htmlFor="stepMode">Step-by-step Mode</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="showTestData" checked={showTestData} onCheckedChange={setShowTestData} />
              <Label htmlFor="showTestData">Show Test Data</Label>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Loss History</h3>
          <div className="h-[300px]">
            <LossChart
              trainingLossHistory={trainingLossHistory}
              testingLossHistory={testingLossHistory}
              epochHistory={epochHistory}
              selectedEpoch={selectedEpoch}
              setSelectedEpoch={setSelectedEpoch}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Parameter History</h3>
          <div className="h-[300px]">
            <ParameterChart
              mHistory={mHistory}
              cHistory={cHistory}
              epochHistory={epochHistory}
              trueSlope={trueSlope}
              trueIntercept={trueIntercept}
              selectedEpoch={selectedEpoch}
              setSelectedEpoch={setSelectedEpoch}
              functionType={functionType}
            />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Parameter History</h3>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Switch id="showTrueLine" checked={showTrueLine} onCheckedChange={setShowTrueLine} />
              <Label htmlFor="showTrueLine">Show True Line</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="showPredictionLines" checked={showPredictionLines} onCheckedChange={setShowPredictionLines} />
              <Label htmlFor="showPredictionLines">Show History Lines</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showConfidenceInterval"
                checked={showConfidenceInterval}
                onCheckedChange={setShowConfidenceInterval}
              />
              <Label htmlFor="showConfidenceInterval">Show Confidence Interval</Label>
            </div>
          </div>
        </div>

        <div className="h-[300px] overflow-auto">
          <ParameterTable
            epochHistory={epochHistory}
            mHistory={mHistory}
            cHistory={cHistory}
            trainingLossHistory={trainingLossHistory}
            testingLossHistory={testingLossHistory}
            selectedEpoch={selectedEpoch}
            setSelectedEpoch={setSelectedEpoch}
          />
        </div>
      </Card>
    </div>
  )
}
