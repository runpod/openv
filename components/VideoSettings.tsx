'use client'

import { Clock3, Dices } from 'lucide-react'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

export type VideoSettings = {
  negativePrompt: string
  width: number
  height: number
  steps: number
  cfg: number
  numFrames: number
}

type VideoSettingsProps = {
  settings: VideoSettings
  setSettings: (settings: VideoSettings) => void
  seed: number
  setSeed: (seed: number) => void
  isRandomSeed: boolean
  setIsRandomSeed: (isRandom: boolean) => void
}

const frameOptions = [7, 13, 19, 25, 31, 37, 43, 49, 55, 61, 67, 73, 79, 85, 91, 97, 103, 109, 115, 121, 127];

export default function VideoSettings({ settings, setSettings, seed, setSeed, isRandomSeed, setIsRandomSeed }: VideoSettingsProps) {
  const updateSettings = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  const handleFrameChange = (value: number[]) => {
    const index = Math.round((value[0] - 1) / 0.2);
    updateSettings('numFrames', frameOptions[index]);
  };

  const getSeconds = (frames: number) => {
    return (frames / 24).toFixed(2);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Settings</h2>
      <div>
        <Label htmlFor="negativePrompt">Negative Prompt</Label>
        <Input
          id="negativePrompt"
          value={settings.negativePrompt}
          onChange={(e) => updateSettings('negativePrompt', e.target.value)}
          placeholder="Describe what you don't want in the video..."
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <Clock3 className="h-4 w-4 flex-shrink-0" />
            <Label>Length: {getSeconds(settings.numFrames)}s</Label>
          </div>
          <Slider
            min={1}
            max={5}
            step={0.2}
            value={[(frameOptions.indexOf(settings.numFrames) * 0.2) + 1]}
            onValueChange={handleFrameChange}
          />
          <div className="flex justify-between text-xs">
            <span>1s</span>
            <span>5s</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <Dices className="h-4 w-4" />
            <Label>Seed</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value))}
              className="flex-grow"
              placeholder={isRandomSeed ? "Random" : "Enter seed"}
              disabled={isRandomSeed}
            />
            <Switch
              checked={!isRandomSeed}
              onCheckedChange={() => setIsRandomSeed(!isRandomSeed)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="width">Width</Label>
          <Input
            id="width"
            type="number"
            value={settings.width}
            onChange={(e) => updateSettings('width', parseInt(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="height">Height</Label>
          <Input
            id="height"
            type="number"
            value={settings.height}
            onChange={(e) => updateSettings('height', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="steps">Steps ({settings.steps})</Label>
          <Slider
            id="steps"
            min={10}
            max={60}
            value={[settings.steps]}
            onValueChange={(value) => updateSettings('steps', value[0])}
          />
        </div>

        <div className="flex-1 space-y-2">
          <Label htmlFor="cfg">CFG ({settings.cfg})</Label>
          <Slider
            id="cfg"
            min={0}
            max={10}
            step={0.1}
            value={[settings.cfg]}
            onValueChange={(value) => updateSettings('cfg', value[0])}
          />
        </div>
      </div>
    </div>
  )
}

