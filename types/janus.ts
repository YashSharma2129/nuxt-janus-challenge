// types/janus.ts
export interface JanusSession {
    id: number
    attach(plugin: string): Promise<JanusPlugin>
    destroy(): Promise<void>
  }
  
  export interface JanusPlugin {
    id: number
    plugin: string
    send(message: any): Promise<void>
    createOffer(callbacks: any): void
    createAnswer(callbacks: any): void
    handleRemoteJsep(jsep: any): void
    hangup(): void
    detach(): Promise<void>
    onmessage?: (msg: any, jsep?: any) => void
    onlocaltrack?: (track: MediaStreamTrack, on: boolean) => void
    onremotetrack?: (track: MediaStreamTrack, mid: string, on: boolean) => void
    oncleanup?: () => void
  }
  
  export interface Mountpoint {
    id: number
    description: string
    roomId?: number
    createdAt: string
  }
  
  export interface VideoRoomMessage {
    videoroom: string
    room?: number
    id?: number
    display?: string
    publishers?: Publisher[]
    leaving?: number
  }
  
  export interface Publisher {
    id: number
    display?: string
    audio_codec?: string
    video_codec?: string
    talking?: boolean
  }
  
  export interface StreamingMessage {
    streaming: string
    id?: number
    result?: {
      status: string
      [key: string]: any
    }
  }
  
  export interface JanusConfig {
    server: string | string[]
    iceServers?: RTCIceServer[]
    withCredentials?: boolean
    max_poll_events?: number
    destroyOnUnload?: boolean
  }