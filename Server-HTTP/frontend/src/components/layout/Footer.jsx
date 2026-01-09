import React from "react";
import { Mail, Linkedin, Github, GitBranch } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-background/50 py-8 text-center text-muted-foreground">
      <div className="container mx-auto px-4">
        <div className="flex justify-center space-x-6 mb-4">
          <a
            href="mailto:caploic@outlook.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            title="Me contacter par e-mail"
          >
            <Mail size={24} />
          </a>
          <a
            href="https://www.linkedin.com/in/loïc-capdeville2/?locale=en_US"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            title="Profil LinkedIn"
          >
            <Linkedin size={24} />
          </a>
          <a
            href="https://gitlab.com/LoicCapdeville"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors scale-110"
            title="GitLab (Projets Professionnels)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M256 462.6l-182-172.6c-5.4-5.1-7.4-12.7-5.2-19.6l41.4-128.5c2.3-7.2 12.1-7.1 14.3 0.1l34.6 108.2h215.9l34.5-108.2c2.2-7.2 12-7.3 14.3-0.1l41.5 128.5c2.2 6.8 0.2 14.5-5.2 19.6l-182 172.6c-4.5 4.3-11.6 4.3-16.1 0z" />
            </svg>
          </a>
          <a
            href="https://github.com/Zouloux11"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            title="GitHub (Projets Scolaires)"
          >
            <Github size={22} />
          </a>
        </div>

        <div className="text-xs text-muted-foreground mb-4">
          <p>
            <span className="font-medium text-primary">GitLab</span>:
            Professional projects
          </p>
          <p>
            <span className="font-medium text-primary">GitHub</span>: School
            projects
          </p>
        </div>

        <p className="text-sm">
          &copy; {currentYear} Loïc Capdeville. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Built with React, TailwindCSS, and Framer Motion.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
