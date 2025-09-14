import { create } from 'zustand'

export interface Window {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: string
  isSnapped: boolean
  snapPosition?: 'top' | 'bottom' | 'left' | 'right'
  parentId?: string
  gridArea?: string
}

export interface GridCell {
  id: string
  x: number
  y: number
  width: number
  height: number
  children: string[]
  orientation?: 'horizontal' | 'vertical'
}

interface SnapIndicator {
  visible: boolean
  position: 'top' | 'bottom' | 'left' | 'right'
  x: number
  y: number
  width: number
  height: number
  parentId?: string
}

interface WindowStore {
  windows: Window[]
  grids: GridCell[]
  draggedWindow: string | null
  topWindow: string | null
  dragOffset: { x: number; y: number } | null
  snapIndicator: SnapIndicator | null
  
  setWindows: (windows: Window[] | ((prev: Window[]) => Window[])) => void
  setGrids: (grids: GridCell[] | ((prev: GridCell[]) => GridCell[])) => void
  setDraggedWindow: (id: string | null) => void
  setTopWindow: (id: string | null) => void
  setDragOffset: (offset: { x: number; y: number } | null) => void
  setSnapIndicator: (indicator: SnapIndicator | null) => void
  
  addWindow: (window: Window) => void
  removeWindow: (id: string) => void
  updateWindow: (id: string, updates: Partial<Window>) => void
  
  findWindow: (id: string) => Window | undefined
  findGrid: (id: string) => GridCell | undefined
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  grids: [],
  draggedWindow: null,
  topWindow: null,
  dragOffset: null,
  snapIndicator: null,

  setWindows: (windows) => 
    set((state) => ({ 
      windows: typeof windows === 'function' ? windows(state.windows) : windows 
    })),

  setGrids: (grids) => 
    set((state) => ({ 
      grids: typeof grids === 'function' ? grids(state.grids) : grids 
    })),

  setDraggedWindow: (id) => set({ draggedWindow: id }),
  setTopWindow: (id) => set({ topWindow: id }),
  setDragOffset: (offset) => set({ dragOffset: offset }),
  setSnapIndicator: (indicator) => set({ snapIndicator: indicator }),

  addWindow: (window) =>
    set((state) => ({ windows: [...state.windows, window] })),

  removeWindow: (id) =>
    set((state) => ({ windows: state.windows.filter(w => w.id !== id) })),

  updateWindow: (id, updates) =>
    set((state) => ({
      windows: state.windows.map(w => w.id === id ? { ...w, ...updates } : w)
    })),

  findWindow: (id) => get().windows.find(w => w.id === id),
  findGrid: (id) => get().grids.find(g => g.id === id),
}))
