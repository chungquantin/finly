/**
 * Audio recording utility using expo-av.
 * Records audio and returns the file URI for upload.
 */
import { Audio } from "expo-av"

let recording: Audio.Recording | null = null

/**
 * Start recording audio. Call stopRecording() to get the file URI.
 */
export async function startRecording(): Promise<void> {
  const { granted } = await Audio.requestPermissionsAsync()
  if (!granted) {
    throw new Error("Microphone permission not granted")
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  })

  const { recording: newRecording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY,
  )
  recording = newRecording
}

/**
 * Stop recording and return the file URI.
 */
export async function stopRecording(): Promise<string | null> {
  if (!recording) return null

  try {
    await recording.stopAndUnloadAsync()

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    })

    const uri = recording.getURI()
    recording = null
    return uri
  } catch (e) {
    recording = null
    throw e
  }
}

/**
 * Cancel and discard the current recording.
 */
export async function cancelRecording(): Promise<void> {
  if (!recording) return
  try {
    await recording.stopAndUnloadAsync()
  } catch {
    // ignore
  }
  recording = null

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
  })
}
