import React, { useState, useEffect, useRef, PropsWithChildren } from 'react'
import { RtcPropsInterface, mediaStore } from './PropsContext'
import {
  ILocalVideoTrack,
  ILocalAudioTrack,
  createCameraVideoTrack,
  createMicrophoneAudioTrack,
  ICameraVideoTrack,
  AgoraRTCError
} from 'agora-rtc-react'
import { TracksProvider } from './TracksContext'

const useUserTrack = createCameraVideoTrack({
  encoderConfig: {},
  facingMode: 'user'
})

const useEnvironmentTrack = createCameraVideoTrack({
  encoderConfig: {},
  facingMode: 'environment'
})

const useAudioTrack = createMicrophoneAudioTrack({ encoderConfig: {} })

// id: 'cb74589a-ca89-4f40-801c-4cccc943f6b2'
// label: 'camera2 1, facing front'

// id: '118143a1-ae7f-4ed5-a709-6209ea7c0eaa',
// label: 'camera2 0, facing back'

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

  const {
    ready: audioTrackReady,
    track: audioTrack,
    error: audioTrackError
  } = useAudioTrack()

  const mediaStore = useRef<mediaStore>({})
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null)
  const [videoTrack, setVideoTrack] = useState<{
    ready: boolean
    track: ICameraVideoTrack | null
    error: AgoraRTCError | null
    facingMode: 'user' | 'environment'
  }>({
    ...useUserTrack(),
    facingMode: 'user'
  })

  const swapCamera = () => {
    console.log('LOGLOG swapCamera', { localVideoTrack, videoTrack })

    if (videoTrack.facingMode === 'user') {
      setVideoTrack({
        ...useEnvironmentTrack(),
        facingMode: 'environment'
      })
    } else {
      setVideoTrack({
        ...useUserTrack(),
        facingMode: 'user'
      })
    }
    // mediaStore.current[0].videoTrack = newTrack
    // setLocalVideoTrack(newTrack)
  }

  useEffect(() => {
    console.log(
      'LOGLOG useEffect:[audioTrackReady, audioTrackError, videoTrack]',
      {
        videoTrack,
        currentTrackId
      }
    )

    if (audioTrack !== null && mediaStore.current[0].audioTrack === null) {
      setLocalAudioTrack(audioTrack)
      mediaStore.current[0].audioTrack = audioTrack
      setReady(true)
    }

    if (
      videoTrack?.track !== null &&
      videoTrack?.ready &&
      currentTrackId !== videoTrack.track.getTrackId()
    ) {
      setLocalVideoTrack(videoTrack.track)
      mediaStore.current[0].videoTrack = videoTrack.track
      setReady(true)
    }

    if (audioTrackError || videoTrack?.error) {
      console.error(audioTrackError)
      setReady(false)
    }

    return () => {
      if (audioTrack) audioTrack.close()
      // if (environmentTrack) environmentTrack.close()
      // if (userTrack) userTrack.close()
      if (videoTrack?.track) videoTrack.track.close()
    }
  }, [audioTrackReady, audioTrackError, videoTrack]) //, ready])

  useEffect(() => {
    console.log('LOGLOG useEffect:[localVideoTrack]', { localVideoTrack })
    if (localVideoTrack) setCurrentTrackId(localVideoTrack.getTrackId())
  }, [localVideoTrack])

  return (
    <TracksProvider
      value={{
        localVideoTrack: localVideoTrack,
        localAudioTrack: localAudioTrack,
        swapCamera
      }}
    >
      <button
        style={{
          padding: '1rem 0'
        }}
        onClick={() => {
          swapCamera()
        }}
      >
        SWAP CAMERA
      </button>
      {ready ? props.children : null}
    </TracksProvider>
  )
}

export default TracksConfigure
