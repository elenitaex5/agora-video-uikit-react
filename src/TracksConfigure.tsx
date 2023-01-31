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
  createCameraVideoTrack,
  createMicrophoneAudioTrack
} from 'agora-rtc-react'
import { TracksProvider } from './TracksContext'

const useAudioTrack = createMicrophoneAudioTrack({ encoderConfig: {} })

const useUserTrack = createCameraVideoTrack({
  encoderConfig: {},
  facingMode: 'user'
})

const useEnvironmentTrack = createCameraVideoTrack({
  encoderConfig: {},
  facingMode: 'environment'
})

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
  const {
    ready: environmentTrackReady,
    track: environmentTrack,
    error: environmentTrackError
  } = useEnvironmentTrack()
  const {
    ready: userTrackReady,
    track: userTrack,
    error: userTrackError
  } = useUserTrack()

  // const mediaStore = useRef<mediaStore>({})
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null)

  const swapCamera = () => {
    if (!environmentTrack || !userTrack) return

    const newTrack =
      currentTrackId === userTrack.getTrackId() ? environmentTrack : userTrack

    console.log('LOGLOG swap', { environmentTrack, userTrack, newTrack })
    // alert(`New track ${newTrack.getTrackId()}`)
    setLocalVideoTrack(newTrack)
  }

  useEffect(() => {
    console.log('LOGLOG environment', {
      environmentTrackReady,
      environmentTrack,
      environmentTrackError
    })
    console.log('LOGLOG user', {
      userTrackReady,
      userTrack,
      userTrackError
    })

    if (audioTrack !== null && userTrack !== null) {
      setLocalAudioTrack(audioTrack)
      setLocalVideoTrack(userTrack)

      // mediaStore.current[0] = {
      //   audioTrack: audioTrack,
      //   videoTrack: userTrack
      // }

      setReady(true)
    } else if (audioTrackError || userTrackError || environmentTrackError) {
      console.error(audioTrackError)
      setReady(false)
    }

    return () => {
      if (audioTrack) audioTrack.close()
      if (environmentTrack) environmentTrack.close()
      if (userTrack) userTrack.close()
    }
  }, [
    audioTrackReady,
    audioTrackError,
    environmentTrackReady,
    environmentTrackError,
    userTrackReady,
    userTrackError
  ]) //, ready])

  useEffect(() => {
    console.log('LOGLOG useEffect:localVideoTrack', { localVideoTrack })
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
