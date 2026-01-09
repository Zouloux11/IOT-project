import React from "react";
import { useRef, useEffect } from 'react';
import { motion } from "framer-motion";
import { Code, Brain, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { projectsData } from '../data/ProjectsData';
import experiencesData from "../data/ExperiencesData.js";
import FlyingHelper from '../components/FlyingHelper.tsx';

const technicalSkills = [
  { name: "Golang", level: "experienced", tags: ["Golang"] },
  { name: "Git", level: "experienced", tags: ["Git"] },
  { name: "Python", level: "experienced", tags: ["Python"] },
  { name: "NATS / Resgate (API gateway)", level: "experienced", tags: ["NATS", "Resgate"] },
  { name: "Linux / Bash", level: "experienced", tags: [] },
  { name: "SQL / Database Management", level: "experienced", tags: ["PostgreSQL"] },
  { name: "Matlab (telecom)", level: "experienced", tags: ["Matlab"] },
  { name: "Keycloak (OAuth2 / SSO)", level: "experienced", tags: ["Keycloak"] },
  { name: "Java", level: "experienced", tags: ["Java"] },
  { name: "Docker / Docker Compose", level: "basics", tags: ["Docker"] },
  { name: "React", level: "basics", tags: ["React"] },
  { name: "GitHub / GitLab CI/CD", level: "basics", tags: [] },
];

const softSkills = [
  "Autonomy",
  "Thoroughness",
  "Problem Solving",
  "Communication",
  "Team Spirit",
];

const languages = [
  { name: "French", level: "native" },
  { name: "English", level: "B2 level" },
  { name: "Spanish", level: "B1 level" },
];

interface TechnicalSkillProps {
  name: string;
  level: string;
  tags?: string[];
  id?: string;
}

const TechnicalSkill: React.FC<TechnicalSkillProps> = ({ name, level, tags = [], id }) => {
  const [hovered, setHovered] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const matchedProjects = projectsData.filter((project) =>
    tags.some((tag) => project.tags.includes(tag))
  );

  const matchedExperiences = experiencesData.filter((exp) =>
    exp.tags && tags.some((tag) => exp.tags.includes(tag))
  );

  type Item = {
    id: string | number;
    title: string;
    imageUrl?: string;
    description?: string;
    company?: string;
    type: "project" | "experience";
  };

  const combinedItems: Item[] = [
    ...matchedProjects.map((p) => ({
      id: p.id || p.title,
      title: p.title,
      imageUrl: p.imageUrl,
      description: p.description,
      type: "project" as const,
    })),
    ...matchedExperiences.map((e) => ({
      id: e.id,
      title: e.title,
      imageUrl: e.imageUrls?.[0],
      description: e.description,
      company: e.company,
      type: "experience" as const,
    })),
  ];

  const updateOverlayPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const overlayWidth = 600;
      const viewportWidth = window.innerWidth;
      const spacing = 10;

      let leftPosition = rect.right + spacing;
      if (leftPosition + overlayWidth > viewportWidth) {
        leftPosition = rect.left - overlayWidth - spacing;
        if (leftPosition < 0) {
          leftPosition = Math.max(spacing, (viewportWidth - overlayWidth) / 2);
        }
      }

      setOverlayPosition({
        top: rect.top,
        left: leftPosition,
      });
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    updateOverlayPosition();
    setHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHovered(false);
      timeoutRef.current = null;
    }, 250);
  };

  useEffect(() => {
    if (!hovered) return;

    const handleResize = () => updateOverlayPosition();
    const handleScroll = () => updateOverlayPosition();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hovered]);

  return (
    <>
      <div
        ref={containerRef}
        className="relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        id={id}
      >
        <div className="flex justify-between items-center py-3 border-b border-border last:border-0">
          <span className="font-medium text-foreground">{name}</span>
          <span className={`text-sm px-3 py-1 rounded-full ${
            level === 'experienced' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            {level === 'experienced' ? 'Experienced' : 'Basics'}
          </span>
        </div>
      </div>

      {hovered && combinedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed z-50 bg-background border border-border rounded-xl shadow-lg p-4"
          style={{
            top: overlayPosition.top,
            left: overlayPosition.left,
            width: "600px",
            maxWidth: "calc(100vw - 20px)",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex gap-3 overflow-x-auto pb-2">
            {combinedItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col cursor-pointer hover:opacity-90 border border-border rounded-md p-3 shadow-sm flex-shrink-0"
                onClick={() => {
                  if (item.type === "experience") navigate("/experiences");
                  else if (item.type === "project") navigate(`/project/${item.id}`);
                }}
                style={{ minWidth: "280px", maxWidth: "280px" }}
              >
                <div className="mb-2">
                  <div className="text-sm font-medium text-primary truncate">
                    {item.title}
                  </div>
                  {item.company && (
                    <div className="text-xs text-muted-foreground truncate">
                      {item.company}
                    </div>
                  )}
                  {item.description && (
                    <p className="text-xs mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-32 rounded-md object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
};

const SoftSkill = ({ name }: { name: string }) => (
  <div className="py-2">
    <span className="font-medium text-foreground">• {name}</span>
  </div>
);

const Language = ({ name, level }: { name: string; level: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-border last:border-0">
    <span className="font-medium text-foreground">{name}</span>
    <span className="text-sm text-muted-foreground capitalize">{level}</span>
  </div>
);

const SkillsPage = () => {
  return (
    <div className="container mx-auto px-6 py-16 max-w-7xl">
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-center mb-16 gradient-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My skills
      </motion.h1>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3 md:gap-8 lg:gap-10 xl:gap-12">
        {/* Technical Skills */}
        <motion.div
          className="bg-card p-6 md:p-8 lg:p-10 rounded-3xl shadow-xl border border-border flex flex-col"
          style={{ borderRadius: '1.5rem' }}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Code className="text-primary w-7 h-7" />
            <h2 className="text-xl md:text-2xl font-semibold">Technical skills</h2>
          </div>
          <div className="flex-grow space-y-1">
            {technicalSkills.map((skill, i) => (
              <TechnicalSkill
                key={i}
                name={skill.name}
                level={skill.level}
                tags={skill.tags}
                id={skill.name === "Golang" ? "skill-golang" : undefined}
              />
            ))}
          </div>
        </motion.div>

        {/* Soft Skills */}
        <motion.div
          className="bg-card p-6 md:p-8 lg:p-10 rounded-3xl shadow-xl border border-border flex flex-col"
          style={{ borderRadius: '1.5rem' }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Brain className="text-primary w-7 h-7" />
            <h2 className="text-xl md:text-2xl font-semibold">Soft Skills</h2>
          </div>
          <div className="flex-grow space-y-1">
            {softSkills.map((skill, i) => (
              <SoftSkill key={i} name={skill} />
            ))}
          </div>
        </motion.div>

        {/* Languages */}
        <motion.div
          className="bg-card p-6 md:p-8 lg:p-10 rounded-3xl shadow-xl border border-border flex flex-col"
          style={{ borderRadius: '1.5rem' }}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Users className="text-primary w-7 h-7" />
            <h2 className="text-xl md:text-2xl font-semibold">Languages</h2>
          </div>
          <div className="flex-grow space-y-1">
            {languages.map((lang, i) => (
              <Language key={i} name={lang.name} level={lang.level} />
            ))}
          </div>
        </motion.div>
      </div>

      <FlyingHelper targetId="skill-golang" />
    </div>
  );
};

export default SkillsPage;