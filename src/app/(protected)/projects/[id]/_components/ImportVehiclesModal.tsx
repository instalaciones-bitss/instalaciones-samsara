'use client'

import { ChangeEvent, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { VariantProps } from 'class-variance-authority'
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react'
import { Tables } from '@/types/app.types'
import { importVehicles } from '../actions'
import * as XLSX from 'xlsx'
import { TablesInsert } from '@/types/database.types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert' // Use Shadcn Alert

const EXCEL_MAP: Readonly<
  Record<
    string,
    keyof Omit<
      Tables<'vehicles'>,
      | 'id'
      | 'installed_at'
      | 'created_at'
      | 'notes'
      | 'status'
      | 'project_id'
      | 'technician_id'
    >
  >
> = {
  VIN: 'vin',
  Económico: 'eco_number',
  Placas: 'plate',
  Marca: 'brand',
  Modelo: 'model',
  Año: 'year',
  Ciudad: 'city',
}

type ImportVehiclesModalProps = {
  projectId: string
  projectName: string
  label?: string
} & VariantProps<typeof Button>

const normalizeHeader = (str: string) =>
  str
    .trim()
    .toLowerCase()
    .normalize('NFD') // Splits characters from their accents
    .replace(/[\u0300-\u036f]/g, '') // Removes the accent marks

export function ImportVehiclesModal({
  projectId,
  projectName,
  variant,
  size,
  label,
}: ImportVehiclesModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setFile(null)
      setError(null)
    }
  }

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement, HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Senior approach: Check both extension and MIME type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ]
    const extension = selectedFile.name.split('.').pop()?.toLowerCase()

    if (
      !validTypes.includes(selectedFile.type) &&
      extension !== 'xlsx' &&
      extension !== 'xls'
    ) {
      setError('Invalid file type. Please upload an Excel file (.xlsx or .xls)')
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const handleProcess = async () => {
    if (!file) return
    setError(null) // Reset previous errors

    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]

        // Type the raw data as an array of objects with string keys
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

        if (rawRows.length === 0) throw new Error('The file is empty.')

        // 1. Identify the VIN header defensively
        const headers = Object.keys(rawRows[0])
        const vinHeader = headers.find((h) => normalizeHeader(h) === 'vin')

        if (!vinHeader) {
          throw new Error(
            "Missing 'VIN' column. Please check your Excel headers."
          )
        }
        console.log(rawRows)
        // 2. Map and Validate
        const formattedData: TablesInsert<'vehicles'>[] = rawRows.map(
          (row, index) => {
            const vinValue = String(row[vinHeader] || '').trim()

            if (!vinValue) {
              throw new Error(`Row ${index + 2}: VIN is mandatory.`)
            }

            const newRow: any = { project_id: projectId } // project_id is required by your DB

            // Map the rest of the columns using the normalized EXCEL_MAP
            Object.entries(EXCEL_MAP).forEach(([excelLabel, dbKey]) => {
              const actualKey = headers.find(
                (h) => normalizeHeader(h) === normalizeHeader(excelLabel)
              )
              if (actualKey) {
                newRow[dbKey] = row[actualKey]
              }
            })

            return newRow as TablesInsert<'vehicles'>
          }
        )
        console.log(formattedData)
        // 3. Send to Server Action
        startTransition(async () => {
          const result = await importVehicles(projectId, formattedData)
          if (!result.success) setError(result.error)
          else setIsOpen(false)
        })
      } catch (err: any) {
        setError(err.message)
      }
    }

    reader.readAsArrayBuffer(file)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {label || 'Importar'}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-surface-low border-surface-border">
        <DialogHeader>
          <DialogTitle>
            Importando unidades para:
            <p className="text-brand-teal mt-2">{projectName}</p>
          </DialogTitle>
          <DialogDescription>
            Sube un archivo Excel (.xlsx, .xls) con el formato requerido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          {!file ? (
            <label className="border-surface-border bg-surface-mid/50 hover:bg-surface-mid flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 transition-all">
              <FileSpreadsheet className="text-muted-foreground/30 mb-4 h-12 w-12" />
              <p className="text-sm font-medium">
                Click para seleccionar archivo
              </p>
              <input
                type="file"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            /* Using brand-green (primary) for success feedback */
            <div className="border-primary/20 bg-primary/5 flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-primary h-5 w-5" />
                <span className="font-mono text-sm font-medium">
                  {file.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                className="text-danger hover:bg-danger/10 h-8"
              >
                Quitar
              </Button>
            </div>
          )}

          {error && (
            <Alert
              variant="destructive"
              className="bg-danger/10 border-danger/20 text-danger"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error de formato</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleProcess}
            disabled={!file || isPending}
            className="bg-primary hover:bg-primary/90 min-w-[140px] font-bold text-black"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Procesar e Importar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
