'use client'

import { Clock3 } from 'lucide-react'

import { Slider } from "@/components/ui/slider"
import { VideoSettings } from '@/types'

interface SettingsPanelProps {
  settings: VideoSettings
  onChange: (settings: VideoSettings) => void
}

const frameOptions = [7, 13, 19, 25, 31, 37, 43, 49, 55, 61, 67, 73, 79, 85, 91, 97, 103, 109, 115, 121, 127]

const STEP_MIN = 10
const STEP_MAX = 60
const CFG_MIN = 1
const CFG_MAX = 10

function getSeconds(frames: number): number {
  return Number((frames / 24).toFixed(1))
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const handleFrameChange = (values: number[]) => {
    const index = Math.round((values[0] - 1) / 0.2)
    onChange({ ...settings, numFrames: frameOptions[index] })
  }

  const handleStepsChange = (values: number[]) => {
    onChange({ ...settings, steps: values[0] })
  }

  const handleCfgChange = (values: number[]) => {
    onChange({ ...settings, cfg: values[0] })
  }

  return (
    <div className="p-4 border-b border-border">
      <div className="space-y-6">
        <div>
          <label className="text-sm text-muted-foreground">Negative Prompt</label>
          <textarea
            value={settings.negativePrompt}
            onChange={(e) => onChange({ ...settings, negativePrompt: e.target.value })}
            className="w-full mt-1 text-sm"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Width</label>
            <input
              type="number"
              value={settings.width}
              onChange={(e) => onChange({ ...settings, width: Number(e.target.value) })}
              className="w-full mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Height</label>
            <input
              type="number"
              value={settings.height}
              onChange={(e) => onChange({ ...settings, height: Number(e.target.value) })}
              className="w-full mt-1"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-muted-foreground">Length</label>
            <span className="text-sm text-muted-foreground">{getSeconds(settings.numFrames)}s</span>
          </div>
          <div className="flex items-center gap-4">
            <Clock3 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <div className="w-full">
              <Slider
                min={1}
                max={5}
                step={0.2}
                value={[(frameOptions.indexOf(settings.numFrames) * 0.2) + 1]}
                onValueChange={handleFrameChange}
              />
              <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                <span>1s</span>
                <span>5s</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-muted-foreground">Steps</label>
              <span className="text-sm text-muted-foreground">{settings.steps}</span>
            </div>
            <Slider
              min={STEP_MIN}
              max={STEP_MAX}
              step={1}
              value={[settings.steps]}
              onValueChange={handleStepsChange}
            />
            <div className="flex justify-between text-xs mt-1 text-muted-foreground">
              <span>{STEP_MIN}</span>
              <span>{STEP_MAX}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-muted-foreground">CFG</label>
              <span className="text-sm text-muted-foreground">{settings.cfg}</span>
            </div>
            <Slider
              min={CFG_MIN}
              max={CFG_MAX}
              step={0.1}
              value={[settings.cfg]}
              onValueChange={handleCfgChange}
            />
            <div className="flex justify-between text-xs mt-1 text-muted-foreground">
              <span>{CFG_MIN}</span>
              <span>{CFG_MAX}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 