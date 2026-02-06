import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "@clerk/clerk-react";

const DashboardPage = () => {
  const { getToken, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('videos');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('tech');
  
  // DnD State
  const [selectedAssets, setSelectedAssets] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // API State
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedVideo, setHasGeneratedVideo] = useState(false);
  const [isAuthValidating, setIsAuthValidating] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [loadingVideoId, setLoadingVideoId] = useState<string | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [credits, setCredits] = useState<number | null>(null);

  // Reset search query when switching tabs
  useEffect(() => {
    setSearchQuery('');
  }, [selectedTab]);

  const [assets, setAssets] = useState<any[]>([]);

  const fetchPortfolios = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/functions/v1/portfolio`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_KEY,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      } else {
        console.error("Failed to fetch portfolios");
      }
    } catch (error) {
      console.error("Error fetching portfolios:", error);
    }
  };

  const [videos, setVideos] = useState<any[]>([]);

  const fetchVideos = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/functions/v1/videos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const formattedVideos = data.map((v: any) => ({
          id: v.id,
          title: v.ai_metadata?.prompt || 'Untitled Video', 
          date: new Date(v.created_at).toLocaleDateString(),
          duration: v.metadata?.duration || '00:00',
          video_url: v.video_url,
          status: v.status === 'READY' ? 'Completed' : 'Processing', 
          thumbnail: v.thumbnail_url || '' 
        }));
        setVideos(formattedVideos);
        return formattedVideos;
      } else {
        console.error("Failed to fetch videos");
        return [];
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const fetchCredits = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/functions/v1/user/credit`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Assuming API returns { credits: 100 } or just count. Adjust based on real API if needed.
        // Based on user prompt: GET /functions/v1/user/credit -> credit balance
        // We'll treat data as the balance or extract it.
        // Let's assume it returns { credit: 100 } or similar object, or just number.
        // Safe check:
        setCredits(typeof data === 'number' ? data : (data.credit || data.credits || 0));
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  useEffect(() => {
    if (!isAuthValidating) {
      fetchPortfolios();
      fetchVideos();
      fetchCredits();
    }
  }, [isAuthValidating]);

  // Auth Sync
  useEffect(() => {
    const syncAuth = async () => {
      try {
        const token = await getToken();
        // If no token yet, and we are in SignedIn, it might be loading or error.
        // But for syncAuth, we need token.
        if (!token) {
             // Strict enforcement: No token means no valid session
             console.warn("No token found, signing out.");
             await signOut();
             navigate('/');
             return; 
        }

        console.log("Syncing auth with backend...");
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${baseUrl}/functions/v1/auth`, {
           method: 'POST',
           headers: {
             'Authorization': `Bearer ${token}`,
             'Content-Type': 'application/json',
             'apikey': import.meta.env.VITE_SUPABASE_KEY,
           },
           credentials: 'include',
        });
        
        if (response.ok) {
           console.log("Auth sync successful");
           setIsAuthValidating(false); // Enable UI
        } else {
           console.error("Auth sync failed", response.status);
           alert("Authentication validation failed. Please log in again.");
           await signOut();
           navigate('/');
        }
      } catch (error) {
         console.error("Auth sync error", error);
         alert("Authentication error. Please check your connection.");
         await signOut(); 
         navigate('/');
      }
    };
    
    syncAuth();
  }, [getToken, signOut, navigate]);

  const togglePlay = () => {
    if (videoRef.current) {
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
        setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percent = Math.min(Math.max(0, offsetX / rect.width), 1);
        const newTime = percent * duration;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Video Generation Timer (Wait 10s then finish)
  useEffect(() => {
    let timerId: any;

    if (loadingVideoId) {
      timerId = setTimeout(async () => {
        setLoadingVideoId(null);
        setHasGeneratedVideo(true);
        
        // Refresh list and find the generated video
        const updatedVideos = await fetchVideos();
        const generatedVideo = updatedVideos?.find((v: any) => v.id === loadingVideoId);

        if (generatedVideo && generatedVideo.video_url) {
            setCurrentVideoUrl(generatedVideo.video_url);
            setIsPlaying(true); 
            
            // Auto-play hack for ref
            setTimeout(() => {
                if (videoRef.current) videoRef.current.play();
            }, 100);
        } else {
             alert("Video generation pending or failed. Please check My Videos later.");
             setHasGeneratedVideo(false); 
        }
      }, 15000); // 10 seconds delay
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [loadingVideoId]);


  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (isAuthValidating) {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="size-12 rounded-full border-4 border-slate-200 border-t-primary animate-spin"></div>
                <p className="text-slate-500 font-bold text-sm animate-pulse">Verifying Access...</p>
            </div>
        </div>
    );
  }


  const scriptSegments = [
    { title: 'Introduction', time: '0:00 - 0:15', content: "Hi, I'm a passionate developer fetching data from the future." },
    { title: 'Experience', time: '0:15 - 0:45', content: "I have worked on various high-impact projects." },
    { title: 'Closing', time: '0:45 - 0:58', content: "Contact me to build something amazing together." }
  ];

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, asset: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    try {
      const assetData = e.dataTransfer.getData('application/json');
      if (assetData) {
        const asset = JSON.parse(assetData);
        // Single asset selection mode: Replace existing selection
        setSelectedAssets([asset]);
      }
    } catch (err) {
      console.error('Failed to parse dropped item', err);
    }
  };

  const removeAsset = (assetId: number) => {
    setSelectedAssets(selectedAssets.filter(a => a.id !== assetId));
  };

  // File Upload Handlers
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('pdf', file);
      // Determine type based on extension (simple heuristic)
      const isCode = file.name.match(/\.(js|ts|py|rs|go|java|cpp)$/i);
      const type = isCode ? 'code' : 'doc';
      
      formData.append('title', file.name);
      formData.append('raw_data', JSON.stringify({ 
         type: type, 
         originalSize: file.size, 
         extension: file.name.split('.').pop() 
      }));

      // Optimistic UI update (optional) or wait for response
      // Let's verify with alert first as per previous pattern or just simple loading
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/functions/v1/portfolio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_KEY,
        },
        body: formData,
        credentials: 'include',
      });

      if (response.ok || response.status === 201) {
        const newAsset = await response.json();
        // Fallback for mock environment if response is empty or not as expected
        console.log(newAsset.id);
        const safeAsset = newAsset && newAsset.id ? newAsset : {
           id: Date.now(),
           name: file.name,
           date: 'Just now',
           type: isCode ? 'code' : 'doc',
           color: 'emerald'
        };
        setAssets([safeAsset, ...assets]);
        alert("Asset uploaded successfully!");
      } else {
         console.warn("Upload failed:", response.status);
         alert("Failed to upload asset.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload asset.");
    } finally {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGenerate = async () => {
    if (selectedAssets.length === 0) {
      alert("Please upload or select at least one asset to generate a video.");
      return;
    }

    setIsGenerating(true);

    try {
      // Map internal theme to API visual_style
      const themeMap: Record<string, string> = {
        'tech': 'standard tech',
        'cyber': 'neon high-energy',
        'eco': 'eco modern'
      };

      const payload = {
        portfolio_id: selectedAssets[0].id, // API expects single ID
        visual_style: themeMap[selectedTheme] || 'standard tech'
      };

      console.log("Sending generation request:", payload);

      const token = await getToken();
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/functions/v1/videos/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (response.ok || response.status === 202 || response.status === 201) { 
          const data = await response.json();
          if (data && data.id) {
              setLoadingVideoId(data.id);
          } else {
              alert("Failed to start generation.");
          }
      } else {
         console.warn("API request failed:", response.status);
         alert("Failed to start video generation.");
      }

    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to start video generation. (Network error)");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (currentVideoUrl) {
        const link = document.createElement('a');
        link.href = currentVideoUrl;
        link.download = `video-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-slate-900 text-white' : 'bg-workspace-bg text-slate-800'} font-display transition-colors duration-300`}>
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.doc,.docx,.txt,.md,.js,.ts,.py,.java,.c,.cpp,.rs,.go"
      />

      {/* App Sidebar */}
      <aside className={`w-20 flex flex-col items-center py-8 gap-10 border-r shrink-0 z-20 shadow-sm transition-colors duration-300 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <Link to="/" className="size-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20" title="Vidifolio">
          <span className="material-symbols-outlined font-bold text-2xl">movie_filter</span>
        </Link>
        <nav className="flex flex-col gap-6 flex-1">
          {/* Button 1: Created Videos */}
          <button 
            onClick={() => setSelectedTab('videos')} 
            className={`p-3.5 rounded-2xl transition-all ${selectedTab === 'videos' ? 'text-primary bg-primary/5 border border-primary/10' : 'text-slate-400 hover:text-primary'} ${darkMode && selectedTab !== 'videos' ? 'hover:text-white text-slate-500' : ''}`} 
            title="My Videos"
          >
            <span className="material-symbols-outlined icon-filled">movie</span>
          </button>
          
          {/* Button 2: Uploaded Projects */}
          <button 
            onClick={() => setSelectedTab('projects')} 
            className={`p-3.5 rounded-2xl transition-all ${selectedTab === 'projects' ? 'text-primary bg-primary/5 border border-primary/10' : 'text-slate-400 hover:text-primary'} ${darkMode && selectedTab !== 'projects' ? 'hover:text-white text-slate-500' : ''}`} 
            title="My Projects"
          >
            <span className="material-symbols-outlined">folder</span>
          </button>

          {/* Button 4: Settings */}
          <button 
            onClick={() => setSelectedTab('settings')} 
            className={`p-3.5 rounded-2xl transition-all ${selectedTab === 'settings' ? 'text-primary bg-primary/5 border border-primary/10' : 'text-slate-400 hover:text-primary'} ${darkMode && selectedTab !== 'settings' ? 'hover:text-white text-slate-500' : ''}`} 
            title="Settings"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </nav>
        <div className="mt-auto flex flex-col items-center gap-6">
           {/* Credit Display */}
           {credits !== null && (
             <div className="flex flex-col items-center gap-1 group">
                <div className="flex items-center gap-1 bg-slate-100 rounded-full px-2 py-1 border border-slate-200">
                    <span className="material-symbols-outlined text-[14px] text-amber-500">monetization_on</span>
                    <span className="text-[10px] font-bold text-slate-600">{credits}</span>
                    <button 
                        onClick={() => navigate('/credits')}
                        className="ml-1 size-4 bg-primary text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors"
                        title="Add Credits"
                    >
                        <span className="material-symbols-outlined text-[10px] font-bold">add</span>
                    </button>
                </div>
             </div>
           )}

           <button 
              onClick={() => setIsHelpOpen(true)}
              className={`p-3 transition-colors ${darkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-primary'}`}
            >
             <span className="material-symbols-outlined">help</span>
           </button>
          <div className="size-10 rounded-full bg-slate-100 overflow-hidden border-2 border-slate-50 shadow-sm relative group cursor-pointer">
            <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-500 font-bold">DK</div>
          </div>
        </div>
      </aside>

      {/* Conditional Rendering for Main Views vs Editor */}
      {selectedTab !== 'editor' ? (
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className={`h-20 border-b flex items-center justify-between px-10 z-10 transition-colors duration-300 ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-100'} backdrop-blur-sm`}>
          <div className="flex items-center gap-4">
            <h1 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {selectedTab === 'videos' && 'My Videos'}
              {selectedTab === 'projects' && 'My Projects'}
              {selectedTab === 'settings' && 'Settings'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {selectedTab === 'videos' && (
              <button 
                onClick={() => setSelectedTab('editor')}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-xl shadow-primary/20 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="material-symbols-outlined text-xl">add</span> Create Video
              </button>
            )}
            {selectedTab === 'projects' && (
              <button 
                onClick={handleUploadClick}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-xl shadow-primary/20 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="material-symbols-outlined text-xl">upload_file</span> Upload Asset
              </button>
            )}
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto p-10 ${darkMode ? 'bg-slate-900' : 'bg-[#FAFBFF]'}`}>
          
          {/* VIDEOS VIEW */}
          {selectedTab === 'videos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {videos.map((video) => (
                <div 
                    key={video.id} 
                    className={`group relative rounded-3xl overflow-hidden border transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                    onClick={() => {
                        if (video.video_url) {
                            setCurrentVideoUrl(video.video_url);
                            setHasGeneratedVideo(true);
                            setIsPlaying(true);
                             setTimeout(() => {
                                if (videoRef.current) videoRef.current.play();
                            }, 100);
                        }
                    }}
                >
                  <div className="aspect-[9/16] bg-slate-100 relative overflow-hidden group-hover:after:absolute group-hover:after:inset-0 group-hover:after:bg-black/20 group-hover:after:transition-all">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-[10px] font-bold">
                      {video.duration}
                    </div>
                    <button className="absolute inset-0 m-auto size-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 z-10">
                       <span className="material-symbols-outlined text-3xl">play_arrow</span>
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className={`font-bold text-lg leading-tight line-clamp-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{video.title}</h3>
                       <button className={`p-1 rounded-full ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                         <span className="material-symbols-outlined">more_vert</span>
                       </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                       <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{video.date}</span>
                       <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                         video.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                         video.status === 'Processing' ? 'bg-amber-100 text-amber-600' :
                         'bg-slate-100 text-slate-500'
                       }`}>
                         {video.status}
                       </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Create New Placeholder */}
              <button 
                onClick={() => setSelectedTab('editor')}
                className={`group rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all hover:border-primary/50 hover:bg-primary/5 aspect-[9/16] md:aspect-auto md:h-auto ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}
              >
                 <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                   <span className="material-symbols-outlined text-3xl">add</span>
                 </div>
                 <span className={`font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Create New Video</span>
              </button>
            </div>
          )}

          {/* PROJECTS VIEW */}
          {selectedTab === 'projects' && (
            <div className="max-w-5xl mx-auto">
              {/* Search & Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                  <input 
                    className={`w-full rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none border transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 focus:shadow-sm'}`} 
                    placeholder="Search assets..." 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Assets List */}
              <div className="space-y-4">
                {assets.filter(asset => asset.title.toLowerCase().includes(searchQuery.toLowerCase())).map((asset) => (
                  <div key={asset.id} className={`group p-5 rounded-2xl border transition-all hover:shadow-lg cursor-pointer flex items-center gap-5 ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-primary/50' : 'bg-white border-slate-100 hover:border-primary/30'}`}>
                    <div 
                      className={`size-14 flex items-center justify-center rounded-2xl text-xl shrink-0 ${
                        asset.color === 'rose' ? 'bg-rose-50 text-rose-500' :
                        asset.color === 'amber' ? 'bg-amber-50 text-amber-500' :
                        asset.color === 'indigo' ? 'bg-indigo-50 text-indigo-500' :
                        asset.color === 'blue' ? 'bg-blue-50 text-blue-500' :
                        'bg-emerald-50 text-emerald-500'
                      }`}
                    >
                      <span className="material-symbols-outlined">{asset.type === 'doc' ? 'description' : asset.type === 'code' ? 'terminal' : 'description'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-base font-bold truncate mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{asset.title}</h4>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{asset.date}</span>
                        <div className={`size-1 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
                         <span className={`text-xs font-medium uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{asset.type === 'code' ? 'Code Snippet' : 'Document'}</span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                       <button className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`} title="Edit">
                         <span className="material-symbols-outlined">edit</span>
                       </button>
                       <button className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-rose-900/30 text-rose-500' : 'hover:bg-rose-50 text-rose-500'}`} title="Delete">
                         <span className="material-symbols-outlined">delete</span>
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {selectedTab === 'settings' && (
             <div className="max-w-2xl mx-auto">
                <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                   <div className={`p-8 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                      <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Preferences</h2>
                      <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage your workspace appearance and default settings.</p>
                   </div>
                   
                   <div className="p-8 space-y-8">
                      {/* Dark Mode Toggle */}
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={`size-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-500'}`}>
                               <span className="material-symbols-outlined text-2xl">dark_mode</span>
                            </div>
                            <div>
                               <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>Dark Mode</h3>
                               <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Switch between light and dark themes</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => setDarkMode(!darkMode)}
                           className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${darkMode ? 'bg-primary' : 'bg-slate-200'}`}
                         >
                            <div className={`absolute top-1 left-1 size-6 bg-white rounded-full shadow-md transition-transform duration-300 ${darkMode ? 'translate-x-8' : 'translate-x-0'}`}></div>
                         </button>
                      </div>
                      
                      {/* Language */}
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={`size-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
                               <span className="material-symbols-outlined text-2xl">language</span>
                            </div>
                            <div>
                               <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>Language</h3>
                               <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>System language for generation</p>
                            </div>
                         </div>
                         <select className={`px-4 py-2 rounded-xl text-sm font-bold outline-none border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                            <option>Korean (한국어)</option>
                            <option>English</option>
                         </select>
                      </div>

                   </div>
                </div>
             </div>
          )}

        </div>
      </main>
      ) : (
        /* EDITOR VIEW (Restored components) */
        <>
            {/* Project Panel (Asset Selection) */}
            <section className={`w-80 flex flex-col border-r shrink-0 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-sidebar-light border-slate-200'}`}>
                <div className="p-7">
                <div className="flex items-center justify-between mb-7">
                    <h2 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Project Assets</h2>
                    <button 
                      onClick={handleUploadClick}
                      className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                    >
                    <span className="material-symbols-outlined font-bold">add</span>
                    </button>
                </div>
                <div className="relative mb-5">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                    <input 
                        className={`w-full rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-primary focus:border-primary shadow-sm outline-none border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-200'}`} 
                        placeholder="Search assets..." 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                </div>
                
                <div className="flex-1 overflow-y-auto px-7 pb-6 space-y-3 no-scrollbar">
                {assets.filter(asset => asset.title.toLowerCase().includes(searchQuery.toLowerCase())).map((asset) => (
                    <div 
                      key={asset.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, asset)}
                      className={`group p-4 rounded-2xl border border-transparent cursor-grab active:cursor-grabbing transition-all shadow-sm hover:shadow-md ${darkMode ? 'bg-slate-700 hover:border-primary/30' : 'bg-white hover:border-primary/30'}`}
                    >
                    <div className="flex items-start gap-4">
                        <div 
                        className={`size-11 flex items-center justify-center rounded-xl ${
                            asset.color === 'rose' ? 'bg-rose-50 text-rose-500' :
                            asset.color === 'amber' ? 'bg-amber-50 text-amber-500' :
                            asset.color === 'indigo' ? 'bg-indigo-50 text-indigo-500' :
                            asset.color === 'blue' ? 'bg-blue-50 text-blue-500' :
                            'bg-emerald-50 text-emerald-500'
                        }`}
                        >
                        <span className="material-symbols-outlined">{asset.type === 'doc' ? 'description' : asset.type === 'code' ? 'terminal' : 'description'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-bold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{asset.title}</p>
                        <p className={`text-[10px] mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{asset.date}</p>
                        </div>
                    </div>
                    </div>
                ))}
                </div>


            </section>

            {/* Main Workspace */}
            <main className={`flex-1 flex flex-col overflow-hidden relative ${darkMode ? 'bg-slate-900' : 'bg-workspace-bg'}`}>
                <header className={`h-20 border-b flex items-center justify-between px-10 z-10 ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-100'} backdrop-blur-sm`}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedTab('videos')} className="hover:text-primary transition-colors">
                            <span className={`material-symbols-outlined text-2xl ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>arrow_back</span>
                        </button>
                        <div className={`h-6 w-px mx-1 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                        <h1 className={`text-[17px] font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>New Video Project</h1>
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-md border border-emerald-100 uppercase tracking-wider ml-2">DRAFT</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                          onClick={handleDownload}
                          disabled={!hasGeneratedVideo || !currentVideoUrl}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm'}`}
                        >
                            <span className="material-symbols-outlined text-xl">download</span> Download
                        </button>

                        <button 
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className={`flex items-center gap-2 px-7 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-xl shadow-primary/20 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                             {isGenerating ? (
                               <>
                                <span className="material-symbols-outlined text-xl animate-spin">refresh</span> Generating...
                               </>
                             ) : (
                               <>
                                <span className="material-symbols-outlined text-xl">auto_awesome</span> Generate
                               </>
                             )}
                        </button>
                    </div>
                </header>

                <div className={`flex-1 flex flex-col p-10 gap-10 overflow-y-auto ${darkMode ? 'bg-slate-900' : 'bg-[#FAFBFF]'}`}>
                    <div className="flex-1 flex flex-col gap-10 overflow-visible">
                        {/* Drop Zone */}
                        <div className="relative group">
                            <div className={`absolute -inset-1 bg-gradient-to-r from-primary/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur ${isDragging ? 'opacity-100' : 'opacity-75 group-hover:opacity-100'} transition duration-1000`}></div>
                            <div 
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`relative border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center transition-all ${isDragging ? 'border-primary bg-primary/5' : `group-hover:border-primary/40 group-hover:shadow-xl group-hover:shadow-primary/5 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}`}
                            >
                                <div className="size-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mb-6 ring-1 ring-primary/10">
                                   <span className="material-symbols-outlined text-4xl">upload_file</span>
                                </div>
                                <h3 className={`text-xl font-extrabold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedAssets.length > 0 ? `Asset Selected` : 'Drop Professional Asset Here'}</h3>
                                <p className={`text-[15px] font-medium max-w-sm mx-auto leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Drag a resume or code snippet from your project panel to start AI analysis.</p>
                                <div className="mt-10 flex flex-wrap justify-center gap-3">
                                   {selectedAssets.length === 0 && (
                                     <div className={`px-4 py-2 border border-dashed rounded-xl text-[13px] text-slate-400 ${darkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                                       No assets selected
                                     </div>
                                   )}
                                   {selectedAssets.map((asset) => (
                                     <div key={asset.id} className={`flex items-center gap-2.5 px-4 py-2 border rounded-xl text-[13px] font-bold ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                        <span className="material-symbols-outlined text-lg text-emerald-500">check_circle</span> {asset.title}
                                        <button onClick={() => removeAsset(asset.id)} className="ml-1 hover:text-rose-500 text-slate-400 transition-colors"><span className="material-symbols-outlined text-lg">close</span></button>
                                     </div>
                                   ))}
                                </div>
                            </div>
                        </div>

                        {/* Style Selector */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className={`text-lg font-extrabold flex items-center gap-2.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                   <span className="material-symbols-outlined text-primary text-2xl">palette</span> Visual Style
                                </h3>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                {/* Tech Minimalist */}
                                <div onClick={() => setSelectedTheme('tech')} className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all shadow-sm ${selectedTheme === 'tech' ? 'border-primary shadow-xl shadow-primary/10' : 'border-transparent hover:border-slate-300'}`}>
                                    <div className="h-32 bg-gradient-to-br from-[#1E293B] to-[#4F46E5] flex items-center justify-center p-6 relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                        <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase text-center relative z-10 leading-tight">TECH MINIMALIST</span>
                                    </div>
                                    <div className={`p-4 flex items-center justify-between ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                                        <span className={`text-[13px] font-extrabold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Standard Tech</span>
                                        {selectedTheme === 'tech' ? <span className="material-symbols-outlined text-primary text-xl">check_circle</span> : <span className="material-symbols-outlined text-slate-200 text-xl">circle</span>}
                                    </div>
                                </div>
                                {/* Cyberpunk */}
                                <div onClick={() => setSelectedTheme('cyber')} className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all shadow-sm ${selectedTheme === 'cyber' ? 'border-primary shadow-xl shadow-primary/10' : 'border-transparent hover:border-slate-300'}`}>
                                    <div className="h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 flex items-center justify-center p-6">
                                        <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase text-center leading-tight">NEON HIGH-ENERGY</span>
                                    </div>
                                    <div className={`p-4 flex items-center justify-between ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                                        <span className={`text-[13px] font-extrabold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Cyberpunk</span>
                                        {selectedTheme === 'cyber' ? <span className="material-symbols-outlined text-primary text-xl">check_circle</span> : <span className="material-symbols-outlined text-slate-200 text-xl">circle</span>}
                                    </div>
                                </div>
                                 {/* Eco Modern */}
                                 <div onClick={() => setSelectedTheme('eco')} className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all shadow-sm ${selectedTheme === 'eco' ? 'border-primary shadow-xl shadow-primary/10' : 'border-transparent hover:border-slate-300'}`}>
                                    <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center p-6">
                                        <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase text-center leading-tight">ECO MODERN</span>
                                    </div>
                                    <div className={`p-4 flex items-center justify-between ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                                        <span className={`text-[13px] font-extrabold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Nature Clean</span>
                                        {selectedTheme === 'eco' ? <span className="material-symbols-outlined text-primary text-xl">check_circle</span> : <span className="material-symbols-outlined text-slate-200 text-xl">circle</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Script Editor */}
                        <div>
                           <div className="flex items-center justify-between mb-6">
                                <h3 className={`text-lg font-extrabold flex items-center gap-2.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                   <span className="material-symbols-outlined text-primary text-2xl">edit_note</span> AI Script
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {scriptSegments.map((segment, index) => (
                                    <div key={index} className={`flex gap-5 p-6 rounded-2xl border group shadow-sm hover:shadow-md transition-shadow ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                        <div className="text-[11px] font-black text-slate-300 mt-1">{segment.time}</div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase text-primary mb-2 tracking-[0.1em]">{segment.title}</p>
                                            <textarea 
                                                className={`w-full bg-transparent border-none p-0 text-[14px] font-medium focus:ring-0 resize-none h-12 leading-relaxed outline-none ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                                                defaultValue={segment.content}
                                            ></textarea>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="w-full flex flex-col shrink-0">
                        <div className="sticky top-0 space-y-8">
                            <div className="aspect-video bg-slate-950 rounded-[2rem] border-[4px] border-slate-900 overflow-hidden relative shadow-2xl ring-1 ring-slate-800">
                                {hasGeneratedVideo && currentVideoUrl ? (
                                    <video 
                                        ref={videoRef}
                                        src={currentVideoUrl}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        // autoPlay controlled via ref or effect
                                        loop
                                        muted={false} 
                                        controls={false}
                                        onTimeUpdate={handleTimeUpdate}
                                        onLoadedMetadata={handleLoadedMetadata}
                                        onEnded={() => setIsPlaying(false)}
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-950 flex flex-col items-center justify-center p-8 text-center">
                                        <div className="relative z-10 w-full">
                                            <div className="size-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl">
                                                <span className="material-symbols-outlined text-white text-4xl ml-1">{isPlaying ? 'pause' : 'play_arrow'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline Footer */}
                {/* Timeline Footer - Only show after generation */}
                {hasGeneratedVideo && (
                <footer className={`h-28 border-t px-10 py-5 z-10 backdrop-blur-md transition-all ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-100'}`}>
                    <div className="flex items-center gap-8 h-full">
                        <div className="flex gap-3">
                            <button className={`size-10 flex items-center justify-center rounded-xl transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}><span className="material-symbols-outlined text-2xl">skip_previous</span></button>
                            <button 
                                onClick={togglePlay}
                                className="size-10 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25 hover:bg-indigo-700"
                            >
                                <span className="material-symbols-outlined text-2xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                            </button>
                            <button className={`size-10 flex items-center justify-center rounded-xl transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}><span className="material-symbols-outlined text-2xl">skip_next</span></button>
                        </div>
                        <div 
                            className="flex-1 h-2 bg-slate-100 rounded-full relative cursor-pointer group"
                            onClick={handleSeek}
                        >
                            <div 
                                className="absolute top-0 left-0 h-full bg-primary rounded-full"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            ></div>
                            <div 
                                className="absolute top-1/2 -translate-y-1/2 size-4 bg-primary rounded-full shadow-lg ring-4 ring-primary/10 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-[13px] font-bold text-slate-500 tabular-nums min-w-[100px] text-right">
                             {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>
                </footer>
                )}
            </main>
        </>
      )}

      {/* Video Generation Loading Overlay */}
      {loadingVideoId && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-white">
          <div className="size-24 rounded-full border-4 border-white/10 border-t-primary animate-spin mb-8"></div>
          <h2 className="text-3xl font-black tracking-tight mb-2 animate-pulse">GENERATING VIDEO</h2>
          <p className="text-slate-400 font-medium tracking-widest uppercase text-sm">AI is analyzing your assets...</p>
        </div>
      )}
      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-lg p-8 rounded-3xl shadow-2xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">help</span> How to use
              </h2>
              <button 
                onClick={() => setIsHelpOpen(false)}
                className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">1</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Upload Assets</h3>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Upload your resume (PDF) or code files in the <strong>My Projects</strong> tab or directly in the Editor panel.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">2</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Select & Drop</h3>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Drag a file from the <strong>Project Assets</strong> panel and drop it into the center zone.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">3</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Choose Style</h3>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Select a visual theme (Tech, Cyber, or Eco) that matches your persona.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">4</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Generate</h3>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Click <strong>Generate</strong> to create your AI video portfolio.
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsHelpOpen(false)}
              className="w-full mt-8 py-3.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
            >
              Got it!
            </button>
          </div>
        </div>
      )}



    </div>
  );
};



export default DashboardPage;
