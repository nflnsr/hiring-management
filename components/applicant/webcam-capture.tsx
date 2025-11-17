"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { X } from "lucide-react";

interface WebcamCaptureProps {
  onPhotoCapture: (photoData: string) => void;
  onCancel: () => void;
}

export default function WebcamCapture({ onPhotoCapture, onCancel }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [handLandmarker, setHandLandmarker] = useState<any>(null);
  const [detectedPose, setDetectedPose] = useState<number>(0);
  const [countDown, setCountDown] = useState<number>(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const initializeHandDetection = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const detector = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          },
          numHands: 1,
          runningMode: "VIDEO",
        });
        setHandLandmarker(detector);
      } catch (error) {
        console.error("Error initializing hand detection:", error);
      }
    };

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
        alert("Unable to access webcam. Please check permissions.");
      }
    };

    initializeHandDetection();
    startWebcam();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isCapturing && countDown > 0) {
      const timer = setTimeout(() => setCountDown(countDown - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (isCapturing && countDown === 0) {
      capturePhoto();
    }
  }, [isCapturing, countDown]);

  const detectPose = () => {
    if (!videoRef.current || !handLandmarker || videoRef.current.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    try {
      const results = handLandmarker.detectForVideo(videoRef.current, performance.now());

      if (results.landmarks && results.landmarks.length > 0) {
        const hand = results.landmarks[0];
        const indexTip = hand[8];
        const middleTip = hand[12];
        const ringTip = hand[16];

        const indexRaised = indexTip.y < hand[6].y;
        const middleRaised = middleTip.y < hand[10].y;
        const ringRaised = ringTip.y < hand[14].y;

        const fingersRaised = [indexRaised, middleRaised, ringRaised].filter(Boolean).length;

        if (fingersRaised === 3) {
          setDetectedPose(3);
          if (!isCapturing) {
            setIsCapturing(true);
            setCountDown(3);
          }
        } else {
          setDetectedPose(0);
          setIsCapturing(false);
        }
      }
    } catch (error) {
      console.error("Error detecting pose:", error);
    }

    animationFrameRef.current = requestAnimationFrame(detectPose);
  };

  useEffect(() => {
    if (handLandmarker) {
      detectPose();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handLandmarker]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const photoData = canvasRef.current.toDataURL("image/jpeg");
        onPhotoCapture(photoData);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Raise Your Hand to Capture</h2>
            <p className="text-sm text-gray-600">
              We'll take the photo once your hand pose is detected.
            </p>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative bg-gray-900 aspect-video flex items-center justify-center overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {detectedPose === 3 && (
            <div
              className="absolute border-4 border-green-500"
              style={{
                left: "20%",
                top: "20%",
                right: "20%",
                bottom: "20%",
              }}
            >
              <span className="absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded bg-green-600 text-white">
                Pose 1
              </span>
            </div>
          )}

          {detectedPose === 0 && (
            <div
              className="absolute border-4 border-red-500"
              style={{
                left: "20%",
                top: "20%",
                right: "20%",
                bottom: "20%",
              }}
            >
              <span className="absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded bg-red-600 text-white">
                Undetected
              </span>
            </div>
          )}

          {isCapturing && countDown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div className="text-center">
                <p className="text-white text-lg mb-4">Capturing photo in</p>
                <p className="text-white text-5xl font-bold">{countDown}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            To take a picture, follow the hand poses in the order shown below. The system will
            automatically capture the image once the final pose is detected.
          </p>

          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((pose, idx) => (
              <div key={pose} className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                    pose <= detectedPose ? "bg-teal-100" : "bg-gray-200"
                  }`}
                >
                  <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                  </svg>
                </div>
                {idx < 2 && <span className="text-2xl text-gray-400">›</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
