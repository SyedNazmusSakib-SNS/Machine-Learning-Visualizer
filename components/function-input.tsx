"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"

interface FunctionInputProps {
  functionType: string
  setFunctionType: (type: string) => void
  trueSlope: number
  setTrueSlope: (slope: number) => void
  trueIntercept: number
  setTrueIntercept: (intercept: number) => void
  polynomialDegree: number
  setPolynomialDegree: (degree: number) => void
  customFunction: string
  setCustomFunction: (func: string) => void
  numPoints: number
  setNumPoints: (num: number) => void
  trainTestSplit: number
  setTrainTestSplit: (split: number) => void
  noiseLevel: number
  setNoiseLevel: (noise: number) => void
  isRunning: boolean
}

export default function FunctionInput({
  functionType,
  setFunctionType,
  trueSlope,
  setTrueSlope,
  trueIntercept,
  setTrueIntercept,
  polynomialDegree,
  setPolynomialDegree,
  customFunction,
  setCustomFunction,
  numPoints,
  setNumPoints,
  trainTestSplit,
  setTrainTestSplit,
  noiseLevel,
  setNoiseLevel,
  isRunning,
}: FunctionInputProps) {
  const [functionError, setFunctionError] = useState("")

  // Validate custom function
  useEffect(() => {
    if (functionType === "custom") {
      try {
        // Test with a sample value
        new Function("x", `return ${customFunction}`)(1)
        setFunctionError("")
      } catch (error) {
        setFunctionError(`Invalid function: ${error.message}`)
      }
    }
  }, [customFunction, functionType])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Function Settings</h3>
        <RadioGroup value={functionType} onValueChange={setFunctionType} disabled={isRunning}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="linear" id="linear" />
            <Label htmlFor="linear">Linear Function (y = mx + c)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="polynomial" id="polynomial" disabled={true} />
            <Label htmlFor="polynomial">Polynomial Function</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="custom" disabled={true} />
            <Label htmlFor="custom">Custom Function</Label>
          </div>
        </RadioGroup>
      </div>

      {functionType === "linear" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="trueSlope">Slope (m)</Label>
            <div className="flex items-center gap-2">
              <Slider
                id="trueSlope"
                value={[trueSlope]}
                onValueChange={(value) => setTrueSlope(value[0])}
                min={-10}
                max={10}
                step={0.1}
                disabled={isRunning}
                className="flex-1"
              />
              <Input
                type="number"
                value={trueSlope}
                onChange={(e) => setTrueSlope(Number.parseFloat(e.target.value) || 0)}
                disabled={isRunning}
                className="w-20"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="trueIntercept">Intercept (c)</Label>
            <div className="flex items-center gap-2">
              <Slider
                id="trueIntercept"
                value={[trueIntercept]}
                onValueChange={(value) => setTrueIntercept(value[0])}
                min={-10}
                max={10}
                step={0.1}
                disabled={isRunning}
                className="flex-1"
              />
              <Input
                type="number"
                value={trueIntercept}
                onChange={(e) => setTrueIntercept(Number.parseFloat(e.target.value) || 0)}
                disabled={isRunning}
                className="w-20"
              />
            </div>
          </div>
        </div>
      )}

      {functionType === "polynomial" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="polynomialDegree">Polynomial Degree</Label>
            <div className="flex items-center gap-2">
              <Slider
                id="polynomialDegree"
                value={[polynomialDegree]}
                onValueChange={(value) => setPolynomialDegree(value[0])}
                min={2}
                max={5}
                step={1}
                disabled={isRunning}
                className="flex-1"
              />
              <Input
                type="number"
                value={polynomialDegree}
                onChange={(e) => setPolynomialDegree(Number.parseInt(e.target.value) || 2)}
                min={2}
                max={5}
                disabled={isRunning}
                className="w-20"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="trueSlope">Linear Coefficient</Label>
            <div className="flex items-center gap-2">
              <Slider
                id="trueSlope"
                value={[trueSlope]}
                onValueChange={(value) => setTrueSlope(value[0])}
                min={-10}
                max={10}
                step={0.1}
                disabled={isRunning}
                className="flex-1"
              />
              <Input
                type="number"
                value={trueSlope}
                onChange={(e) => setTrueSlope(Number.parseFloat(e.target.value) || 0)}
                disabled={isRunning}
                className="w-20"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="trueIntercept">Constant Term</Label>
            <div className="flex items-center gap-2">
              <Slider
                id="trueIntercept"
                value={[trueIntercept]}
                onValueChange={(value) => setTrueIntercept(value[0])}
                min={-10}
                max={10}
                step={0.1}
                disabled={isRunning}
                className="flex-1"
              />
              <Input
                type="number"
                value={trueIntercept}
                onChange={(e) => setTrueIntercept(Number.parseFloat(e.target.value) || 0)}
                disabled={isRunning}
                className="w-20"
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">
              Polynomial function will be of the form: y = {trueIntercept} + {trueSlope}x + {(trueSlope / 2).toFixed(2)}
              x² + ...
            </p>
          </div>
        </div>
      )}

      {functionType === "custom" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="customFunction">Custom Function (JavaScript)</Label>
            <Textarea
              id="customFunction"
              value={customFunction}
              onChange={(e) => setCustomFunction(e.target.value)}
              placeholder="Enter a JavaScript expression with 'x' as the variable, e.g., '7 * x + 3 + Math.sin(x) * 5'"
              disabled={isRunning}
              className="font-mono"
              rows={3}
            />
            {functionError && <p className="text-red-500 text-sm mt-1">{functionError}</p>}
            <p className="text-sm text-gray-500 mt-1">
              Use JavaScript syntax. The variable 'x' represents the input value.
              <br />
              Examples:
              <br />- Linear: 7 * x + 3
              <br />- Quadratic: 2 * x * x + 3 * x + 1
              <br />- Sine: Math.sin(x) * 5 + 3
            </p>
          </div>
        </div>
      )}

      <div className="pt-4 border-t">
        <h3 className="text-lg font-semibold mb-4">Dataset Settings</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="numPoints">Number of Data Points: {numPoints}</Label>
            <Slider
              id="numPoints"
              value={[numPoints]}
              onValueChange={(value) => setNumPoints(value[0])}
              min={10}
              max={200}
              step={10}
              disabled={isRunning}
            />
          </div>

          <div>
            <Label htmlFor="trainTestSplit">
              Train/Test Split: {trainTestSplit}% / {100 - trainTestSplit}%
            </Label>
            <Slider
              id="trainTestSplit"
              value={[trainTestSplit]}
              onValueChange={(value) => setTrainTestSplit(value[0])}
              min={50}
              max={90}
              step={5}
              disabled={isRunning}
            />
          </div>

          <div>
            <Label htmlFor="noiseLevel">Noise Level: {noiseLevel}</Label>
            <Slider
              id="noiseLevel"
              value={[noiseLevel]}
              onValueChange={(value) => setNoiseLevel(value[0])}
              min={0}
              max={20}
              step={1}
              disabled={isRunning}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
