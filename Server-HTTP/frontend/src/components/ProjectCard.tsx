import React from "react";
import { Link } from "react-router-dom";

export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  tags: string[];
  githubLink: string;
  liveLink: string | null;
};

type ProjectCardProps = {
  project: Project;
  small?: boolean;
};

const ProjectCard = ({ project, small = false }: ProjectCardProps) => {
  return (
    <Link
      to={`/project/${project.id}`}
      className={`block rounded-xl border p-4 shadow-md hover:shadow-lg transition-shadow duration-200 ${small ? 'w-60' : 'w-full'}`}
    >
      <img
        src={project.imageUrl}
        alt={project.title}
        className="rounded-md w-full h-36 object-cover mb-4"
      />
      <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
      <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
    </Link>
  );
};

export default ProjectCard;
