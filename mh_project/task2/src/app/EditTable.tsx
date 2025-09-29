"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { arrayRowSchema, type CSVRow } from "@/types/gen";
import React, { useState } from "react";
import { toast } from "sonner";

interface EditTableProps {
  initialData: CSVRow[];
}

const EditTable: React.FC<EditTableProps> = ({ initialData }) => {
  const [data, setData] = useState<CSVRow[]>(initialData);
  const [installDependencies, setInstallDependencies] =
    useState<boolean>(false);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    column: string;
  } | null>(null);

  const [logs, setLogs] = useState<
    Array<{
      message: string;
      type: "info" | "success" | "error";
      timestamp: string;
    }>
  >([]);
  const [generationSessionId, setGenerationSessionId] = useState<string | null>(
    null,
  );
  const [isGenerationComplete, setIsGenerationComplete] =
    useState<boolean>(false);

  const { mutateAsync: updateData, isPaused: upDataPending } =
    api.site.updateCsv.useMutation({
      onSuccess: () => {
        toast.success("Data saved successfully");
      },
    });

  const { mutateAsync: generateApps, isPending: generateAppsPending } =
    api.site.generateApp.useMutation({
      onSuccess: (result) => {
        setGenerationSessionId(result.sessionId);
      },
      onError: (_error) => {
        toast.error("Failed to start generation");
      },
    });

  // Disable input during generation or data updates
  const disableInput =
    generateAppsPending ||
    upDataPending ||
    (!!generationSessionId && !isGenerationComplete);

  // for product use, we should use websocket or SSE for real-time log streaming
  // but for simplicity, we use polling here
  // const [isGenerating, setIsGenerating] = useState<boolean>(false);
  // Polling query for real-time logs
  const { data: logsData } = api.site.getGenerationLogs.useQuery(
    { sessionId: generationSessionId! },
    {
      enabled: !!generationSessionId && !isGenerationComplete,
      refetchInterval: 100, // Poll every 500ms for real-time updates
    },
  );

  // Handle log updates
  React.useEffect(() => {
    if (logsData) {
      setLogs(logsData.logs);
      if (logsData.isComplete) {
        setIsGenerationComplete(true);
        if (logsData.status === "completed") {
          toast.success("Apps generated successfully!");
        } else if (logsData.status === "error") {
          toast.error("Generation failed");
        }
      }
    }
  }, [logsData]);

  const handleCellClick = (rowIndex: number, columnKey: string) => {
    setEditingCell({ row: rowIndex, column: columnKey });
  };

  const handleCellChange = (
    rowIndex: number,
    columnKey: string,
    value: string,
  ) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [columnKey]: value } as CSVRow;
    setData(newData);
  };

  const handleSubmit = async () => {
    console.log("Current table data:", data);
    try {
      const pData = arrayRowSchema.parse(data);
      await updateData(pData);
    } catch (error) {
      // show only first error in console
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fError = (error as any)?.errors?.[0]?.message as string;
      toast.error(fError || "Validation error");
    }
  };

  const handleCellBlur = async () => {
    setEditingCell(null);
  };

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setEditingCell(null);
      await handleSubmit(); // Log data when Enter is pressed
    }
  };

  const addNewRow = () => {
    const newRow: CSVRow = {
      domain: "",
      title: "",
      description: "",
      phone: "",
      address: "",
    };
    setData([...data, newRow]);
  };

  const deleteRow = (rowIndex: number) => {
    const newData = data.filter((_, index) => index !== rowIndex);
    setData(newData);
  };

  const handleGenerate = async () => {
    const sessionId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setGenerationSessionId(sessionId);
    setLogs([]);
    setIsGenerationComplete(false);

    try {
      await generateApps({
        installDep: installDependencies,
        sessionId: sessionId,
      });
    } catch (error) {
      console.error("Generation failed:", error);
    }
  };

  const columns = ["domain", "title", "description", "phone", "address"];

  // Define column widths to prevent bouncing
  const columnWidths = {
    domain: "w-48", // 192px
    title: "w-56", // 224px
    description: "w-80", // 320px
    phone: "w-40", // 160px
    address: "w-60", // 240px
    actions: "w-24", // 96px
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex gap-2">
        <Button disabled={disableInput} onClick={addNewRow} variant="outline">
          Add Row
        </Button>
      </div>

      <div
        className={cn(
          "rounded-md border",
          disableInput && "pointer-events-none opacity-50",
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column}
                  className={`${columnWidths[column as keyof typeof columnWidths]} capitalize`}
                >
                  {column}
                </TableHead>
              ))}
              <TableHead className={columnWidths.actions}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell
                    key={column}
                    className={`${columnWidths[column as keyof typeof columnWidths]} p-0`}
                  >
                    {editingCell?.row === rowIndex &&
                    editingCell?.column === column ? (
                      <input
                        type="text"
                        value={row[column as keyof CSVRow]}
                        onChange={(e) =>
                          handleCellChange(rowIndex, column, e.target.value)
                        }
                        onBlur={handleCellBlur}
                        onKeyPress={handleKeyPress}
                        className="bg-background focus:ring-ring h-10 w-full border-0 px-3 py-2 text-sm focus:ring-2 focus:ring-offset-0 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => handleCellClick(rowIndex, column)}
                        className="hover:bg-muted/50 flex h-10 w-full cursor-pointer items-center px-3 py-2 text-sm"
                      >
                        {row[column as keyof CSVRow] || (
                          <span className="text-muted-foreground">(empty)</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                ))}
                <TableCell className={`${columnWidths.actions} p-2`}>
                  <Button
                    onClick={() => deleteRow(rowIndex)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-muted-foreground mt-4 text-sm">
        <p>
          Click any cell to edit. Press Enter or click outside to save changes.
        </p>
        <p>Total rows: {data.length}</p>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <Checkbox
          id="install-deps"
          checked={installDependencies}
          disabled={disableInput}
          onCheckedChange={(checked) =>
            setInstallDependencies(checked as boolean)
          }
        />
        <label
          htmlFor="install-deps"
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Install dependencies in each generated app
        </label>
      </div>
      <div className="mt-5 space-x-3">
        <Button
          disabled={disableInput}
          size={"lg"}
          onClick={handleSubmit}
          variant="outline"
        >
          Submit Data
        </Button>
        <Button
          size={"lg"}
          variant="outline"
          onClick={handleGenerate}
          disabled={disableInput}
        >
          {generateAppsPending ? "Generating..." : "Generate"}
        </Button>
      </div>

      {/* Terminal-like output when app generating */}

      <div className="mt-6">
        <h3 className="mb-2 text-lg font-semibold">Generation Output</h3>
        <div className="h-96 overflow-y-auto rounded-lg bg-black p-4 font-mono text-sm text-green-400">
          {logs?.length === 0 &&<div className="mb-1 flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
            <span>No output....</span>
          </div>}

          {logs.map((log, index) => (
            <div key={index} className="mb-1 flex items-start space-x-2">
              <span className="flex-shrink-0 text-xs text-gray-500">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span
                className={cn(
                  "break-words",
                  log.type === "error" && "text-red-400",
                  log.type === "success" && "text-green-400",
                  log.type === "info" && "text-blue-400",
                )}
              >
                {log.message}
              </span>
            </div>
          ))}
          {generateAppsPending && (
            <div className="mt-2 flex items-center space-x-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
              <span className="animate-pulse">Processing...</span>
            </div>
          )}
        </div>
        {logs.length > 0 && (
          <div className="mt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setLogs([])}>
              Clear Output
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTable;
