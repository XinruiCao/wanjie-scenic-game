/** Ending definition */
export interface EndingDef {
  id: string
  title: string
  description?: string
  poster?: string
  require?: Record<string, string | number | boolean>
}
