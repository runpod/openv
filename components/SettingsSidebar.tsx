import VideoSettings, { VideoSettings as VideoSettingsType } from './VideoSettings'

type SettingsSidebarProps = {
  videoSettings: VideoSettingsType
  setVideoSettings: (settings: VideoSettingsType) => void
  seed: number
  setSeed: (seed: number) => void
  isRandomSeed: boolean
  setIsRandomSeed: (isRandom: boolean) => void
}

export default function SettingsSidebar({
  videoSettings,
  setVideoSettings,
  seed,
  setSeed,
  isRandomSeed,
  setIsRandomSeed
}: SettingsSidebarProps) {
  return (
    <div className="h-full w-full bg-background overflow-hidden">
      <div className="p-4 overflow-y-auto h-full">
        <VideoSettings 
          settings={videoSettings}
          setSettings={setVideoSettings}
          seed={seed}
          setSeed={setSeed}
          isRandomSeed={isRandomSeed}
          setIsRandomSeed={setIsRandomSeed}
        />
      </div>
    </div>
  )
}

