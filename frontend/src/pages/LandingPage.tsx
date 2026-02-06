import React from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";

const LandingPage = () => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-brand-bg text-brand-text font-sans">
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-white text-2xl">movie_filter</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 font-display">Vidifolio</span>
            </div>
            <nav className="hidden md:flex items-center gap-10">
              <a href="#" className="text-[15px] font-semibold text-slate-500 hover:text-primary transition-colors">기능소개</a>
              <a href="#" className="text-[15px] font-semibold text-slate-500 hover:text-primary transition-colors">갤러리</a>
              <a href="#" className="text-[15px] font-semibold text-slate-500 hover:text-primary transition-colors">요금제</a>
              <a href="#" className="text-[15px] font-semibold text-slate-500 hover:text-primary transition-colors">엔터프라이즈</a>
            </nav>
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="hidden sm:block px-4 py-2 text-[15px] font-bold text-slate-600 hover:text-primary transition-colors">
                    로그인
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full text-[15px] font-bold transition-all shadow-md">
                    회원가입
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-4">
                  <Link to="/app" className="hidden sm:block px-4 py-2 text-[15px] font-bold text-slate-600 hover:text-primary transition-colors">
                    워크스페이스로 이동
                  </Link>
                  <UserButton />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        <section className="relative pt-16 pb-24 lg:pt-28 lg:pb-36 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,194,255,0.08)_0%,rgba(0,245,212,0.05)_50%,rgba(255,255,255,0)_100%)] pointer-events-none"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
              <div className="lg:col-span-7 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[13px] font-bold tracking-tight mb-8 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                  차세대 퍼스널 브랜딩의 시작
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.15] mb-8 tracking-tight font-display">
                  나를 가장 잘 표현하는<br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">AI 쇼츠 광고</span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-500 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  당신의 이력서와 프로젝트 데이터가 단 몇 초 만에 1분 분량의 전문가급 홍보 영상으로 탄생합니다. Vidifolio로 당신의 가치를 증명하세요.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link to="/app" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all transform hover:-translate-y-1 shadow-xl shadow-primary/25">
                    <span className="material-symbols-outlined">movie</span>
                    영상 제작
                  </Link>
                  <Link to="/app" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 px-10 py-5 rounded-2xl text-lg font-bold transition-all border border-slate-200 shadow-sm">
                    <span className="material-symbols-outlined">upload_file</span>
                    포트폴리오 업로드
                  </Link>
                </div>
                <div className="mt-16 pt-10 border-t border-slate-200/60">
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-6">TRUSTED BY TOP PROFESSIONALS</p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-10 opacity-30 grayscale contrast-150">
                    <div className="h-6 w-24 bg-slate-400 rounded-full"></div>
                    <div className="h-6 w-20 bg-slate-400 rounded-full"></div>
                    <div className="h-6 w-28 bg-slate-400 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:block lg:col-span-5 relative">
                <div className="relative mx-auto w-full max-w-[360px]">
                  <div className="relative z-20 border-[10px] border-white rounded-[3.5rem] shadow-2xl overflow-hidden aspect-[9/19] bg-white ring-1 ring-slate-100">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDqnUIfAZABJa_m48EKtq6CG7jeSgzLwWet_2Mmv85jVXlUM8I0m3oWXGhPQLEGzmr_u8AjTtKLqQ7AMdUnZq94Yc6fe-aJJ9hDGESFNnzmJ3UFH5offWfT1j4_n28N6nkk4C0MMp7u3WZkr7uVdGiLQOnsJdsgv4rAgoZAf44NArxRn4O7dlJ05xI1YymBx88jMig9uSTAmjSFSszzVFmf0YeLvFVGE62527Ao95wHuWJBLh8u1pVGHbj8N5t7wP1pkawJoaSxtmg')" }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10"></div>
                      <div className="absolute bottom-10 left-5 right-5 text-white">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="size-12 rounded-full border-2 border-primary overflow-hidden shadow-lg">
                            <div className="w-full h-full bg-slate-200"></div>
                          </div>
                          <div>
                            <p className="text-[15px] font-bold">김지민</p>
                            <p className="text-[11px] opacity-90 font-medium">Product Designer</p>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed line-clamp-2 mb-5 font-medium">"사용자 중심의 혁신적인 UI/UX를 설계합니다. 복잡한 문제를 단순하게 해결하는 것을 좋아합니다."</p>
                        <div className="flex gap-2">
                          <div className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md text-[10px] font-bold">Figma</div>
                          <div className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md text-[10px] font-bold">React</div>
                        </div>
                      </div>
                      <div className="absolute right-5 bottom-40 flex flex-col gap-6 text-white items-center">
                        <span className="material-symbols-outlined text-2xl">favorite</span>
                        <span className="material-symbols-outlined text-2xl">chat_bubble</span>
                        <span className="material-symbols-outlined text-2xl">share</span>
                      </div>
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-white rounded-b-3xl z-30"></div>
                  </div>
                  <div className="absolute -right-8 top-1/4 z-30 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-slate-100 max-w-[180px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-primary text-lg">trending_up</span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">주간 조회수</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">12,500+</p>
                    <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                      <div className="bg-primary h-full w-[70%]"></div>
                    </div>
                  </div>
                  <div className="absolute -left-12 bottom-1/4 z-30 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-secondary/20 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-emerald-500 text-xl">auto_awesome</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900">AI 최적화 완료</p>
                        <p className="text-[10px] text-slate-500">포트폴리오 분석 결과</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -inset-16 bg-gradient-to-tr from-primary/10 to-secondary/10 blur-[100px] rounded-full z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">퍼스널 브랜딩의 미래</h2>
              <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">AI가 복잡한 영상 편집을 대신합니다. 당신은 커리어 성장에만 집중하세요.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white text-3xl transition-colors">auto_awesome</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">AI 스크립트 작성</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed font-medium">
                  이력서와 프로젝트 경험을 분석하여, 타겟 직무에 최적화된 설득력 있는 영상 시나리오를 자동으로 작성합니다.
                </p>
              </div>
              <div className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-secondary transition-colors">
                  <span className="material-symbols-outlined text-emerald-500 group-hover:text-white text-3xl transition-colors">record_voice_over</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">전문적인 보이스오버</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed font-medium">
                  수십 가지의 자연스러운 AI 성우 목소리를 선택하거나, 자신의 목소리를 복제하여 더욱 개인화된 영상을 제작할 수 있습니다.
                </p>
              </div>
              <div className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-amber-400 transition-colors">
                  <span className="material-symbols-outlined text-amber-500 group-hover:text-white text-3xl transition-colors">magic_button</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">자동 영상 편집</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed font-medium">
                  스크립트 리듬에 맞춰 트랜지션, 자료 화면 삽입, 자막 생성을 자동으로 완료하여 세련된 쇼츠 영상을 완성합니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <span className="material-symbols-outlined text-primary text-2xl">movie_filter</span>
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 font-display">Vidifolio</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-[14px] font-bold text-slate-400">
              <a href="#" className="hover:text-primary transition-colors">이용약관</a>
              <a href="#" className="hover:text-primary transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-primary transition-colors">고객지원</a>
              <a href="#" className="hover:text-primary transition-colors">블로그</a>
            </div>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all">
                <span className="material-symbols-outlined text-xl">public</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all">
                <span className="material-symbols-outlined text-xl">alternate_email</span>
              </a>
            </div>
          </div>
          <div className="mt-12 text-center text-[13px] font-medium text-slate-400">
            © 2024 Vidifolio Technologies Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
