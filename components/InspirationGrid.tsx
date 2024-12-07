'use client'

import { Check, CirclePlay, Clock3, Copy, Dices, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { inspirationData, type InspirationItem as ImportedInspirationItem } from "@/lib/inspiration-data"

import { Video } from './HomePage'

type GridView = '2x2' | '3x3' | 'list'

type InspirationGridProps = {
  applyVideoSettings: (video: Video) => void
  gridView: GridView
  setGridView: (view: GridView) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

type InspirationItem = ImportedInspirationItem & {
  frames: number;
  id: string;
}

export default function InspirationGrid({ 
  applyVideoSettings, 
  gridView, 
  setGridView, 
  searchQuery, 
  setSearchQuery 
}: InspirationGridProps) {
  const [copiedSettings, setCopiedSettings] = useState<string | null>(null)
  const { toast } = useToast()

  const handleApplySettings = (item: InspirationItem) => {
    applyVideoSettings({
      id: '',
      prompt: item.prompt,
      frames: item.frames,
      url: item.image,
      seed: item.seed,
      status: 'completed',
      enhancePrompt: item.enhancePrompt,
      enhancedPromptText: item.enhancedPromptText
    })
    setCopiedSettings(item.title)
    setTimeout(() => setCopiedSettings(null), 1000)
  }

  const getGridClass = () => {
    switch (gridView) {
      case '2x2': return 'grid grid-cols-1 sm:grid-cols-2'
      case '3x3': return 'grid grid-cols-2 sm:grid-cols-4'
      case 'list': return 'flex flex-col'
      default: return 'grid-cols-1 sm:grid-cols-2'
    }
  }

  const filteredInspirations = inspirationData.filter(item =>
    item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className={`${getGridClass()} gap-4 w-full`}>
        {filteredInspirations.map((item) => {
          const itemWithDefaults = {
            ...item,
            frames: 31,
            id: item.title
          };
          return (
          <Card key={item.title} className={`overflow-hidden w-full ${gridView === 'list' ? 'flex' : ''}`}>
            <CardContent className={`p-0 ${gridView === 'list' ? 'flex items-center w-full' : ''}`}>
              <div className={`relative ${gridView === 'list' ? 'w-24 h-24 flex-shrink-0' : ''}`}>
                <img 
                  src={item.image} 
                  alt={item.title}
                  className={`object-cover ${gridView === 'list' ? 'w-24 h-24' : 'w-full h-80'}`}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <CirclePlay className="h-16 w-16 text-white" />
                </div>
              </div>
              <div className={`${gridView === 'list' ? 'flex-grow flex justify-between items-center px-2' : 'p-4'}`}>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.prompt}</p>
                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Clock3 className="h-3 w-3 mr-1" />
                      {(itemWithDefaults.frames / 24).toFixed(2)}s
                    </span>
                    {item.enhancePrompt && (
                      <span className="flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Enhanced
                      </span>
                    )}
                  </div>
                </div>
                <div className={`${gridView === 'list' ? 'ml-4' : 'mt-4'} flex gap-2`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleApplySettings(itemWithDefaults)}
                  >
                    {copiedSettings === item.title ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      const randomSeed = Math.floor(Math.random() * 1000000);
                      handleApplySettings({
                        ...itemWithDefaults,
                        seed: randomSeed
                      });
                      toast({
                        title: "Random seed applied",
                        description: `New seed: ${randomSeed}`
                      });
                    }}
                  >
                    <Dices className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>
    </div>
  )
}

