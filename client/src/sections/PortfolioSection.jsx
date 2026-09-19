import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminData } from '../context/AdminContext';

export default function PortfolioSection() {
  const { projects } = useAdminData();

  return (
    <section id="work" className="py-16 sm:py-20 px-4 sm:px-6 md:px-12 bg-[#F0EBE1] border-b border-[#1A1512]/15 relative z-10">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        
        {/* Section Header */}
        <div className="border-b border-[#1A1512]/15 pb-4">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display uppercase tracking-tight text-[#1A1512]">
            PROJECTS DELIVERED
          </h2>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="border border-[#1A1512]/15 bg-[#F0EBE1] p-10 sm:p-14 text-center space-y-3">
            <div className="font-mono text-xs font-bold text-[#C1512F] uppercase tracking-widest">
              [ PORTFOLIO DIRECTORY ]
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display uppercase tracking-tight text-[#1A1512]">
              CASE STUDIES IN BENCHMARKING
            </h3>
            <p className="text-xs sm:text-sm text-[#1A1512]/70 font-sans max-w-md mx-auto leading-relaxed">
              New client deployments and case studies will appear here once published from the Admin Portal.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-2 sm:pt-4">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="group border border-[#1A1512]/15 bg-[#F0EBE1] hover:border-[#1A1512] transition-colors flex flex-col justify-between block"
              >
                {/* Image Container with Sharp Corners */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#1A1512]/5 border-b border-[#1A1512]/15">
                  <img
                    src={project.image}
                    alt={`${project.title} - ${project.category} case study`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  
                  {/* Result Tag Badge (only if non-empty) */}
                  {project.result && project.result.trim() && (
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <span className="px-2.5 sm:px-3 py-1 font-mono text-[10px] sm:text-[11px] font-bold tracking-widest uppercase bg-[#1A1512] text-white">
                        {project.result}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Meta Content */}
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold font-display uppercase tracking-tight text-[#1A1512] group-hover:text-[#C1512F] transition-colors">
                      0{index + 1} / {project.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#1A1512]/70 font-sans leading-relaxed line-clamp-2">
                    {project.tagline}
                  </p>

                  <div className="pt-3 border-t border-[#1A1512]/10 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] sm:text-xs font-bold tracking-widest">
                    <span className="text-[#1A1512]/60 uppercase">{project.category}</span>
                    <div className="flex items-center gap-3">
                      {project.liveUrl && (
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(project.liveUrl, '_blank', 'noopener,noreferrer');
                          }}
                          className="text-[#C1512F] hover:text-[#1A1512] transition-colors cursor-pointer flex items-center gap-1"
                          title="Open live website in new tab"
                        >
                          LIVE ↗
                        </span>
                      )}
                      <span className="text-[#1A1512] group-hover:text-[#C1512F] flex items-center gap-1 transition-colors">
                        CASE STUDY <span className="font-sans font-bold">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
