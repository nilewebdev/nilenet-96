
import React from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuickTile {
  id: string
  name: string
  url: string
  icon: string
  category: string
}

interface QuickAccessTilesProps {
  tiles: QuickTile[]
  onTileClick: (url: string) => void
  onDragEnd: (result: any) => void
}

export const QuickAccessTiles: React.FC<QuickAccessTilesProps> = ({
  tiles,
  onTileClick,
  onDragEnd
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold">Quick Access</h2>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tiles" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-3 md:grid-cols-6 gap-2"
            >
              {tiles.slice(0, 6).map((tile, index) => (
                <Draggable key={tile.id} draggableId={tile.id} index={index}>
                  {(provided, snapshot) => (
                    <Button
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      variant="outline"
                      onClick={() => onTileClick(tile.url)}
                      className={`quick-tile h-14 flex flex-col items-center gap-1 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 p-2 ${
                        snapshot.isDragging ? 'shadow-lg scale-105' : ''
                      }`}
                    >
                      <span className="text-lg">{tile.icon}</span>
                      <div className="text-center">
                        <div className="font-medium text-xs truncate w-full">{tile.name}</div>
                      </div>
                    </Button>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
