'use client'

import { ArrowUp, Loader2, Settings2 } from 'lucide-react'
import { useEffect,useState } from 'react'

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

type PromptInputProps = {
  prompt: string
  setPrompt: (prompt: string) => void
  onGenerate: () => void
  onToggleSettings: () => void
  isGenerating: boolean
  isQueued: boolean
  children?: React.ReactNode
}

export default function PromptInput({ 
  prompt, 
  setPrompt, 
  onGenerate, 
  onToggleSettings, 
  isGenerating, 
  isQueued,
  children 
}: PromptInputProps) {
  const [buttonState, setButtonState] = useState<'default' | 'generating' | 'queued'>('default')
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 500;

  useEffect(() => {
    if (isGenerating) {
      setButtonState('generating');
    } else if (isQueued) {
      setButtonState('queued');
    } else {
      setButtonState('default');
    }
  }, [isGenerating, isQueued]);

  useEffect(() => {
    setCharCount(prompt.length);
  }, [prompt]);

  const handleGenerate = () => {
    if (prompt.trim() === '' || charCount > MAX_CHARS) {
      return
    }
    onGenerate()
  }

  const getButtonContent = () => {
    switch (buttonState) {
      case 'generating':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'queued':
        return <span className="text-sm">Queued</span>;
      default:
        return <ArrowUp className="h-5 w-5" />;
    }
  }

  return (
    <div className="relative bg-secondary p-2 rounded-lg shadow-md">
      <div className="relative">
        <Textarea
          placeholder="Describe your video..."
          value={prompt}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              setPrompt(e.target.value)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleGenerate();
            }
          }}
          className="min-h-[120px] resize-none text-lg md:text-lg bg-background/50 backdrop-blur-sm border-2 pr-24 rounded-md"
        />
        <Button 
          variant="default" 
          size="icon"
          className="absolute right-3 top-3 text-primary-foreground bg-primary hover:bg-primary/90 w-auto px-3"
          onClick={handleGenerate}
          disabled={prompt.trim() === '' || buttonState !== 'default' || charCount > MAX_CHARS}
        >
          {getButtonContent()}
          <span className="sr-only">Generate</span>
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute right-3 bottom-3"
          onClick={onToggleSettings}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 flex justify-between items-center text-sm text-muted-foreground">
        <span>{charCount} / {MAX_CHARS} characters</span>
        <Progress value={(charCount / MAX_CHARS) * 100} className="w-1/2" />
      </div>
    </div>
  )
}

