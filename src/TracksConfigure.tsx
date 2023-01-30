import React, { useState, useEffect, useRef, PropsWithChildren } from 'react'
import { RtcPropsInterface, mediaStore } from './PropsContext'
import {
  ILocalVideoTrack,
  ILocalAudioTrack,
  createCameraVideoTrack,
  createMicrophoneAudioTrack
} from 'agora-rtc-react'
import { TracksProvider } from './TracksContext'

const useAudioTrack = createMicrophoneAudioTrack({ encoderConfig: {} })

// id: 'cb74589a-ca89-4f40-801c-4cccc943f6b2'
// label: 'camera2 1, facing front'

// id: '118143a1-ae7f-4ed5-a709-6209ea7c0eaa',
// label: 'camera2 0, facing back'

const useUserTrack = createCameraVideoTrack({
  encoderConfig: {},
  facingMode: 'user'
})
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
  const mediaStore = useRef<mediaStore>({})
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null)

  const swapCamera = () => {
    // console.log('LOGLOG! TracksConfigure:swapCamera', videoTracks)
    console.log('LOGLOG! TracksConfigure:swapCamera', {
      environmentTrack,
      userTrack,
      currentTrackId
    })

    // alert(`Env? ${environmentTrack === null}. User? ${userTrack === null}`)
    // alert(
    //   `Current track ${currentTrackId}. User track ${userTrack?.getTrackId()}. Environment track ${environmentTrack?.getTrackId()}`
    // )

    if (!environmentTrack || !userTrack) return
    console.log('LOGLOG! TracksConfigure:swapCamera:continue')

    const newTrack =
      currentTrackId === userTrack.getTrackId() ? environmentTrack : userTrack
    console.log('LOGLOG! TracksConfigure:swapCamera:newTrack', newTrack)

    // alert(`New track ${newTrack.getTrackId()}`)
    mediaStore.current[0].videoTrack = newTrack
    setLocalVideoTrack(newTrack)
  }

  useEffect(() => {
    // console.log('LOGLOG! TracksConfigure:useEffect', {
    //   audioTrack,
    //   userTrack,
    //   environmentTrack
    // })

    if (audioTrack !== null && environmentTrack !== null) {
      setLocalAudioTrack(audioTrack)
      setLocalVideoTrack(environmentTrack)

      mediaStore.current[0] = {
        audioTrack: audioTrack,
        videoTrack: environmentTrack
      }

      setReady(true)
    } else if (audioTrackError) {
      console.error(audioTrackError)
      setReady(false)
    }

    return () => {
      // console.log('LOGLOG! TracksConfigure:useEffect:cleanup')
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
    // console.log(
    //   'LOGLOG! TracksConfigure:useEffect:localVideoTrack',
    //   localVideoTrack
    // )
    if (localVideoTrack) setCurrentTrackId(localVideoTrack.getTrackId())
  }, [localVideoTrack])

  // useEffect(() => {
  //   // console.log('LOGLOG! TracksConfigure:useEffect:[swapCamera]')
  //   const interval = setInterval(() => {
  //     swapCamera()
  //   }, 5000)

  //   return () => {
  //     clearInterval(interval)
  //   }
  // }, [swapCamera])

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
          console.log('LOGLOG! TracksConfigure:swapCamera:click')
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
