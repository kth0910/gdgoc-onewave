import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const [selectedTab, setSelectedTab] = useState('folder');
  const [selectedTheme, setSelectedTheme] = useState('tech');
  
  const [assets] = useState([
    { id: 1, name: '시니어_개발자_이력서.pdf', date: '2일 전 수정됨', type: 'doc', color: 'rose' },
    { id: 2, name: '인증_모듈_리팩토링.js', date: '5시간 전 수정됨', type: 'code', color: 'amber' },
    { id: 3, name: '제품_포트폴리오.pdf', date: '1주일 전 수정됨', type: 'doc', color: 'indigo' },
    { id: 4, name: '데이터_시각화_스니펫.py', date: '3일 전 수정됨', type: 'code', color: 'emerald' },
  ]);

  const [scriptSegments] = useState([
    { time: '00:00', title: '자기 소개', content: '풀스택 아키텍처와 견고한 클라우드 솔루션을 전문으로 하는 시니어 개발자 알렉스를 소개합니다.' },
    { time: '00:15', title: '핵심 역량', content: 'TypeScript, Rust, AWS 숙련자. 복잡한 문제를 우아하고 확장 가능한 코드로 변환합니다.' },
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-workspace-bg text-slate-800 font-display">
      {/* Sidebar */}
      <aside className="w-20 flex flex-col items-center py-8 gap-10 bg-white border-r border-slate-100 shrink-0 z-20 shadow-sm">
        <Link to="/" className="size-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20" title="Vidifolio">
          <span className="material-symbols-outlined font-bold text-2xl">movie_filter</span>
        </Link>
        <nav className="flex flex-col gap-6 flex-1">
          <button onClick={() => setSelectedTab('dashboard')} className={`p-3.5 rounded-2xl transition-all ${selectedTab === 'dashboard' ? 'text-primary bg-primary/5 border border-primary/10' : 'text-slate-400 hover:text-primary'}`} title="대시보드">
            <span className="material-symbols-outlined icon-filled">dashboard</span>
          </button>
          <button onClick={() => setSelectedTab('folder')} className={`p-3.5 rounded-2xl transition-all ${selectedTab === 'folder' ? 'text-primary bg-primary/5 border border-primary/10' : 'text-slate-400 hover:text-primary'}`} title="보관함">
            <span className="material-symbols-outlined">folder</span>
          </button>
          <button className="p-3.5 text-slate-400 hover:text-primary transition-colors" title="통계">
            <span className="material-symbols-outlined">bar_chart</span>
          </button>
          <button className="p-3.5 text-slate-400 hover:text-primary transition-colors" title="설정">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </nav>
        <div className="mt-auto flex flex-col gap-6">
          <button className="p-3 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="size-10 rounded-full bg-slate-100 overflow-hidden border-2 border-slate-50 shadow-sm">
            <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-500 font-bold">DK</div>
          </div>
        </div>
      </aside>

      {/* Project Panel */}
      <section className="w-80 flex flex-col bg-sidebar-light border-r border-slate-200 shrink-0">
        <div className="p-7">
          <div className="flex items-center justify-between mb-7">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">프로젝트 보관함</h2>
            <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
              <span className="material-symbols-outlined font-bold">add</span>
            </button>
          </div>
          <div className="relative mb-5">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input className="w-full bg-white border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-primary focus:border-primary shadow-sm outline-none border" placeholder="에셋 검색..." type="text" />
          </div>
          <div className="flex gap-2 mb-2">
            <button className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-full shadow-md shadow-primary/20">전체</button>
            <button className="px-4 py-1.5 bg-white text-slate-500 text-xs font-semibold rounded-full border border-slate-200 hover:bg-slate-50">이력서</button>
            <button className="px-4 py-1.5 bg-white text-slate-500 text-xs font-semibold rounded-full border border-slate-200 hover:bg-slate-50">코드</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-7 pb-6 space-y-3 no-scrollbar">
          {assets.map((asset) => (
            <div key={asset.id} className="group p-4 bg-white rounded-2xl border border-transparent hover:border-primary/30 cursor-grab active:cursor-grabbing transition-all shadow-sm hover:shadow-md">
              <div className="flex items-start gap-4">
                <div 
                  className={`size-11 flex items-center justify-center rounded-xl ${
                    asset.color === 'rose' ? 'bg-rose-50 text-rose-500' :
                    asset.color === 'amber' ? 'bg-amber-50 text-amber-500' :
                    asset.color === 'indigo' ? 'bg-indigo-50 text-indigo-500' :
                    'bg-emerald-50 text-emerald-500'
                  }`}
                >
                  <span className="material-symbols-outlined">{asset.type === 'doc' ? 'description' : asset.type === 'code' ? 'terminal' : 'description'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-800 truncate">{asset.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">{asset.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-slate-200 bg-white/50">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
            <span>저장 공간 사용량 (85%)</span>
            <span className="text-primary">1.7GB / 2GB</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(79,70,229,0.3)]" style={{ width: '85%' }}></div>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col bg-workspace-bg overflow-hidden relative">
        <header className="h-20 border-b border-slate-100 flex items-center justify-between px-10 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <span className="text-primary font-black tracking-tighter text-2xl">Vidifolio</span>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <h1 className="text-[17px] font-bold tracking-tight text-slate-900">영상 제작 워크스페이스</h1>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-md border border-emerald-100 uppercase tracking-wider ml-2">DRAFT</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-xl">visibility</span> 미리보기
            </button>
            <button className="flex items-center gap-2 px-7 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-xl shadow-primary/20 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0">
              <span className="material-symbols-outlined text-xl">auto_awesome</span> 영상 생성
            </button>
          </div>
        </header>

        <div className="flex-1 flex p-10 gap-10 overflow-hidden bg-[#FAFBFF]">
          <div className="flex-1 flex flex-col gap-10 overflow-y-auto no-scrollbar">
            {/* Drop Zone */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative border-2 border-dashed border-slate-200 rounded-3xl bg-white p-16 flex flex-col items-center justify-center text-center transition-all group-hover:border-primary/40 group-hover:shadow-xl group-hover:shadow-primary/5">
                <div className="size-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mb-6 ring-1 ring-primary/10">
                  <span className="material-symbols-outlined text-4xl">upload_file</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">전문 에셋을 여기에 드롭하세요</h3>
                <p className="text-slate-400 text-[15px] font-medium max-w-sm mx-auto leading-relaxed">보관함에서 이력서나 코드 스니펫을 드래그하여<br />AI 기반의 자동 영상 분석을 시작하세요.</p>
                <div className="mt-10 flex flex-wrap justify-center gap-3">
                  <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700">
                    <span className="material-symbols-outlined text-lg text-emerald-500">check_circle</span> 시니어_개발자_이력서.pdf
                    <button className="ml-1 hover:text-rose-500 text-slate-400 transition-colors"><span className="material-symbols-outlined text-lg">close</span></button>
                  </div>
                  <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700">
                    <span className="material-symbols-outlined text-lg text-emerald-500">check_circle</span> 인증_모듈.js
                    <button className="ml-1 hover:text-rose-500 text-slate-400 transition-colors"><span className="material-symbols-outlined text-lg">close</span></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Style Selector */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold flex items-center gap-2.5 text-slate-900">
                  <span className="material-symbols-outlined text-primary text-2xl">palette</span> 스타일 변경
                </h3>
                <a href="#" className="text-sm text-primary font-bold hover:underline">모든 테마 보기</a>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {/* Tech Minimalist */}
                <div 
                  onClick={() => setSelectedTheme('tech')}
                  className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all shadow-sm ${selectedTheme === 'tech' ? 'border-primary shadow-xl shadow-primary/10' : 'border-transparent hover:border-slate-300'}`}
                >
                  <div className="h-32 bg-gradient-to-br from-[#1E293B] to-[#4F46E5] flex items-center justify-center p-6 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase text-center relative z-10 leading-tight">TECH MINIMALIST</span>
                  </div>
                  <div className="p-4 bg-white flex items-center justify-between">
                    <span className="text-[13px] font-extrabold text-slate-800">스탠다드 테크</span>
                    {selectedTheme === 'tech' ? (
                      <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-slate-200 text-xl">circle</span>
                    )}
                  </div>
                </div>
                
                {/* Cyberpunk */}
                <div 
                  onClick={() => setSelectedTheme('cyber')}
                  className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all shadow-sm ${selectedTheme === 'cyber' ? 'border-primary shadow-xl shadow-primary/10' : 'border-transparent hover:border-slate-300'}`}
                >
                  <div className="h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 flex items-center justify-center p-6">
                    <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase text-center leading-tight">NEON HIGH-ENERGY</span>
                  </div>
                  <div className="p-4 bg-white flex items-center justify-between">
                    <span className="text-[13px] font-extrabold text-slate-800">사이버펑크</span>
                     {selectedTheme === 'cyber' ? (
                      <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-slate-200 text-xl">circle</span>
                    )}
                  </div>
                </div>

                {/* Eco Modern */}
                <div 
                   onClick={() => setSelectedTheme('eco')}
                   className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all shadow-sm ${selectedTheme === 'eco' ? 'border-primary shadow-xl shadow-primary/10' : 'border-transparent hover:border-slate-300'}`}
                >
                  <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center p-6">
                    <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase text-center leading-tight">ECO MODERN</span>
                  </div>
                  <div className="p-4 bg-white flex items-center justify-between">
                    <span className="text-[13px] font-extrabold text-slate-800">네이처 클린</span>
                     {selectedTheme === 'eco' ? (
                      <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-slate-200 text-xl">circle</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Script Editor */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold flex items-center gap-2.5 text-slate-900">
                  <span className="material-symbols-outlined text-primary text-2xl">edit_note</span> AI 생성 스크립트
                </h3>
                <button className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition-colors">새로 생성</button>
              </div>
              <div className="space-y-4">
                {scriptSegments.map((segment, index) => (
                  <div key={index} className="flex gap-5 p-6 bg-white rounded-2xl border border-slate-100 group shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-[11px] font-black text-slate-300 mt-1">{segment.time}</div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-primary mb-2 tracking-[0.1em]">{segment.title}</p>
                      <textarea 
                        className="w-full bg-transparent border-none p-0 text-[14px] font-medium text-slate-700 focus:ring-0 resize-none h-12 leading-relaxed outline-none" 
                        defaultValue={segment.content}
                      ></textarea>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity self-start mt-1">
                      <span className="material-symbols-outlined text-slate-400 hover:text-primary text-xl">mic</span>
                    </button>
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
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Placeholder image from code2.html */}
                    <div className="w-full h-full bg-slate-800 opacity-60"></div>
                  </div>
                  <div className="relative z-10 w-full">
                    <div className="size-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl">
                      <span className="material-symbols-outlined text-white text-4xl ml-1">play_arrow</span>
                    </div>
                    <h4 className="text-2xl font-black text-white mb-2 leading-tight tracking-tight">ALEX RIVERA</h4>
                    <p className="text-primary font-black text-[10px] tracking-[0.3em] mb-10 uppercase">Senior Software Engineer</p>
                    <div className="flex gap-2 justify-center">
                      <div className="w-14 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-2/3"></div>
                      </div>
                      <div className="w-14 h-1.5 bg-white/20 rounded-full"></div>
                      <div className="w-14 h-1.5 bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-slate-800 rounded-full"></div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">파일 정보</h4>
                  <button className="flex items-center gap-1.5 text-[11px] font-black text-accent hover:opacity-80 transition-opacity">
                    <span className="material-symbols-outlined text-lg">download</span> 다운로드
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3.5 rounded-2xl text-center">
                    <p className="text-xl font-black text-slate-800">58초</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Duration</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl text-center">
                    <p className="text-xl font-black text-slate-800">1080p</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Footer */}
        <footer className="h-44 border-t border-slate-100 bg-white/95 backdrop-blur-md px-10 py-7 z-10">
          <div className="flex items-center gap-8 mb-6">
            <div className="flex gap-3">
              <button className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-500"><span className="material-symbols-outlined text-2xl">skip_previous</span></button>
              <button className="size-10 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25 hover:bg-indigo-700"><span className="material-symbols-outlined text-2xl">play_arrow</span></button>
              <button className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-500"><span className="material-symbols-outlined text-2xl">skip_next</span></button>
            </div>
            <div className="flex-1 h-2 bg-slate-100 rounded-full relative">
              <div className="absolute top-1/2 -translate-y-1/2 left-[25%] size-4 bg-primary rounded-full shadow-lg ring-4 ring-primary/10 cursor-pointer"></div>
            </div>
            <span className="text-[13px] font-bold text-slate-500 tabular-nums">00:14 / 00:58</span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            <div className="min-w-[140px] h-14 bg-indigo-50/80 border border-indigo-100 rounded-xl p-3 flex flex-col justify-center">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">인트로</span>
              <div className="h-1.5 w-full bg-indigo-200/50 rounded-full mt-2"></div>
            </div>
            <div className="min-w-[190px] h-14 bg-primary border-2 border-primary rounded-xl p-3 flex flex-col justify-center shadow-lg shadow-primary/10">
              <span className="text-[10px] font-black text-white/90 uppercase tracking-tighter">경력 세그먼트</span>
              <div className="h-1.5 w-full bg-white/30 rounded-full mt-2"></div>
            </div>
            <div className="min-w-[130px] h-14 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-center opacity-70">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">코드 블록</span>
              <div className="h-1.5 w-full bg-slate-200 rounded-full mt-2"></div>
            </div>
            <div className="min-w-[170px] h-14 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-center opacity-70">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">기술 오버레이</span>
              <div className="h-1.5 w-full bg-slate-200 rounded-full mt-2"></div>
            </div>
            <div className="min-w-[110px] h-14 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-center opacity-70">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">아웃트로</span>
              <div className="h-1.5 w-full bg-slate-200 rounded-full mt-2"></div>
            </div>
            <button className="min-w-[56px] h-14 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/50 transition-all">
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default DashboardPage;
