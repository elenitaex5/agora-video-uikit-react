import React, { useState, useEffect, useRef, PropsWithChildren } from 'react'
import { RtcPropsInterface, mediaStore } from './PropsContext'
import {
  ILocalVideoTrack,
  ILocalAudioTrack,
  createMicrophoneAndCameraTracks,
  createCameraVideoTrack
} from 'agora-rtc-react'
import { TracksProvider } from './TracksContext'

const useTrack = createMicrophoneAndCameraTracks(
  { encoderConfig: {} },
  { encoderConfig: {} }
)

const useEnvironmentTrack = createCameraVideoTrack({
  encoderConfig: {},
  facingMode: 'environment'
})

/**
 * React component that create local camera and microphone tracks and assigns them to the child components
 */
const TracksConfigure: React.FC<
  PropsWithChildren<Partial<RtcPropsInterface>>
> = (props) => {
  const [ready, setReady] = useState<boolean>(false)
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ILocalVideoTrack | null>(null)
  const [localAudioTrack, setLocalAudioTrack] =
    useState<ILocalAudioTrack | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const { ready: trackReady, tracks, error } = useTrack()
  const {
    ready: environmentReady,
    track: environmentTrack,
    error: environmentError
  } = useEnvironmentTrack()
  const mediaStore = useRef<mediaStore>({})

  const switchTrack = () => {
    if (!tracks) return
    setReady(false)

    setLocalVideoTrack(facingMode === 'user' ? environmentTrack : tracks[1])

    setReady(true)
  }

  useEffect(() => {
    if (tracks !== null) {
      setLocalAudioTrack(tracks[0])
      setLocalVideoTrack(tracks[1])
      mediaStore.current[0] = {
        audioTrack: tracks[0],
        videoTrack: tracks[1]
      }
      setReady(true)
    } else if (error) {
      console.error(error)
      setReady(false)
    }
    return () => {
      if (tracks) {
        // eslint-disable-next-line no-unused-expressions
        tracks[0]?.close()
        // eslint-disable-next-line no-unused-expressions
        tracks[1]?.close()
      }
    }
  }, [trackReady, error]) //, ready])

  if (!ready) return null

  return (
    <TracksProvider
      value={{
        localVideoTrack: localVideoTrack,
        localAudioTrack: localAudioTrack
      }}
    >
      <button
        onClick={switchTrack}
        style={{
          width: '100%',
          padding: '1rem 0'
        }}
      >
        Swap
      </button>
      {ready ? props.children : null}
    </TracksProvider>
  )
}

export default TracksConfigure
