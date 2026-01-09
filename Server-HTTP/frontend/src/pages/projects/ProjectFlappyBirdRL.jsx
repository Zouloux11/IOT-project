import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Github } from "lucide-react";

const ProjectFlappyBirdRL = ({ project, navigate }) => {
  return (
    <div className="py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-8 group">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </Button>

        {/* Hero Section */}
        <div className="bg-card p-6 md:p-10 rounded-xl shadow-2xl border border-border mb-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            <motion.div
              className="w-full h-72 md:h-96 rounded-lg overflow-hidden relative bg-black flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <video
                src="/videos/flappybird.mp4"
                controls
                className="w-full h-full object-contain"
                alt="Flappy Bird RL Demo"
              />
            </motion.div>

            <div>
              <motion.h1
                className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 gradient-text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {project.title || "Flappy Bird Reinforcement Learning"}
              </motion.h1>
              
              {/* Only use longDescription here */}
              <motion.p
                className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {project.longDescription}
              </motion.p>

              <motion.div
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">Tech Stack:</h3>
                <div className="flex flex-wrap gap-2">
                  {(project.tags || []).map(tag => (
                    <span key={tag} className="bg-primary/20 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="flex space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button variant="outline" asChild>
                  <a href="https://github.com/Zouloux11/apprentissage" target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" /> GitHub Repo
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectFlappyBirdRL;
