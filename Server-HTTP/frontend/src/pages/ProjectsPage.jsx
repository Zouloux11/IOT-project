import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { projectsData } from '../data/ProjectsData';

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

const fallbackImageUrl = "https://images.unsplash.com/photo-1572177812156-58036aae439c";

const ProjectsPage = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const navigate = useNavigate();

  const imageIndex = Math.abs(page % projectsData.length);
  const currentProject = projectsData[imageIndex];

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleProjectClick = () => {
    navigate(`/project/${currentProject.id}`);
  };

  return (
    <div className="py-12 min-h-[calc(100vh-10rem)] flex flex-col">
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-center mb-8 gradient-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Projects
      </motion.h1>

      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Explore a selection of my work. Swipe or use the arrows to navigate. Click on a project to see more details.
      </p>

      <div className="relative flex-grow flex flex-col items-center justify-center w-full overflow-hidden">
        <div className="relative w-full max-w-2xl h-[550px] md:h-[600px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              onClick={handleProjectClick}
              className="absolute w-full h-full flex items-center justify-center cursor-pointer"
              role="button"
              aria-label={`Open project ${currentProject.title}`}
            >
              <div className="bg-card rounded-xl shadow-2xl p-6 md:p-8 border border-border w-[90%] md:w-[85%] max-w-xl flex flex-col items-center text-center h-full">
                <div className="w-full h-48 md:h-64 bg-muted rounded-lg mb-4 overflow-hidden relative">
                  <img
                    className="w-full h-full object-cover"
                    alt={currentProject.title}
                    src={currentProject.imageUrl || fallbackImageUrl}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackImageUrl;
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    {currentProject.category}
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{currentProject.title}</h2>
                <p className="text-muted-foreground text-sm md:text-base mb-4 flex-grow overflow-y-auto custom-scrollbar px-2">
                  {currentProject.description}
                </p>

                <div className="flex flex-wrap justify-center gap-2 mt-auto pt-4">
                  {currentProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-primary/20 text-primary text-xs font-medium px-3 py-1.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {[-1, 1].map((dir) => (
          <div
            key={dir}
            className={`absolute top-1/2 ${dir === -1 ? 'left-2 md:left-5' : 'right-2 md:right-5'} transform -translate-y-1/2 z-10`}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                paginate(dir);
              }}
              className="rounded-full h-10 w-10 md:h-12 md:w-12 bg-background/70 hover:bg-muted"
              aria-label={dir === -1 ? 'Previous project' : 'Next project'}
            >
              {dir === -1 ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
            </Button>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-8 space-x-2">
        {projectsData.map((project, idx) => (
          <button
            key={project.id || idx}
            onClick={() => setPage([idx, idx > imageIndex ? 1 : -1])}
            className={`w-3 h-3 rounded-full transition-all duration-300
              ${idx === imageIndex ? 'bg-primary scale-125' : 'bg-muted hover:bg-primary/50'}`}
            aria-label={`Go to project ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
