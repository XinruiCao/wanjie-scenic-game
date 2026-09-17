# Architecture

## Stack
- uni-app + Vue3 + TypeScript
- Targets: H5 / iOS / Android（预留桌面封装）

## Layers
1. **pages** — presentation shells (P nodes)
2. **story** — config-driven graph (V/P/C/I/T/R/END)
3. **engine** — runtime (Story / Condition / State / Ending / Save / Preload)
4. **store** — reactive player & progress state
5. **components** — reusable UI by domain

## Data flow
`VIDEO → CHOICE → STATE/FLAG → VIDEO/PAGE/ENDING/ROUTE_CLOSED`

Legacy `src/data/story.ts` remains the active source via `src/story/index.ts` bridge.
