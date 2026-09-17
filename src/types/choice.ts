/** Choice item definition */
export interface ChoiceItem {
  id: string
  text: string
  next: string
  set?: Record<string, string | number | boolean>
  add?: Record<string, number>
  require?: Record<string, string | number | boolean>
}
