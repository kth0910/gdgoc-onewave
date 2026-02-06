import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const [selectedTab, setSelectedTab] = useState('videos');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('tech');
  
  // DnD State
  const [selectedAssets, setSelectedAssets] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // API State
  const [isGenerating, setIsGenerating] = useState(false);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const [assets] = useState([
    { id: 1, name: 'Senior_Resume.pdf', date: 'Edited 2 days ago', type: 'doc', color: 'rose' },
    { id: 2, name: 'Auth_Module_Refactor.js', date: 'Edited 5 hours ago', type: 'code', color: 'amber' },
    { id: 3, name: 'Product_Portfolio.pdf', date: 'Edited 1 week ago', type: 'doc', color: 'indigo' },
    { id: 4, name: 'Data_Viz_Snippet.py', date: 'Edited 3 days ago', type: 'code', color: 'emerald' },
    { id: 5, name: 'System_Architecture.docx', date: 'Edited 1 day ago', type: 'doc', color: 'blue' },
  ]);

  const [videos] = useState([
    { id: 1, title: 'Alex Rivera - Senior Engineer', date: 'Created 2 hours ago', duration: '0:58', status: 'Completed', thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 2, title: 'Project Showcase 2024', date: 'Created 1 day ago', duration: '1:15', status: 'Processing', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 3, title: 'Tech Talk Intro', date: 'Created 3 days ago', duration: '0:45', status: 'Draft', thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  ]);

  const scriptSegments = [
    { time: '00:00', title: 'Self Introduction', content: 'Senior Developer Alex here, specializing in full-stack architecture and robust cloud solutions.' },
    { time: '00:15', title: 'Core Competency', content: 'Proficient in TypeScript, Rust, AWS. I transform complex problems into elegant, scalable code.' },
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
        if (!selectedAssets.find(a => a.id === asset.id)) {
          setSelectedAssets([...selectedAssets, asset]);
        }
      }
    } catch (err) {
      console.error('Failed to parse dropped item', err);
    }
  };

  const removeAsset = (assetId: number) => {
    setSelectedAssets(selectedAssets.filter(a => a.id !== assetId));
  };

  // API Integration
  const handleGenerate = async () => {
    if (selectedAssets.length === 0) {
      alert("Please upload or select at least one asset to generate a video.");
      return;
    }

    setIsGenerating(true);

    try {
      const payload = {
        assetIds: selectedAssets.map(a => a.id),
        theme: selectedTheme
      };

      console.log("Sending generation request:", payload);

      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 202) { // Accepting 202 as per spec
          alert("Video generation started successfully!");
          // Reset or redirect logic here if needed
      } else {
        // Fallback for mock environment if checking strictly, otherwise alert success for demo
         console.warn("API request failed (expected in mock env):", response.status);
         alert("Video generation request simulated. (API endpoint not actually running)");
      }

    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to start video generation. (Network error)");
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-slate-900 text-white' : 'bg-workspace-bg text-slate-800'} font-display transition-colors duration-300`}>
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
        <div className="mt-auto flex flex-col gap-6">
           <button className={`p-3 transition-colors ${darkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-primary'}`}>
             <span className="material-symbols-outlined">help</span>
           </button>
          <div className="size-10 rounded-full bg-slate-100 overflow-hidden border-2 border-slate-50 shadow-sm">
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
              <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-xl shadow-primary/20 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0">
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
                <div key={video.id} className={`group relative rounded-3xl overflow-hidden border transition-all hover:shadow-xl hover:-translate-y-1 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
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
                  />
                </div>
                <div className="flex gap-2">
                  <button className="px-5 py-3.5 bg-primary text-white text-sm font-bold rounded-xl shadow-md shadow-primary/20">All</button>
                  <button className={`px-5 py-3.5 text-sm font-bold rounded-xl border transition-colors ${darkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Resumes</button>
                  <button className={`px-5 py-3.5 text-sm font-bold rounded-xl border transition-colors ${darkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Code</button>
                </div>
              </div>

              {/* Assets List */}
              <div className="space-y-4">
                {assets.map((asset) => (
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
                      <h4 className={`text-base font-bold truncate mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{asset.name}</h4>
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
                    <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
                    <span className="material-symbols-outlined font-bold">add</span>
                    </button>
                </div>
                <div className="relative mb-5">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                    <input 
                        className={`w-full rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-primary focus:border-primary shadow-sm outline-none border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-200'}`} 
                        placeholder="Search assets..." 
                        type="text" 
                    />
                </div>
                <div className="flex gap-2 mb-2">
                    <button className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-full shadow-md shadow-primary/20">All</button>
                    <button className={`px-4 py-1.5 text-xs font-semibold rounded-full border hover:bg-slate-50 ${darkMode ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-white text-slate-500 border-slate-200'}`}>Resume</button>
                    <button className={`px-4 py-1.5 text-xs font-semibold rounded-full border hover:bg-slate-50 ${darkMode ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-white text-slate-500 border-slate-200'}`}>Code</button>
                </div>
                </div>
                
                <div className="flex-1 overflow-y-auto px-7 pb-6 space-y-3 no-scrollbar">
                {assets.map((asset) => (
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
                        <p className={`text-[13px] font-bold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{asset.name}</p>
                        <p className={`text-[10px] mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{asset.date}</p>
                        </div>
                    </div>
                    </div>
                ))}
                </div>

                <div className={`p-6 border-t ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white/50'}`}>
                    <div className={`flex items-center justify-between text-[11px] font-bold mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span>Storage Used (85%)</span>
                        <span className="text-primary">1.7GB / 2GB</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(79,70,229,0.3)]" style={{ width: '85%' }}></div>
                    </div>
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
                        <button className={`flex items-center gap-2 px-5 py-2.5 border rounded-xl text-sm font-bold transition-colors ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                             <span className="material-symbols-outlined text-xl">visibility</span> Preview
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

                <div className={`flex-1 flex p-10 gap-10 overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-[#FAFBFF]'}`}>
                    <div className="flex-1 flex flex-col gap-10 overflow-y-auto no-scrollbar">
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
                                <h3 className={`text-xl font-extrabold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedAssets.length > 0 ? `${selectedAssets.length} Assets Selected` : 'Drop Professional Assets Here'}</h3>
                                <p className={`text-[15px] font-medium max-w-sm mx-auto leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Drag resumes or code snippets from your project panel to start AI analysis.</p>
                                <div className="mt-10 flex flex-wrap justify-center gap-3">
                                   {selectedAssets.length === 0 && (
                                     <div className={`px-4 py-2 border border-dashed rounded-xl text-[13px] text-slate-400 ${darkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                                       No assets selected
                                     </div>
                                   )}
                                   {selectedAssets.map((asset) => (
                                     <div key={asset.id} className={`flex items-center gap-2.5 px-4 py-2 border rounded-xl text-[13px] font-bold ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                        <span className="material-symbols-outlined text-lg text-emerald-500">check_circle</span> {asset.name}
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
                    <div className="w-[340px] flex flex-col shrink-0">
                        <div className="sticky top-0 space-y-8">
                            <div className="aspect-[9/16] bg-slate-950 rounded-[3rem] border-[10px] border-slate-900 overflow-hidden relative shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] ring-1 ring-slate-800">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-950 flex flex-col items-center justify-center p-8 text-center">
                                    <div className="relative z-10 w-full">
                                        <div className="size-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl">
                                            <span className="material-symbols-outlined text-white text-4xl ml-1">play_arrow</span>
                                        </div>
                                        <h4 className="text-2xl font-black text-white mb-2 leading-tight tracking-tight">ALEX RIVERA</h4>
                                        <p className="text-primary font-black text-[10px] tracking-[0.3em] mb-10 uppercase">Senior Software Engineer</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline Footer */}
                <footer className={`h-44 border-t px-10 py-7 z-10 backdrop-blur-md ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-100'}`}>
                    <div className="flex items-center gap-8 mb-6">
                        <div className="flex gap-3">
                            <button className={`size-10 flex items-center justify-center rounded-xl transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}><span className="material-symbols-outlined text-2xl">skip_previous</span></button>
                            <button className="size-10 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25 hover:bg-indigo-700"><span className="material-symbols-outlined text-2xl">play_arrow</span></button>
                            <button className={`size-10 flex items-center justify-center rounded-xl transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}><span className="material-symbols-outlined text-2xl">skip_next</span></button>
                        </div>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full relative">
                            <div className="absolute top-1/2 -translate-y-1/2 left-[25%] size-4 bg-primary rounded-full shadow-lg ring-4 ring-primary/10 cursor-pointer"></div>
                        </div>
                        <span className="text-[13px] font-bold text-slate-500 tabular-nums">00:14 / 00:58</span>
                    </div>
                </footer>
            </main>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
