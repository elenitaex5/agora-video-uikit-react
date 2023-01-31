import React, {
  useState,
  useEffect,
  useRef,
  PropsWithChildren,
  useMemo
} from 'react'
import { RtcPropsInterface, mediaStore } from './PropsContext'
import {
  ILocalVideoTrack,
  ILocalAudioTrack,
  createMicrophoneAndCameraTracks
} from 'agora-rtc-react'
import { TracksProvider } from './TracksContext'

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
  const {
    ready: trackReady,
    tracks,
    error
  } = useMemo(
    createMicrophoneAndCameraTracks(
      { encoderConfig: {} },
      { encoderConfig: {}, facingMode }
    ),
    [facingMode]
  )
  const mediaStore = useRef<mediaStore>({})

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

  return (
    <TracksProvider
      value={{
        localVideoTrack: localVideoTrack,
        localAudioTrack: localAudioTrack
      }}
    >
      <button
        onClick={() => {
          setFacingMode(facingMode === 'user' ? 'environment' : 'user')
        }}
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
