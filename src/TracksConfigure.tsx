import React, { useState, useEffect, useRef, PropsWithChildren } from 'react'
import { RtcPropsInterface, mediaStore } from './PropsContext'
import {
  ILocalVideoTrack,
  ILocalAudioTrack,
  createMicrophoneAudioTrack,
  createCameraVideoTrack
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
    ready: audioTrackReady,
    track: audioTrack,
    error: audioTrackError
  } = createMicrophoneAudioTrack({ encoderConfig: {} })()
  const {
    ready: videoTrackReady,
    track: videoTrack,
    error: videoTrackError
  } = createCameraVideoTrack({ encoderConfig: {} })()

  const tracks = { audioTrack, videoTrack }

  const mediaStore = useRef<mediaStore>({})

  useEffect(() => {
    console.log('LOGLOG useEffect:[tracks, trackReady, error]', {
      tracks,
      trackReady: audioTrackReady,
      error: audioTrackError
    })

    if (tracks?.audioTrack && tracks?.videoTrack) {
      setLocalAudioTrack(tracks.audioTrack)
      setLocalVideoTrack(tracks.videoTrack)
      mediaStore.current[0] = {
        audioTrack: tracks.audioTrack,
        videoTrack: tracks.videoTrack
      }
      setReady(true)
    } else if (audioTrackError) {
      console.error(audioTrackError)
      setReady(false)
    }

    return () => {
      console.log('LOGLOG useEffect:[tracks, trackReady, error] cleanup')

      if (tracks) {
        tracks.audioTrack?.close()
        tracks.videoTrack?.close()
      }
    }
  }, [
    audioTrackReady,
    videoTrackReady,
    tracks,
    audioTrackError,
    videoTrackError
  ]) //, ready])

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
