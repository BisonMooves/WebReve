import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAdminData } from '../context/AdminContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProjectGallery from '../components/ProjectGallery';
import {
  ArrowLeft,
  ArrowUpRight
} from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects } = useAdminData();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  // Find project by ID or title slug
  const projectIndex = projects.findIndex(
    (p) =>
      String(p.id).toLowerCase() === String(id).toLowerCase() ||
      p.title.toLowerCase().replace(/\s+/g, '-') === String(id).toLowerCase()
  );

  const project = projectIndex !== -1 ? projects[projectIndex] : null;
  const nextProject =
    projectIndex !== -1
      ? projects[(projectIndex + 1) % projects.length]
      : null;
  const prevProject =
    projectIndex !== -1
      ? projects[(projectIndex - 1 + projects.length) % projects.length]
      : null;

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F0EBE1] text-[#1A1512] font-sans flex flex-col justify-between">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-32 text-center space-y-6">
          <div className="inline-block px-3 py-1 bg-[#C1512F]/10 border border-[#C1512F]/30 font-mono text-xs font-bold text-[#C1512F] uppercase tracking-widest">
            CASE STUDY NOT FOUND
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#1A1512]">
            PROJECT RECORD UNAVAILABLE
          </h1>
          <p className="font-mono text-xs text-[#1A1512]/70 max-w-md mx-auto leading-relaxed">
            The case study you requested could not be located in the current WebRêve delivery index.
          </p>
          <div className="pt-4">
            <Link
              to="/#work"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1512] text-white hover:bg-[#C1512F] font-mono text-xs font-bold uppercase tracking-widest transition-colors shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO ALL PROJECTS</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0EBE1] text-[#1A1512] font-sans selection:bg-[#C1512F] selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Breadcrumb Navigation Bar */}
      <div className="border-b border-[#1A1512]/15 bg-[#E8E2D7]/60 py-3 sm:py-3.5 px-4 sm:px-6 md:px-12 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/#work"
            className="flex items-center gap-1.5 sm:gap-2 font-bold tracking-widest text-[#1A1512]/70 hover:text-[#C1512F] transition-colors text-[11px] sm:text-xs"
          >
            <ArrowLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span>ALL DELIVERED WORK</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-bold">
            {prevProject && (
              <button
                onClick={() => navigate(`/project/${prevProject.id}`)}
                className="hover:text-[#C1512F] transition-colors cursor-pointer hidden sm:inline-block"
              >
                ← PREV
              </button>
            )}
            <span className="text-[#1A1512]/40">
              0{projectIndex + 1} / 0{projects.length}
            </span>
            {nextProject && (
              <button
                onClick={() => navigate(`/project/${nextProject.id}`)}
                className="hover:text-[#C1512F] transition-colors cursor-pointer"
              >
                NEXT PROJECT →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Project Hero */}
      <header className="pt-8 sm:pt-12 pb-8 sm:pb-10 px-4 sm:px-6 md:px-12 border-b border-[#1A1512]/15">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          
          {/* Category & Tags Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-xs font-bold tracking-widest">
            <span className="px-2.5 sm:px-3 py-1 bg-[#1A1512] text-white uppercase">
              {project.category || 'CASE STUDY'}
            </span>
            {project.client && (
              <span className="px-2.5 sm:px-3 py-1 border border-[#1A1512]/20 text-[#1A1512]/80 uppercase">
                CLIENT: {project.client}
              </span>
            )}
            {project.year && (
              <span className="px-2.5 sm:px-3 py-1 border border-[#1A1512]/20 text-[#1A1512]/60 uppercase">
                {project.year}
              </span>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-[#C1512F] text-white hover:bg-[#1A1512] transition-colors flex items-center gap-1.5 uppercase font-bold text-[10px] sm:text-xs tracking-wider cursor-pointer shadow-sm"
              >
                <span>VISIT LIVE PLATFORM</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Large Title & Tagline */}
          <div className="space-y-3 sm:space-y-4 max-w-5xl">
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight text-[#1A1512] leading-[0.95] break-words">
              {project.title}
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-[#1A1512]/80 font-serif leading-relaxed max-w-4xl">
              {project.tagline || 'Bespoke high-performance digital engineering & brand architecture.'}
            </p>
          </div>

          {/* Impact Metrics Strip */}
          {(project.result || project.metric1Val || project.metric2Val) && (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-[#1A1512]/15">
              {project.result && (
                <div className="p-3.5 sm:p-4 border border-[#1A1512]/15 bg-[#E8E2D7]/40 space-y-1">
                  <div className="font-mono text-[10px] text-[#1A1512]/50 font-bold uppercase tracking-widest">
                    PRIMARY OUTCOME
                  </div>
                  <div className="font-display text-xl sm:text-3xl font-black text-[#C1512F]">
                    {project.result}
                  </div>
                </div>
              )}

              {project.metric1Val && (
                <div className="p-3.5 sm:p-4 border border-[#1A1512]/15 bg-[#E8E2D7]/40 space-y-1">
                  <div className="font-mono text-[10px] text-[#1A1512]/50 font-bold uppercase tracking-widest">
                    {project.metric1Label || 'PERFORMANCE UPLIFT'}
                  </div>
                  <div className="font-display text-xl sm:text-3xl font-black text-[#1A1512]">
                    {project.metric1Val}
                  </div>
                </div>
              )}

              {project.metric2Val && (
                <div className="p-3.5 sm:p-4 border border-[#1A1512]/15 bg-[#E8E2D7]/40 space-y-1">
                  <div className="font-mono text-[10px] text-[#1A1512]/50 font-bold uppercase tracking-widest">
                    {project.metric2Label || 'REVENUE IMPACT'}
                  </div>
                  <div className="font-display text-xl sm:text-3xl font-black text-[#1A1512]">
                    {project.metric2Val}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Case Study Deep Dive Narrative */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-12 border-b border-[#1A1512]/15">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Left Column: Scope & Metadata */}
          <div className="lg:col-span-4 space-y-6 sm:space-y-8">
            <div className="p-5 sm:p-6 border border-[#1A1512]/15 bg-[#E8E2D7]/50 space-y-5 sm:space-y-6 font-mono text-xs">
              <h3 className="font-bold uppercase tracking-widest text-[#1A1512] border-b border-[#1A1512]/15 pb-3">
                PROJECT SPECIFICATIONS
              </h3>

              <div className="space-y-4">
                {project.client && (
                  <div>
                    <span className="text-[#1A1512]/50 text-[10px] uppercase block">CLIENT</span>
                    <span className="font-bold text-sm text-[#1A1512]">{project.client}</span>
                  </div>
                )}

                <div>
                  <span className="text-[#1A1512]/50 text-[10px] uppercase block">SECTOR</span>
                  <span className="font-bold text-sm text-[#1A1512]">{project.category}</span>
                </div>

                {project.liveUrl && (
                  <div>
                    <span className="text-[#1A1512]/50 text-[10px] uppercase block">LIVE PLATFORM</span>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-xs text-[#C1512F] hover:underline pt-1 break-all"
                    >
                      <span>{project.liveUrl.replace(/^https?:\/\//, '')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </div>
                )}

                <div>
                  <span className="text-[#1A1512]/50 text-[10px] uppercase block font-mono tracking-wider">SERVICES DELIVERED</span>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {(project.deliverables && project.deliverables.length > 0
                      ? project.deliverables
                      : [
                          "UX Strategy",
                          "Bespoke Design",
                          "React Build"
                        ]
                    ).map((del, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#1A1512]/5 border border-[#1A1512]/15 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#1A1512]"
                      >
                        {del}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1A1512]/15">
                <a
                  href="/#contact"
                  className="w-full py-3 bg-[#1A1512] text-white hover:bg-[#C1512F] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <span>START SIMILAR PROJECT</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Problem & Solution Story */}
          <div className="lg:col-span-8 space-y-8 sm:space-y-12">
            
            {/* The Challenge */}
            <div className="space-y-3 sm:space-y-4">
              <div className="font-mono text-[11px] sm:text-xs font-bold text-[#C1512F] tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#C1512F] inline-block" />
                <span>01 / THE STRATEGIC CHALLENGE</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#1A1512]">
                {project.problemTitle || "OVERCOMING CONVERSION FRICTION & BRAND APATHY"}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-[#1A1512]/80 font-sans leading-relaxed">
                {project.problem ||
                  `${project.title} approached WebRêve needing to elevate their digital brand authority and eliminate user friction. Prior systems lacked responsive clarity, high-speed execution, and the premium visual prestige required to command top-tier conversion rates in competitive markets.`}
              </p>
            </div>

            {/* The Solution */}
            <div className="space-y-3 sm:space-y-4 pt-6 border-t border-[#1A1512]/15">
              <div className="font-mono text-[11px] sm:text-xs font-bold text-[#C1512F] tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#C1512F] inline-block" />
                <span>02 / THE ARCHITECTURAL SOLUTION</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#1A1512]">
                {project.solutionTitle || "BESPOKE INTERACTION DESIGN & HIGH-VELOCITY ENGINEERING"}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-[#1A1512]/80 font-sans leading-relaxed">
                {project.solution ||
                  `We architected a streamlined, high-contrast digital interface centered around intuitive navigation, instant visual feedback, and sub-second rendering performance. Every touchpoint was engineered to guide qualified users seamlessly toward decisive actions with zero friction.`}
              </p>
            </div>

            {/* Testimonial Quote if available */}
            {project.quote && (
              <div className="p-5 sm:p-8 border-l-4 border-[#C1512F] bg-[#E8E2D7]/60 space-y-3 sm:space-y-4">
                <p className="font-serif italic text-base sm:text-xl text-[#1A1512] leading-relaxed">
                  "{typeof project.quote === 'string' ? project.quote : project.quote.text}"
                </p>
                {typeof project.quote === 'object' && project.quote.author && (
                  <div className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1A1512]/70">
                    — {project.quote.author} {project.quote.title && `(${project.quote.title})`}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 03 / The Visual Record - Bento Gallery */}
      <ProjectGallery project={project} />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
