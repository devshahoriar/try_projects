import { useRef, useCallback } from 'react'
import { useWindowStore } from './store'
import type { Window } from './store'

const SNAP_THRESHOLD = 30
const SNAP_INDICATOR_THICKNESS = 8
const DEFAULT_WINDOW_WIDTH = 300
const DEFAULT_WINDOW_HEIGHT = 200
const WINDOW_HEADER_HEIGHT = 32

const colors = [
  'bg-red-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-yellow-400',
  'bg-purple-400',
  'bg-pink-400',
  'bg-indigo-400',
  'bg-teal-400',
]
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)]

function App() {
  const {
    windows,
    grids,
    draggedWindow,
    topWindow,
    dragOffset,
    snapIndicator,
    setWindows,
    setGrids,
    setDraggedWindow,
    setTopWindow,
    setDragOffset,
    setSnapIndicator,
  } = useWindowStore()

  const containerRef = useRef<HTMLDivElement>(null)

  const createWindow = useCallback(() => {
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    const maxX = containerRect.width - DEFAULT_WINDOW_WIDTH
    const maxY = containerRect.height - DEFAULT_WINDOW_HEIGHT

    const newWindow: Window = {
      id: Date.now().toString(),
      x: Math.random() * Math.max(0, maxX),
      y: Math.random() * Math.max(0, maxY),
      width: DEFAULT_WINDOW_WIDTH,
      height: DEFAULT_WINDOW_HEIGHT,
      color: getRandomColor(),
      isSnapped: false,
    }

    setWindows((prev) => [...prev, newWindow])
  }, [setWindows])

  const closeWindow = useCallback(
    (windowId: string) => {
      const windowToClose = windows.find((w) => w.id === windowId)
      if (!windowToClose) return

      setWindows((prev) => prev.filter((w) => w.id !== windowId))

      if (windowToClose.isSnapped && windowToClose.parentId) {
        const parentGrid = grids.find((g) => g.id === windowToClose.parentId)
        if (parentGrid && parentGrid.children.length === 2) {
          const remainingWindowId = parentGrid.children.find(
            (id) => id !== windowId
          )
          if (remainingWindowId) {
            const containerRect = containerRef.current?.getBoundingClientRect()
            
            let snapPos: 'top' | 'bottom' | 'left' | 'right' = 'left'
            
            if (containerRect) {
              const screenCenterX = containerRect.width / 2
              const screenCenterY = containerRect.height / 2
              
              const isHalfWidth = Math.abs(parentGrid.width - containerRect.width / 2) < 10
              const isHalfHeight = Math.abs(parentGrid.height - containerRect.height / 2) < 10
              
              if (isHalfWidth && parentGrid.x < screenCenterX) {
                snapPos = 'left'
              } else if (isHalfWidth && parentGrid.x >= screenCenterX) {
                snapPos = 'right'
              } else if (isHalfHeight && parentGrid.y < screenCenterY) {
                snapPos = 'top'
              } else if (isHalfHeight && parentGrid.y >= screenCenterY) {
                snapPos = 'bottom'
              } else {
                if (parentGrid.x === 0) snapPos = 'left'
                else if (parentGrid.x + parentGrid.width === containerRect.width) snapPos = 'right'
                else if (parentGrid.y === 0) snapPos = 'top'
                else snapPos = 'bottom'
              }
            }

            setWindows((prev) =>
              prev.map((w) =>
                w.id === remainingWindowId
                  ? {
                      ...w,
                      x: parentGrid.x,
                      y: parentGrid.y,
                      width: parentGrid.width,
                      height: parentGrid.height,
                      isSnapped: true,
                      parentId: undefined,
                      snapPosition: snapPos,
                    }
                  : w
              )
            )
            setGrids((prev) =>
              prev.filter((g) => g.id !== windowToClose.parentId)
            )
          }
        } else if (parentGrid && parentGrid.children.length > 2) {
          const remainingWindows = parentGrid.children.filter(
            (id) => id !== windowId
          )

          if (parentGrid.orientation === 'horizontal') {
            const newHeight = parentGrid.height / remainingWindows.length
            setWindows((prev) =>
              prev.map((w) => {
                const windowIndex = remainingWindows.indexOf(w.id)
                if (windowIndex !== -1) {
                  return {
                    ...w,
                    y: parentGrid.y + windowIndex * newHeight,
                    height: newHeight,
                  }
                }
                return w
              })
            )
          } else if (parentGrid.orientation === 'vertical') {
            const newWidth = parentGrid.width / remainingWindows.length
            setWindows((prev) =>
              prev.map((w) => {
                const windowIndex = remainingWindows.indexOf(w.id)
                if (windowIndex !== -1) {
                  return {
                    ...w,
                    x: parentGrid.x + windowIndex * newWidth,
                    width: newWidth,
                  }
                }
                return w
              })
            )
          }

          setGrids((prev) =>
            prev.map((g) =>
              g.id === parentGrid.id ? { ...g, children: remainingWindows } : g
            )
          )
        }
      }
    },
    [windows, grids, setWindows, setGrids]
  )

  const findSnapTarget = useCallback(
    (
      x: number,
      y: number,
      width: number,
      height: number,
      draggedId: string
    ) => {
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!containerRect) return null

      if (x <= SNAP_THRESHOLD) {
        return {
          position: 'left' as const,
          x: 0,
          y: 0,
          width: SNAP_INDICATOR_THICKNESS,
          height: containerRect.height,
        }
      }
      if (x + width >= containerRect.width - SNAP_THRESHOLD) {
        return {
          position: 'right' as const,
          x: containerRect.width - SNAP_INDICATOR_THICKNESS,
          y: 0,
          width: SNAP_INDICATOR_THICKNESS,
          height: containerRect.height,
        }
      }
      if (y <= SNAP_THRESHOLD) {
        return {
          position: 'top' as const,
          x: 0,
          y: 0,
          width: containerRect.width,
          height: SNAP_INDICATOR_THICKNESS,
        }
      }
      if (y + height >= containerRect.height - SNAP_THRESHOLD) {
        return {
          position: 'bottom' as const,
          x: 0,
          y: containerRect.height - SNAP_INDICATOR_THICKNESS,
          width: containerRect.width,
          height: SNAP_INDICATOR_THICKNESS,
        }
      }

      for (const window of windows) {
        if (window.id === draggedId || !window.isSnapped) continue

        const wx = window.x
        const wy = window.y
        const ww = window.width
        const wh = window.height

        if (
          x + width >= wx - SNAP_THRESHOLD &&
          x <= wx + ww + SNAP_THRESHOLD &&
          y + height >= wy - SNAP_THRESHOLD &&
          y <= wy + wh + SNAP_THRESHOLD
        ) {
          const windowGrid = grids.find((g) => g.children.includes(window.id))

          if (windowGrid && windowGrid.children.length > 1) {
            if (windowGrid.width > windowGrid.height) {
              if (x + width / 2 < windowGrid.x + windowGrid.width / 2) {
                return {
                  position: 'left' as const,
                  x: windowGrid.x,
                  y: windowGrid.y,
                  width: SNAP_INDICATOR_THICKNESS,
                  height: windowGrid.height,
                  parentId: window.id,
                }
              } else {
                return {
                  position: 'right' as const,
                  x: windowGrid.x + windowGrid.width - SNAP_INDICATOR_THICKNESS,
                  y: windowGrid.y,
                  width: SNAP_INDICATOR_THICKNESS,
                  height: windowGrid.height,
                  parentId: window.id,
                }
              }
            } else {
              if (y + height / 2 < windowGrid.y + windowGrid.height / 2) {
                return {
                  position: 'top' as const,
                  x: windowGrid.x,
                  y: windowGrid.y,
                  width: windowGrid.width,
                  height: SNAP_INDICATOR_THICKNESS,
                  parentId: window.id,
                }
              } else {
                return {
                  position: 'bottom' as const,
                  x: windowGrid.x,
                  y: windowGrid.y + windowGrid.height - SNAP_INDICATOR_THICKNESS,
                  width: windowGrid.width,
                  height: SNAP_INDICATOR_THICKNESS,
                  parentId: window.id,
                }
              }
            }
          } else {
            const mouseX = x + width / 2
            const mouseY = y + height / 2

            const distToLeft = Math.abs(mouseX - wx)
            const distToRight = Math.abs(mouseX - (wx + ww))
            const distToTop = Math.abs(mouseY - wy)
            const distToBottom = Math.abs(mouseY - (wy + wh))

            const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom)

            if (minDist === distToLeft) {
              return {
                position: 'left' as const,
                x: wx,
                y: wy,
                width: SNAP_INDICATOR_THICKNESS,
                height: wh,
                parentId: window.id,
              }
            } else if (minDist === distToRight) {
              return {
                position: 'right' as const,
                x: wx + ww - SNAP_INDICATOR_THICKNESS,
                y: wy,
                width: SNAP_INDICATOR_THICKNESS,
                height: wh,
                parentId: window.id,
              }
            } else if (minDist === distToTop) {
              return {
                position: 'top' as const,
                x: wx,
                y: wy,
                width: ww,
                height: SNAP_INDICATOR_THICKNESS,
                parentId: window.id,
              }
            } else {
              return {
                position: 'bottom' as const,
                x: wx,
                y: wy + wh - SNAP_INDICATOR_THICKNESS,
                width: ww,
                height: SNAP_INDICATOR_THICKNESS,
                parentId: window.id,
              }
            }
          }
        }
      }

      return null
    },
    [windows, grids]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, windowId: string) => {
      e.preventDefault()

      const window = windows.find((w) => w.id === windowId)
      if (!window || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - containerRect.left
      const mouseY = e.clientY - containerRect.top

      const offsetX = mouseX - window.x
      const offsetY = mouseY - window.y

      setDraggedWindow(windowId)
      setTopWindow(windowId)
      setDragOffset({ x: offsetX, y: offsetY })

      setWindows((prev) => {
        const windowIndex = prev.findIndex((w) => w.id === windowId)
        if (windowIndex === -1) return prev
        const window = prev[windowIndex]
        return [
          ...prev.slice(0, windowIndex),
          ...prev.slice(windowIndex + 1),
          window,
        ]
      })
    },
    [windows, setDraggedWindow, setTopWindow, setDragOffset, setWindows]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedWindow || !containerRef.current || !dragOffset) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - containerRect.left
      const mouseY = e.clientY - containerRect.top

      setWindows((prev) =>
        prev.map((w) => {
          if (w.id === draggedWindow) {
            const newX = mouseX - dragOffset.x
            const newY = mouseY - dragOffset.y

            const snapTarget = findSnapTarget(
              newX,
              newY,
              w.width,
              w.height,
              w.id
            )
            if (snapTarget) {
              setSnapIndicator({
                visible: true,
                position: snapTarget.position,
                x: snapTarget.x,
                y: snapTarget.y,
                width: snapTarget.width,
                height: snapTarget.height,
                parentId: snapTarget.parentId,
              })
            } else {
              setSnapIndicator(null)
            }

            if (w.isSnapped) {
              setDragOffset({
                x: DEFAULT_WINDOW_WIDTH / 2,
                y: WINDOW_HEADER_HEIGHT / 2,
              })
              return {
                ...w,
                x: newX,
                y: newY,
                width: DEFAULT_WINDOW_WIDTH,
                height: DEFAULT_WINDOW_HEIGHT,
                isSnapped: false,
                parentId: undefined,
                snapPosition: undefined,
              }
            }

            return {
              ...w,
              x: newX,
              y: newY,
              isSnapped: false,
              parentId: undefined,
              snapPosition: undefined,
            }
          }
          return w
        })
      )
    },
    [
      draggedWindow,
      dragOffset,
      findSnapTarget,
      setSnapIndicator,
      setWindows,
      setDragOffset,
    ]
  )

  const handleMouseUp = useCallback(() => {
    if (!draggedWindow) return

    const draggedWindowObj = windows.find((w) => w.id === draggedWindow)

    if (draggedWindowObj?.parentId && !draggedWindowObj.isSnapped) {
      const parentGrid = grids.find((g) => g.id === draggedWindowObj.parentId)
      if (parentGrid) {
        const remainingWindows = parentGrid.children.filter(
          (id) => id !== draggedWindow
        )
        if (remainingWindows.length === 1) {
          const containerRect = containerRef.current?.getBoundingClientRect()
          let snapPos: 'top' | 'bottom' | 'left' | 'right' = 'left'

          if (containerRect) {
            const screenCenterX = containerRect.width / 2
            const screenCenterY = containerRect.height / 2
            
            if (parentGrid.x === 0 && parentGrid.width === containerRect.width / 2) {
              snapPos = 'left'
            } else if (parentGrid.x === screenCenterX && parentGrid.width === containerRect.width / 2) {
              snapPos = 'right'
            } else if (parentGrid.y === 0 && parentGrid.height === containerRect.height / 2) {
              snapPos = 'top'
            } else if (parentGrid.y === screenCenterY && parentGrid.height === containerRect.height / 2) {
              snapPos = 'bottom'
            } else {
              if (parentGrid.x < screenCenterX) snapPos = 'left'
              else if (parentGrid.x >= screenCenterX) snapPos = 'right'
              else if (parentGrid.y < screenCenterY) snapPos = 'top'
              else snapPos = 'bottom'
            }
          }

          setWindows((prev) =>
            prev.map((w) =>
              w.id === remainingWindows[0]
                ? {
                    ...w,
                    x: parentGrid.x,
                    y: parentGrid.y,
                    width: parentGrid.width,
                    height: parentGrid.height,
                    isSnapped: true,
                    parentId: undefined,
                    snapPosition: snapPos,
                  }
                : w
            )
          )
          setGrids((prev) =>
            prev.filter((g) => g.id === draggedWindowObj.parentId)
          )
        } else if (remainingWindows.length > 1) {
          if (parentGrid.orientation === 'horizontal') {
            const newHeight = parentGrid.height / remainingWindows.length
            setWindows((prev) =>
              prev.map((w) => {
                const windowIndex = remainingWindows.indexOf(w.id)
                if (windowIndex !== -1) {
                  return {
                    ...w,
                    y: parentGrid.y + windowIndex * newHeight,
                    height: newHeight,
                  }
                }
                return w
              })
            )
          } else if (parentGrid.orientation === 'vertical') {
            const newWidth = parentGrid.width / remainingWindows.length
            setWindows((prev) =>
              prev.map((w) => {
                const windowIndex = remainingWindows.indexOf(w.id)
                if (windowIndex !== -1) {
                  return {
                    ...w,
                    x: parentGrid.x + windowIndex * newWidth,
                    width: newWidth,
                  }
                }
                return w
              })
            )
          }

          setGrids((prev) =>
            prev.map((g) =>
              g.id === parentGrid.id ? { ...g, children: remainingWindows } : g
            )
          )
        }
      }
    }

    if (snapIndicator) {
      const windowToSnap = windows.find((w) => w.id === draggedWindow)
      if (windowToSnap) {
        if (snapIndicator.parentId) {
          const parentWindow = windows.find(
            (w) => w.id === snapIndicator.parentId
          )
          if (parentWindow) {
            const gridId = `grid-${Date.now()}`

            const parentGrid = grids.find((g) =>
              g.children.includes(parentWindow.id)
            )

            if (parentGrid) {
              const remainingInOldGrid = parentGrid.children.filter(
                (id) => id !== parentWindow.id
              )

              if (remainingInOldGrid.length === 1) {
                const containerRect =
                  containerRef.current?.getBoundingClientRect()
                let snapPos: 'top' | 'bottom' | 'left' | 'right' = 'left'

                if (containerRect) {
                  if (
                    parentGrid.x === 0 &&
                    parentGrid.width === containerRect.width / 2
                  ) {
                    snapPos = 'left'
                  } else if (
                    parentGrid.x === containerRect.width / 2 &&
                    parentGrid.width === containerRect.width / 2
                  ) {
                    snapPos = 'right'
                  } else if (
                    parentGrid.y === 0 &&
                    parentGrid.height === containerRect.height / 2
                  ) {
                    snapPos = 'top'
                  } else if (
                    parentGrid.y === containerRect.height / 2 &&
                    parentGrid.height === containerRect.height / 2
                  ) {
                    snapPos = 'bottom'
                  }
                }

                setWindows((prev) =>
                  prev.map((w) =>
                    w.id === remainingInOldGrid[0]
                      ? {
                          ...w,
                          x: parentGrid.x,
                          y: parentGrid.y,
                          width: parentGrid.width,
                          height: parentGrid.height,
                          isSnapped: true,
                          parentId: undefined,
                          snapPosition: snapPos,
                        }
                      : w
                  )
                )

                setGrids((prev) => prev.filter((g) => g.id !== parentGrid.id))
              } else if (remainingInOldGrid.length > 1) {
                if (parentGrid.orientation === 'horizontal') {
                  const newHeight = parentGrid.height / remainingInOldGrid.length
                  setWindows((prev) =>
                    prev.map((w) => {
                      const windowIndex = remainingInOldGrid.indexOf(w.id)
                      if (windowIndex !== -1) {
                        return {
                          ...w,
                          y: parentGrid.y + windowIndex * newHeight,
                          height: newHeight,
                        }
                      }
                      return w
                    })
                  )
                } else if (parentGrid.orientation === 'vertical') {
                  const newWidth = parentGrid.width / remainingInOldGrid.length
                  setWindows((prev) =>
                    prev.map((w) => {
                      const windowIndex = remainingInOldGrid.indexOf(w.id)
                      if (windowIndex !== -1) {
                        return {
                          ...w,
                          x: parentGrid.x + windowIndex * newWidth,
                          width: newWidth,
                        }
                      }
                      return w
                    })
                  )
                }

                setGrids((prev) =>
                  prev.map((g) =>
                    g.id === parentGrid.id
                      ? { ...g, children: remainingInOldGrid }
                      : g
                  )
                )
              }
            }
            let workspaceX = parentWindow.x
            let workspaceY = parentWindow.y
            let workspaceWidth = parentWindow.width
            let workspaceHeight = parentWindow.height

            if (parentGrid) {
              workspaceX = parentGrid.x
              workspaceY = parentGrid.y
              workspaceWidth = parentGrid.width
              workspaceHeight = parentGrid.height
            }

            let snapX, snapY, snapWidth, snapHeight
            let parentX, parentY, parentWidth, parentHeight

            if (snapIndicator.position === 'top') {
              snapX = workspaceX
              snapY = workspaceY
              snapWidth = workspaceWidth
              snapHeight = workspaceHeight / 2

              parentX = workspaceX
              parentY = workspaceY + workspaceHeight / 2
              parentWidth = workspaceWidth
              parentHeight = workspaceHeight / 2
            } else if (snapIndicator.position === 'bottom') {
              snapX = workspaceX
              snapY = workspaceY + workspaceHeight / 2
              snapWidth = workspaceWidth
              snapHeight = workspaceHeight / 2

              parentX = workspaceX
              parentY = workspaceY
              parentWidth = workspaceWidth
              parentHeight = workspaceHeight / 2
            } else if (snapIndicator.position === 'left') {
              snapX = workspaceX
              snapY = workspaceY
              snapWidth = workspaceWidth / 2
              snapHeight = workspaceHeight

              parentX = workspaceX + workspaceWidth / 2
              parentY = workspaceY
              parentWidth = workspaceWidth / 2
              parentHeight = workspaceHeight
            } else {
              snapX = workspaceX + workspaceWidth / 2
              snapY = workspaceY
              snapWidth = workspaceWidth / 2
              snapHeight = workspaceHeight

              parentX = workspaceX
              parentY = workspaceY
              parentWidth = workspaceWidth / 2
              parentHeight = workspaceHeight
            }

            setWindows((prev) =>
              prev.map((w) => {
                if (w.id === draggedWindow) {
                  return {
                    ...w,
                    x: snapX,
                    y: snapY,
                    width: snapWidth,
                    height: snapHeight,
                    isSnapped: true,
                    snapPosition: snapIndicator.position,
                    parentId: gridId,
                  }
                }
                if (w.id === snapIndicator.parentId) {
                  return {
                    ...w,
                    x: parentX,
                    y: parentY,
                    width: parentWidth,
                    height: parentHeight,
                    isSnapped: true,
                    parentId: gridId,
                    snapPosition: snapIndicator.position,
                  }
                }
                if (parentGrid && parentGrid.children.includes(w.id) && w.id !== snapIndicator.parentId) {
                  if (snapIndicator.position === 'top' || snapIndicator.position === 'bottom') {
                    return {
                      ...w,
                      x: parentX,
                      y: parentY,
                      width: parentWidth,
                      height: parentHeight,
                      parentId: gridId,
                    }
                  } else {
                    return {
                      ...w,
                      x: parentX,
                      y: parentY,
                      width: parentWidth,
                      height: parentHeight,
                      parentId: gridId,
                    }
                  }
                }
                return w
              })
            )

            setGrids((prev) => {
              const filteredGrids = parentGrid
                ? prev.filter((g) => g.id !== parentGrid.id)
                : prev

              const newGridChildren = parentGrid
                ? [
                    ...parentGrid.children.filter(
                      (id) => id !== snapIndicator.parentId
                    ),
                    snapIndicator.parentId!,
                    draggedWindow,
                  ]
                : [snapIndicator.parentId!, draggedWindow]

              return [
                ...filteredGrids,
                {
                  id: gridId,
                  x: workspaceX,
                  y: workspaceY,
                  width: workspaceWidth,
                  height: workspaceHeight,
                  children: newGridChildren,
                  orientation:
                    snapIndicator.position === 'top' ||
                    snapIndicator.position === 'bottom'
                      ? 'horizontal'
                      : 'vertical',
                },
              ]
            })
          }
        } else {
          const containerRect = containerRef.current?.getBoundingClientRect()
          if (containerRect) {
            let snapX = 0
            let snapY = 0
            let snapWidth = containerRect.width
            let snapHeight = containerRect.height

            if (snapIndicator.position === 'left') {
              snapWidth = containerRect.width / 2
            } else if (snapIndicator.position === 'right') {
              snapX = containerRect.width / 2
              snapWidth = containerRect.width / 2
            } else if (snapIndicator.position === 'top') {
              snapHeight = containerRect.height / 2
            } else if (snapIndicator.position === 'bottom') {
              snapY = containerRect.height / 2
              snapHeight = containerRect.height / 2
            }

            setWindows((prev) =>
              prev.map((w) =>
                w.id === draggedWindow
                  ? {
                      ...w,
                      x: snapX,
                      y: snapY,
                      width: snapWidth,
                      height: snapHeight,
                      isSnapped: true,
                      snapPosition: snapIndicator.position,
                      parentId: undefined,
                    }
                  : w
              )
            )
          }
        }
      }
    }

    setDraggedWindow(null)
    setDragOffset(null)
    setSnapIndicator(null)
  }, [
    draggedWindow,
    snapIndicator,
    windows,
    grids,
    setWindows,
    setGrids,
    setDraggedWindow,
    setDragOffset,
    setSnapIndicator,
  ])

  return (
    <div
      ref={containerRef}
      className='relative w-screen h-screen bg-gray-100 overflow-hidden'
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {snapIndicator && (
        <div
          className='absolute border-2 border-blue-500 bg-blue-200 bg-opacity-30 pointer-events-none z-40'
          style={{
            left: snapIndicator.x,
            top: snapIndicator.y,
            width: snapIndicator.width,
            height: snapIndicator.height,
          }}
        />
      )}

      {windows.map((window) => {
        let zIndex = 'z-10'
        if (window.id === topWindow) {
          zIndex = 'z-50'
        } else if (window.id === draggedWindow) {
          zIndex = 'z-40'
        }

        return (
          <div
            key={window.id}
            className={`absolute border border-gray-300 shadow-lg ${window.color} ${zIndex}`}
            style={{
              left: window.x,
              top: window.y,
              width: window.width,
              height: window.height,
              cursor: draggedWindow === window.id ? 'grabbing' : 'default',
            }}
          >
            <div
              className='bg-gray-800 text-white p-2 flex justify-end items-center cursor-grab active:cursor-grabbing'
              style={{ height: WINDOW_HEADER_HEIGHT }}
              onMouseDown={(e) => handleMouseDown(e, window.id)}
            >
              
              <button
                className='text-white hover:text-red-300 text-lg leading-none'
                onClick={() => closeWindow(window.id)}
                onMouseDown={(e) => e.stopPropagation()}
              >
                ×
              </button>
            </div>
            <div
              className='p-4'
              style={{ height: window.height - WINDOW_HEADER_HEIGHT }}
            >
              <p className='text-sm text-gray-700'>
                Window content {window.id.slice(-4)}
              </p>
            </div>
          </div>
        )
      })}

      <button
        className='fixed bottom-6 right-6 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-2xl shadow-lg z-50 flex items-center justify-center'
        onClick={createWindow}
      >
        +
      </button>
    </div>
  )
}

export default App
