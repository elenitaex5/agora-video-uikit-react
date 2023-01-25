import React, { useState, useEffect, useRef, PropsWithChildren } from 'react'
import { RtcPropsInterface, mediaStore } from './PropsContext'
import {
  ILocalVideoTrack,
  ILocalAudioTrack,
  createMicrophoneAndCameraTracks,
  createCameraVideoTrack
} from 'agora-rtc-react'
import { TracksProvider } from './TracksContext'

const useTracks = createMicrophoneAndCameraTracks(
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
  const { ready: trackReady, tracks, error } = useTracks()
  const {
    ready: environmentTrackReady,
    track: environmentTrack,
    error: environmentError
  } = useEnvironmentTrack()
  const mediaStore = useRef<mediaStore>({})
  const [isSwapped, setIsSwapped] = useState<boolean>(false)

  const swapCamera = () => {
    if (!environmentTrack || !tracks || !tracks[1]) return

    const newTrack = isSwapped ? environmentTrack : tracks[1]
    mediaStore.current[0].videoTrack = newTrack
    setLocalVideoTrack(newTrack)
    setIsSwapped((prev) => !prev)
  }

  useEffect(() => {
    console.log('TracksConfigure:useEffect', { tracks, environmentTrack })

    if (tracks !== null && environmentTrack !== null) {
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
      console.log('TracksConfigure:useEffect:cleanup')
      if (tracks && tracks[0]) {
        // eslint-disable-next-line no-unused-expressions
        tracks[0]?.close()
      }

      if (localVideoTrack) {
        // eslint-disable-next-line no-unused-expressions
        localVideoTrack?.close()
      }

      // if (environmentTrack) {
      //   // eslint-disable-next-line no-unused-expressions
      //   environmentTrack?.close()
      // }
    }
  }, [trackReady, error, environmentTrackReady, environmentError]) //, ready])

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('TracksConfigure:useEffect:swapCamera')
      swapCamera()
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <TracksProvider
      value={{
        localVideoTrack: localVideoTrack,
        localAudioTrack: localAudioTrack,
        swapCamera
      }}
    >
      {ready ? props.children : null}
    </TracksProvider>
  )
}

export default TracksConfigure
