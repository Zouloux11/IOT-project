import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectsData } from '../data/ProjectsData';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Github, ExternalLink } from 'lucide-react';

// Import des composants dédiés
import ProjectFlappyBirdRL from './projects/ProjectFlappyBirdRL';
import ProjectCapdevilleDetail from './projects/ProjectCapdevilleDetail';


const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = projectsData.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-destructive mb-4">Project Not Found</h1>
        <p className="text-muted-foreground mb-8">The project you are looking for does not exist.</p>
        <Button asChild>
          <Link to="/projects">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  const getDedicatedComponent = (projectId) => {
    switch (projectId) {
      case 'project-flappybird-RL':
        return <ProjectFlappyBirdRL project={project} navigate={navigate} />;
      case 'project-capdeville':
        return <ProjectCapdevilleDetail project={project} navigate={navigate} />;
      default:
        return null;
    }
  };

  const dedicatedComponent = getDedicatedComponent(projectId);
  
  // Si un composant dédié existe, l'utiliser
  if (dedicatedComponent) {
    return dedicatedComponent;
  }

  // Sinon, utiliser la page générique
  return (
    <div className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-8 group">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </Button>

        <div className="bg-card p-6 md:p-10 rounded-xl shadow-2xl border border-border">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            <motion.div 
              className="w-full h-72 md:h-96 bg-muted rounded-lg overflow-hidden relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <img 
                className="w-full h-full object-cover"
                alt={project.title}
               src="https://images.unsplash.com/photo-1681511346076-da60ca823409" />
              <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-semibold">
                {project.category}
              </div>
            </motion.div>

            <div>
              <motion.h1 
                className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 gradient-text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {project.title}
              </motion.h1>
              <motion.p 
                className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {project.longDescription || project.description}
              </motion.p>

              <motion.div 
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">Technologies Used:</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
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
                {project.githubLink && project.githubLink !== "#" && (
                  <Button variant="outline" asChild>
                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" /> Source Code
                    </a>
                  </Button>
                )}
                {project.liveLink && project.liveLink !== "#" && (
                  <Button variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                     <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> View Live
                    </a>
                  </Button>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetailPage;