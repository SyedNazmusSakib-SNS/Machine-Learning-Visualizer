"use client"

interface ParameterDisplayProps {
  currentEpoch: number
  totalEpochs: number
  slope: number
  intercept: number
  loss: number
}

export default function ParameterDisplay({ currentEpoch, totalEpochs, slope, intercept, loss }: ParameterDisplayProps) {
  return (
    <div className="mt-6 p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-medium mb-2">
        Current model: y = {slope.toFixed(4)}x + {intercept.toFixed(4)}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Epoch:</p>
          <p className="font-medium">
            {currentEpoch} / {totalEpochs}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Current Loss (MSE):</p>
          <p className="font-medium">{loss.toFixed(4)}</p>
        </div>
      </div>

      <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${(currentEpoch / totalEpochs) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}
