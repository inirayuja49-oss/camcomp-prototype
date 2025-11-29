import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Grid3x3,
  X,
  Plus,
  Trash2,
  Image,
  MessageSquare,
  RefreshCw,
  Edit3,
  Sliders,
  Crop,
  Sparkles,
  Lock,
  Play,
  Film,
  Download,
  Pencil,
  Video,
} from "lucide-react";

const CompositionCameraApp = () => {
  const [screen, setScreen] = useState("camera");
  const [selectedComposition, setSelectedComposition] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editCompositionMode, setEditCompositionMode] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [selectedPremiumItem, setSelectedPremiumItem] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // 'user' for front, 'environment' for back
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: "JohnDoe",
      content: "Amazing sunset with rule of thirds!",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      isVideo: false,
      comments: [],
    },
    {
      id: 2,
      user: "PhotoPro",
      content: "Golden hour magic ✨",
      image:
        "https://images.unsplash.com/photo-1495615080073-6b89c9839ce0?w=800",
      isVideo: false,
      comments: [{ user: "Fan123", text: "Beautiful!" }],
    },
    {
      id: 3,
      user: "CreativeShots",
      content: "Menggunakan golden ratio untuk komposisi portrait",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800",
      isVideo: false,
      comments: [{ user: "PhotoLover", text: "Komposisinya mantap!" }],
    },
    {
      id: 4,
      user: "VideoMaker",
      content: "Time-lapse dengan leading lines 🎥",
      image: null,
      isVideo: true,
      comments: [],
    },
  ]);
  const [newPost, setNewPost] = useState("");
  const [newPostMedia, setNewPostMedia] = useState(null);
  const [newPostIsVideo, setNewPostIsVideo] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [marketplaceCompositions, setMarketplaceCompositions] = useState([
    {
      id: 101,
      name: "Fibonacci Spiral",
      icon: Sparkles,
      premium: false,
      downloaded: false,
    },
    {
      id: 102,
      name: "Dynamic Symmetry",
      icon: Grid3x3,
      premium: true,
      downloaded: false,
    },
    {
      id: 103,
      name: "Leading Lines",
      icon: Sliders,
      premium: false,
      downloaded: false,
    },
    {
      id: 104,
      name: "Frame Within Frame",
      icon: Crop,
      premium: true,
      downloaded: false,
    },
  ]);
  const [customLines, setCustomLines] = useState([]);

  const compositions = [
    {
      id: 1,
      name: "Rule of Thirds",
      icon: Grid3x3,
      premium: false,
      active: true,
    },
    {
      id: 2,
      name: "Golden Ratio",
      icon: Sparkles,
      premium: true,
      active: true,
    },
    { id: 3, name: "Center Grid", icon: Plus, premium: false, active: true },
    {
      id: 4,
      name: "Diagonal Lines",
      icon: Sliders,
      premium: true,
      active: false,
    },
    { id: 5, name: "Triangle", icon: Sparkles, premium: true, active: false },
  ];

  const [userCompositions, setUserCompositions] = useState(compositions);

  // Start camera when component mounts
  useEffect(() => {
    if (screen === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [screen, facingMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: isVideo,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraStream(stream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert(
        "Tidak bisa mengakses kamera. Pastikan Anda memberikan izin akses kamera."
      );
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleCompositionSelect = (comp) => {
    if (comp.premium && !comp.unlocked) {
      setSelectedPremiumItem(comp);
      setShowPremiumPopup(true);
    } else {
      setSelectedComposition(comp.id === selectedComposition ? null : comp.id);
      setSidebarOpen(false);
    }
  };

  const handlePremiumUnlock = (method) => {
    const updated = userCompositions.map((c) =>
      c.id === selectedPremiumItem.id ? { ...c, unlocked: true } : c
    );
    setUserCompositions(updated);
    setSelectedComposition(selectedPremiumItem.id);
    setShowPremiumPopup(false);
    setSidebarOpen(false);
  };

  const toggleCompositionActive = (id) => {
    setUserCompositions(
      userCompositions.map((c) =>
        c.id === id ? { ...c, active: !c.active } : c
      )
    );
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw composition overlay on captured image
    if (selectedComposition) {
      drawCompositionOnCanvas(ctx, canvas.width, canvas.height);
    }

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageDataUrl);
    setScreen("edit");
  };

  const drawCompositionOnCanvas = (ctx, width, height) => {
    const comp = userCompositions.find((c) => c.id === selectedComposition);
    if (!comp) return;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;

    if (comp.name === "Rule of Thirds") {
      const gridW = width / 3;
      const gridH = height / 3;
      for (let i = 1; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(gridW * i, 0);
        ctx.lineTo(gridW * i, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, gridH * i);
        ctx.lineTo(width, gridH * i);
        ctx.stroke();
      }
    } else if (comp.name === "Golden Ratio") {
      const x1 = width * 0.382;
      const x2 = width * 0.618;
      const y1 = height * 0.382;
      const y2 = height * 0.618;

      ctx.beginPath();
      ctx.moveTo(x1, 0);
      ctx.lineTo(x1, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x2, 0);
      ctx.lineTo(x2, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, y1);
      ctx.lineTo(width, y1);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, y2);
      ctx.lineTo(width, y2);
      ctx.stroke();
    } else if (comp.name === "Center Grid") {
      const x1 = width / 3;
      const x2 = (width / 3) * 2;
      const y1 = height / 3;
      const y2 = (height / 3) * 2;

      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    }
  };

  const addPost = () => {
    if (newPost.trim() || newPostMedia) {
      setPosts([
        {
          id: posts.length + 1,
          user: "CurrentUser",
          content: newPost,
          image: newPostMedia,
          isVideo: newPostIsVideo,
          comments: [],
        },
        ...posts,
      ]);
      setNewPost("");
      setNewPostMedia(null);
      setNewPostIsVideo(false);
    }
  };

  const handleMediaUpload = (isVideo) => {
    // Simulate media upload
    setNewPostIsVideo(isVideo);
    if (isVideo) {
      setNewPostMedia("video-uploaded");
    } else {
      setNewPostMedia(
        "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800"
      );
    }
  };

  const addComment = (postId) => {
    if (commentText[postId]?.trim()) {
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  { user: "CurrentUser", text: commentText[postId] },
                ],
              }
            : p
        )
      );
      setCommentText({ ...commentText, [postId]: "" });
    }
  };

  const downloadComposition = (comp) => {
    if (comp.premium) {
      setSelectedPremiumItem(comp);
      setShowPremiumPopup(true);
    } else {
      const newComp = {
        ...comp,
        id: Date.now(),
        active: true,
        downloaded: true,
      };
      setUserCompositions([...userCompositions, newComp]);
      setMarketplaceCompositions(
        marketplaceCompositions.map((c) =>
          c.id === comp.id ? { ...c, downloaded: true } : c
        )
      );
    }
  };

  const addCustomLine = () => {
    if (customLines.length > 0) {
      const newComp = {
        id: Date.now(),
        name: "Custom Grid",
        icon: Grid3x3,
        premium: false,
        active: true,
        custom: true,
        lines: customLines,
      };
      setUserCompositions([...userCompositions, newComp]);
      setCustomLines([]);
      setScreen("camera");
    }
  };

  const renderComposition = () => {
    if (!selectedComposition) return null;
    const comp = userCompositions.find((c) => c.id === selectedComposition);

    if (comp.name === "Rule of Thirds") {
      return (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border border-white/40"></div>
            ))}
          </div>
        </div>
      );
    } else if (comp.name === "Golden Ratio") {
      return (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <line
              x1="38.2"
              y1="0"
              x2="38.2"
              y2="100"
              stroke="white"
              strokeWidth="0.3"
              opacity="0.6"
            />
            <line
              x1="61.8"
              y1="0"
              x2="61.8"
              y2="100"
              stroke="white"
              strokeWidth="0.3"
              opacity="0.6"
            />
            <line
              x1="0"
              y1="38.2"
              x2="100"
              y2="38.2"
              stroke="white"
              strokeWidth="0.3"
              opacity="0.6"
            />
            <line
              x1="0"
              y1="61.8"
              x2="100"
              y2="61.8"
              stroke="white"
              strokeWidth="0.3"
              opacity="0.6"
            />
          </svg>
        </div>
      );
    } else if (comp.name === "Center Grid") {
      return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-1/3 h-1/3 border-2 border-white/50"></div>
        </div>
      );
    }
    return null;
  };

  // Camera Screen
  if (screen === "camera") {
    return (
      <div className="h-[100dvh] bg-black flex flex-col relative overflow-hidden">
        {/* Camera View */}
        <div className="flex-1 relative bg-black">
          {/* Video Stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} className="hidden" />

          {renderComposition()}

          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
            <button className="text-white p-2">
              <X size={24} />
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setIsVideo(!isVideo)}
                className={`px-4 py-2 rounded-full ${
                  isVideo ? "bg-red-600" : "bg-white/20"
                } text-white text-sm font-medium`}
              >
                {isVideo ? <Film size={18} /> : <Camera size={18} />}
              </button>
            </div>
          </div>

          {/* Sidebar Toggle */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white shadow-lg"
            >
              <Grid3x3 size={24} />
            </button>
          </div>

          {/* Composition Sidebar */}
          {sidebarOpen && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 mr-16 bg-black/80 backdrop-blur-xl rounded-2xl p-3 shadow-2xl max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col gap-2 min-w-[180px]">
                <button
                  onClick={() => setEditCompositionMode(true)}
                  className="flex items-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm font-medium transition"
                >
                  <Edit3 size={18} />
                  Edit Koleksi
                </button>

                <div className="h-px bg-white/20 my-1"></div>

                {userCompositions
                  .filter((c) => c.active)
                  .map((comp) => {
                    const Icon = comp.icon;
                    return (
                      <button
                        key={comp.id}
                        onClick={() => handleCompositionSelect(comp)}
                        className={`flex items-center gap-3 p-3 rounded-xl transition ${
                          selectedComposition === comp.id
                            ? "bg-blue-600 text-white"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-sm">{comp.name}</span>
                        {comp.premium && !comp.unlocked && (
                          <Lock size={14} className="ml-auto" />
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="bg-black/90 backdrop-blur-md p-6 pb-8">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <button
              onClick={() => setScreen("edit")}
              className="p-3 text-white"
            >
              <Image size={28} />
            </button>

            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full border-4 border-white bg-transparent hover:bg-white/20 transition relative"
            >
              {isVideo && (
                <div className="absolute inset-2 rounded-full bg-red-600"></div>
              )}
            </button>

            <button onClick={flipCamera} className="p-3 text-white">
              <RefreshCw size={28} />
            </button>

            <button
              onClick={() => setScreen("forum")}
              className="p-3 text-white"
            >
              <MessageSquare size={28} />
            </button>
          </div>
        </div>

        {/* Premium Popup */}
        {showPremiumPopup && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  Premium Composition
                </h3>
                <button
                  onClick={() => setShowPremiumPopup(false)}
                  className="text-white/70"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-white/70 mb-6">
                {selectedPremiumItem?.name} adalah fitur premium. Pilih cara
                untuk mengaksesnya:
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handlePremiumUnlock("ad")}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition"
                >
                  Tonton Iklan (Akses 8 Jam)
                </button>

                <button
                  onClick={() => handlePremiumUnlock("premium")}
                  className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-4 rounded-xl font-medium hover:from-yellow-700 hover:to-yellow-800 transition"
                >
                  Upgrade Premium (Unlimited)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Composition Mode */}
        {editCompositionMode && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  Kelola Komposisi
                </h3>
                <button
                  onClick={() => setEditCompositionMode(false)}
                  className="text-white/70"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-2">
                {userCompositions.map((comp) => {
                  const Icon = comp.icon;
                  return (
                    <div
                      key={comp.id}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                    >
                      <Icon size={20} className="text-white" />
                      <span className="text-white flex-1">{comp.name}</span>
                      {comp.premium && (
                        <Lock size={14} className="text-yellow-500" />
                      )}
                      <button
                        onClick={() => toggleCompositionActive(comp.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          comp.active
                            ? "bg-green-600 text-white"
                            : "bg-gray-700 text-white/70"
                        }`}
                      >
                        {comp.active ? "Aktif" : "Nonaktif"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => setScreen("marketplace")}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} />
                  Download Komposisi
                </button>
                <button
                  onClick={() => setScreen("custom-editor")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Buat Komposisi Custom
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Edit Screen
  if (screen === "edit") {
    return (
      <div className="h-[100dvh] bg-black flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 p-4 flex justify-between items-center">
          <button onClick={() => setScreen("camera")} className="text-white">
            <X size={24} />
          </button>
          <h2 className="text-white font-semibold">Edit</h2>
          <button
            onClick={() => {
              // Save to forum or gallery
              setScreen("camera");
            }}
            className="text-blue-500 font-medium"
          >
            Simpan
          </button>
        </div>

        {/* Image Preview */}
        <div className="flex-1 bg-black relative overflow-hidden flex items-center justify-center">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="text-white/20 text-6xl">
              <Image size={80} />
            </div>
          )}
        </div>

        {/* Edit Tools */}
        <div className="bg-gray-900 p-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            <button className="flex flex-col items-center gap-2 text-white min-w-[60px]">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Grid3x3 size={20} />
              </div>
              <span className="text-xs">Komposisi</span>
            </button>
            <button className="flex flex-col items-center gap-2 text-white min-w-[60px]">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Sliders size={20} />
              </div>
              <span className="text-xs">Filter</span>
            </button>
            <button className="flex flex-col items-center gap-2 text-white min-w-[60px]">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Crop size={20} />
              </div>
              <span className="text-xs">Crop</span>
            </button>
            <button className="flex flex-col items-center gap-2 text-white min-w-[60px]">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <span className="text-xs">Efek</span>
            </button>
          </div>

          {/* Composition Selector in Edit */}
          <div className="mt-4 bg-white/5 rounded-xl p-4">
            <h3 className="text-white font-medium mb-3">Garis Komposisi</h3>
            <div className="flex gap-2 overflow-x-auto">
              {userCompositions
                .filter((c) => c.active)
                .map((comp) => {
                  const Icon = comp.icon;
                  return (
                    <button
                      key={comp.id}
                      onClick={() =>
                        setSelectedComposition(
                          comp.id === selectedComposition ? null : comp.id
                        )
                      }
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg min-w-[80px] transition ${
                        selectedComposition === comp.id
                          ? "bg-blue-600 text-white"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-xs text-center">{comp.name}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Marketplace Screen
  if (screen === "marketplace") {
    return (
      <div className="h-[100dvh] bg-gray-950 flex flex-col">
        <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-800">
          <button
            onClick={() => {
              setScreen("camera");
              setEditCompositionMode(false);
            }}
            className="text-white"
          >
            <X size={24} />
          </button>
          <h2 className="text-white font-semibold text-lg">
            Download Komposisi
          </h2>
          <div className="w-6"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {marketplaceCompositions.map((comp) => {
              const Icon = comp.icon;
              return (
                <div
                  key={comp.id}
                  className="bg-gray-900 rounded-xl p-4 border border-gray-800"
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                      <Icon size={32} className="text-white" />
                    </div>
                  </div>
                  <h3 className="text-white font-medium text-center text-sm mb-2">
                    {comp.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    {comp.premium && (
                      <Lock size={14} className="text-yellow-500" />
                    )}
                    <span className="text-gray-400 text-xs">
                      {comp.premium ? "Premium" : "Free"}
                    </span>
                  </div>
                  <button
                    onClick={() => downloadComposition(comp)}
                    disabled={comp.downloaded}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                      comp.downloaded
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {comp.downloaded ? "Sudah Didownload" : "Download"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Custom Editor Screen
  if (screen === "custom-editor") {
    return (
      <div className="h-[100dvh] bg-black flex flex-col">
        <div className="bg-gray-900 p-4 flex justify-between items-center">
          <button
            onClick={() => {
              setScreen("camera");
              setEditCompositionMode(false);
            }}
            className="text-white"
          >
            <X size={24} />
          </button>
          <h2 className="text-white font-semibold">Buat Komposisi Custom</h2>
          <button onClick={addCustomLine} className="text-blue-500 font-medium">
            Simpan
          </button>
        </div>

        <div className="flex-1 bg-gradient-to-br from-gray-800 to-gray-900 relative">
          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-6xl">
            <Camera size={80} />
          </div>

          {/* Preview custom lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {customLines.map((line, idx) => (
              <line
                key={idx}
                x1={`${line.x1}%`}
                y1={`${line.y1}%`}
                x2={`${line.x2}%`}
                y2={`${line.y2}%`}
                stroke="white"
                strokeWidth="2"
                opacity="0.6"
              />
            ))}
          </svg>
        </div>

        <div className="bg-gray-900 p-4">
          <p className="text-white/70 text-sm mb-4 text-center">
            Tap layar untuk menambahkan garis. Geser untuk mengatur posisi.
          </p>

          <div className="space-y-3">
            <button
              onClick={() =>
                setCustomLines([
                  ...customLines,
                  { x1: 0, y1: 50, x2: 100, y2: 50 },
                ])
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition"
            >
              + Garis Horizontal
            </button>
            <button
              onClick={() =>
                setCustomLines([
                  ...customLines,
                  { x1: 50, y1: 0, x2: 50, y2: 100 },
                ])
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition"
            >
              + Garis Vertikal
            </button>
            <button
              onClick={() =>
                setCustomLines([
                  ...customLines,
                  { x1: 0, y1: 0, x2: 100, y2: 100 },
                ])
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition"
            >
              + Garis Diagonal
            </button>
            {customLines.length > 0 && (
              <button
                onClick={() => setCustomLines([])}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition"
              >
                Reset Semua
              </button>
            )}
          </div>

          <p className="text-white/50 text-xs mt-4 text-center">
            {customLines.length} garis ditambahkan
          </p>
        </div>
      </div>
    );
  }

  // Forum Screen
  if (screen === "forum") {
    return (
      <div className="h-[100dvh] bg-gray-950 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-800">
          <button onClick={() => setScreen("camera")} className="text-white">
            <X size={24} />
          </button>
          <h2 className="text-white font-semibold text-lg">Forum Komposisi</h2>
          <div className="w-6"></div>
        </div>

        {/* New Post */}
        <div className="bg-gray-900 p-4 border-b border-gray-800">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Bagikan karya atau tips komposisimu..."
            className="w-full bg-gray-800 text-white rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="3"
          />

          {/* Media Preview */}
          {newPostMedia && (
            <div className="mt-3 relative">
              {newPostIsVideo ? (
                <div className="bg-gray-800 rounded-xl h-48 flex items-center justify-center relative">
                  <Video size={48} className="text-gray-400" />
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    VIDEO
                  </div>
                  <button
                    onClick={() => setNewPostMedia(null)}
                    className="absolute top-2 left-2 bg-black/50 p-1 rounded-full"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={newPostMedia}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => setNewPostMedia(null)}
                    className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-2">
              <button
                onClick={() => handleMediaUpload(false)}
                className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition"
                title="Upload Foto"
              >
                <Image size={20} />
              </button>
              <button
                onClick={() => handleMediaUpload(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition"
                title="Upload Video"
              >
                <Video size={20} />
              </button>
              <button
                onClick={() => {
                  setNewPostMedia(capturedImage);
                  setNewPostIsVideo(isVideo);
                }}
                disabled={!capturedImage}
                className={`bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition ${
                  !capturedImage ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title="Gunakan foto yang baru diambil"
              >
                <Camera size={20} />
              </button>
            </div>
            <button
              onClick={addPost}
              disabled={!newPost.trim() && !newPostMedia}
              className={`px-6 py-2 rounded-full font-medium transition ${
                newPost.trim() || newPostMedia
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              Post
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="flex-1 overflow-y-auto">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-gray-900 border-b border-gray-800 p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {post.user[0]}
                </div>
                <div>
                  <p className="text-white font-medium">{post.user}</p>
                  <p className="text-gray-500 text-xs">2 jam yang lalu</p>
                </div>
              </div>

              <p className="text-white mb-3">{post.content}</p>

              {post.image && !post.isVideo && (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-64 object-cover rounded-lg mb-3"
                />
              )}

              {post.isVideo && (
                <div className="bg-gray-800 rounded-lg h-64 mb-3 flex items-center justify-center relative">
                  <Play size={48} className="text-white absolute" />
                  <Video size={64} className="text-gray-600" />
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    VIDEO
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="mt-3 space-y-2">
                {post.comments.map((comment, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-3">
                    <p className="text-blue-400 text-sm font-medium">
                      {comment.user}
                    </p>
                    <p className="text-white text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={commentText[post.id] || ""}
                  onChange={(e) =>
                    setCommentText({
                      ...commentText,
                      [post.id]: e.target.value,
                    })
                  }
                  placeholder="Tambah komentar..."
                  className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  onClick={() => addComment(post.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition"
                >
                  Kirim
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default CompositionCameraApp;
