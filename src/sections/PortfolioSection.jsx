import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects, projectCategories } from '../data/projects';
import ProjectModal from '../components/ProjectModal';
import { ArrowUpRight } from 'lucide-react';

export default function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);

  // Filter projects by category
  const filteredProjects = projects.filter(
    (project) => activeCategory === "All" || project.category === activeCategory
  );

  return (
    <section id="work" className="py-20 px-6 md:px-12 bg-[#F0EBE1] border-b border-[#1A1512]/15 relative z-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Section Header: Headline left-aligned, Monospace date right-aligned on same baseline */}
        <div className="flex items-baseline justify-between border-b border-[#1A1512]/15 pb-4">
          <h2 className="text-5xl sm:text-7xl font-extrabold font-display uppercase tracking-tight text-[#1A1512]">
            SELECTED WORK
          </h2>
          <span className="font-mono text-xs font-bold tracking-widest text-[#1A1512]/60">
            2025 — 2026
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-6 font-mono text-xs font-bold tracking-widest text-[#1A1512]">
          <span className="text-[#1A1512]/40 uppercase">INDEX:</span>
          {projectCategories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`transition-colors cursor-pointer py-1 relative ${
                  isActive
                    ? 'text-[#C1512F] font-bold border-b-2 border-[#C1512F]'
                    : 'text-[#1A1512]/60 hover:text-[#1A1512]'
                }`}
              >
                {category.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="group border border-[#1A1512]/15 bg-[#F0EBE1] hover:border-[#1A1512] transition-colors cursor-pointer flex flex-col justify-between"
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
                
                {/* Result Tag Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 font-mono text-[11px] font-bold tracking-widest uppercase bg-[#1A1512] text-white">
                    {project.result}
                  </span>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-3xl font-extrabold font-display uppercase tracking-tight text-[#1A1512] group-hover:text-[#C1512F] transition-colors">
                    0{index + 1} / {project.title}
                  </h3>
                  <span className="font-mono text-xs font-bold tracking-widest text-[#1A1512]/50">
                    {project.year}
                  </span>
                </div>

                <p className="text-xs text-[#1A1512]/70 font-sans leading-relaxed line-clamp-2">
                  {project.tagline}
                </p>

                <div className="pt-3 border-t border-[#1A1512]/10 flex items-center justify-between font-mono text-xs font-bold tracking-widest">
                  <span className="text-[#1A1512]/60 uppercase">{project.category}</span>
                  <span className="text-[#1A1512] group-hover:text-[#C1512F] flex items-center gap-1 transition-colors">
                    READ CASE STUDY <span className="font-sans font-bold">→</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Case Study Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
}
