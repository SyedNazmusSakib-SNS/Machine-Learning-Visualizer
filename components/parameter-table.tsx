"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ParameterTableProps {
  epochHistory: number[]
  mHistory: number[]
  cHistory: number[]
  trainingLossHistory: number[]
  testingLossHistory: number[]
  selectedEpoch: number
  setSelectedEpoch: (epoch: number) => void
}

export default function ParameterTable({
  epochHistory,
  mHistory,
  cHistory,
  trainingLossHistory,
  testingLossHistory,
  selectedEpoch,
  setSelectedEpoch,
}: ParameterTableProps) {
  if (epochHistory.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        Start training to see parameter history
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Epoch</TableHead>
          <TableHead>Slope (m)</TableHead>
          <TableHead>Intercept (c)</TableHead>
          <TableHead>Training Loss</TableHead>
          <TableHead>Testing Loss</TableHead>
          <TableHead>Equation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {epochHistory.map((epoch, i) => (
          <TableRow
            key={epoch}
            className={epoch === selectedEpoch ? "bg-blue-50" : i % 2 === 0 ? "bg-gray-50" : ""}
            onClick={() => setSelectedEpoch(epoch)}
            style={{ cursor: "pointer" }}
          >
            <TableCell>{epoch}</TableCell>
            <TableCell>{mHistory[i].toFixed(4)}</TableCell>
            <TableCell>{cHistory[i].toFixed(4)}</TableCell>
            <TableCell>{trainingLossHistory[i].toFixed(4)}</TableCell>
            <TableCell>{testingLossHistory[i].toFixed(4)}</TableCell>
            <TableCell>
              y = {mHistory[i].toFixed(4)}x + {cHistory[i].toFixed(4)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
