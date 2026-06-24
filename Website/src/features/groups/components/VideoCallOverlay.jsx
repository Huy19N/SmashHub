import React, { useEffect, useRef, useState } from 'react';
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, Users } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import { getAccessToken } from '../../../config/axios';
import toast from 'react-hot-toast';
import { getAllUserByIdAPI } from '../../profiles/api/profiles.api';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export default function VideoCallOverlay({ teamId, roomId, isInitiator, onClose, connection }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const localVideoRef = useRef(null);
  const connectionRef = useRef(null);
  const peersRef = useRef({}); // { connectionId: RTCPeerConnection }

  // Init SignalR & WebRTC
  useEffect(() => {
    let stream;

    const startCall = async () => {
      try {
        // 1. Get local media
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (e) {
          console.warn('Không tìm thấy camera, thử chỉ dùng micro:', e);
          stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setIsVideoMuted(true);
        }
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Use existing connection
        if (!connection) {
          throw new Error('SignalR connection is not provided.');
        }

        // 3. Register Events
        connection.on('UserJoinedCall', async (connId, userId) => {
          // Fetch user name
          let userName = "Đồng đội";
          try {
            const res = await getAllUserByIdAPI(userId);
            userName = res?.data?.fullName || res?.fullName || userName;
          } catch (e) {
            console.error('Lỗi khi lấy thông tin người dùng:', e);
          }

          setRemoteStreams(prev => {
             // If stream is already added (by ontrack), update its name.
             // If not, we store the name first, and ontrack will add the stream later.
             return {
               ...prev,
               [connId]: { ...(prev[connId] || {}), userName }
             };
          });

          // A new user joined, we are already in the room. We should initiate the offer.
          const peer = createPeer(connId, stream, connection);
          peersRef.current[connId] = peer;

          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          connection.invoke('SendSignal', connId, JSON.stringify({ type: 'offer', sdp: peer.localDescription }));
        });

        connection.on('ReceiveSignal', async (fromConnId, signalDataRaw) => {
          const signal = JSON.parse(signalDataRaw);
          let peer = peersRef.current[fromConnId];

          if (signal.type === 'offer') {
            if (!peer) {
              peer = createPeer(fromConnId, stream, connection);
              peersRef.current[fromConnId] = peer;
            }
            await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            connection.invoke('SendSignal', fromConnId, JSON.stringify({ type: 'answer', sdp: peer.localDescription }));
          } else if (signal.type === 'answer') {
            if (peer) await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          } else if (signal.candidate) {
            if (peer) await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        });

        connection.on('UserLeftCall', (connId) => {
          if (peersRef.current[connId]) {
            peersRef.current[connId].close();
            delete peersRef.current[connId];
          }
          setRemoteStreams(prev => {
            const next = { ...prev };
            delete next[connId];
            return next;
          });
        });

        // 4. Join the room
        if (isInitiator) {
          await connection.invoke('StartCall', teamId, roomId);
        } else {
          await connection.invoke('JoinCall', roomId);
        }

      } catch (err) {
        console.error('Lỗi khởi tạo video call:', err);
        toast.error('Không thể truy cập camera/micro hoặc kết nối thất bại.');
        onClose(true);
      }
    };

    startCall();

    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      Object.values(peersRef.current).forEach(peer => peer.close());
      
      if (connection) {
        connection.off('UserJoinedCall');
        connection.off('ReceiveSignal');
        connection.off('UserLeftCall');
        
        if (connection.state === signalR.HubConnectionState.Connected) {
          connection.invoke('LeaveCall', roomId).catch(() => { });
        }
      }
    };
  }, [teamId, roomId, isInitiator, connection]); // Remove onClose from dependencies to prevent infinite re-mounting loops when TeamChat re-renders

  const createPeer = (connId, stream, connection) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream tracks
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        connection.invoke('SendSignal', connId, JSON.stringify({ candidate: event.candidate }));
      }
    };

    peer.ontrack = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [connId]: { ...(prev[connId] || {}), stream: event.streams[0] }
      }));
    };

    return peer;
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoMuted(!isVideoMuted);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 flex items-center justify-between text-white border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold">Cuộc gọi nhóm</h3>
            <p className="text-sm text-gray-300 flex items-center gap-1">
              <Users className="w-3 h-3" /> {Object.keys(remoteStreams).length + 1} người
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto content-center justify-items-center">
        {/* Local Video */}
        <div className="relative w-full max-w-2xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-xl border border-white/10 flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isVideoMuted ? 'hidden' : ''}`}
          />
          {isVideoMuted && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="h-20 w-20 bg-gray-700 rounded-full flex items-center justify-center text-3xl font-bold text-gray-400">
                Bạn
              </div>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1.5 rounded-lg text-white text-sm backdrop-blur-sm">
            Bạn {isAudioMuted && <MicOff className="w-4 h-4 inline ml-2 text-red-400" />}
          </div>
        </div>

        {/* Remote Videos */}
        {Object.entries(remoteStreams).map(([connId, remoteData]) => (
          <div key={connId} className="relative w-full max-w-2xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-xl border border-white/10 flex items-center justify-center">
            {remoteData.stream ? <VideoPlayer stream={remoteData.stream} /> : <div className="text-gray-400">Đang kết nối...</div>}
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1.5 rounded-lg text-white text-sm backdrop-blur-sm">
              {remoteData.userName || "Đồng đội"}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="p-6 flex items-center justify-center gap-6 pb-12">
        <button
          onClick={toggleAudio}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
        >
          {isAudioMuted ? <MicOff className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
        </button>

        <button
          onClick={onClose}
          className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg shadow-red-500/20"
        >
          <PhoneOff className="h-7 w-7 text-white" />
        </button>

        <button
          onClick={toggleVideo}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${isVideoMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
        >
          {isVideoMuted ? <VideoOff className="h-6 w-6 text-white" /> : <Video className="h-6 w-6 text-white" />}
        </button>
      </div>
    </div>
  );
}

const VideoPlayer = ({ stream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-full object-cover"
    />
  );
};
