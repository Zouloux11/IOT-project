import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Github, Code } from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
          <span className="block">Hello, I'm</span>
          <span className="gradient-text block mt-2">Loïc Capdeville</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed">
          Passionate Backend & Full Stack Engineer focused on creating robust
          and innovative software solutions. Discover my journey and projects.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto text-lg px-8 py-6"
            >
              <Link to="/projects" className="flex items-center">
                My Projects <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary/10 hover:text-accent w-full sm:w-auto text-lg px-8 py-6"
            >
              <a
                href="/documents/CVLoïcCapdeville.pdf"
                download="Loic_Capdeville_Resume.pdf"
                className="flex items-center"
              >
                Download Résumé <Download className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary/10 hover:text-accent w-full sm:w-auto text-lg px-8 py-6"
            >
              <a
                href="https://gitlab.com/LoicCapdeville"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                View GitLab{" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path d="M256 462.6l-182-172.6c-5.4-5.1-7.4-12.7-5.2-19.6l41.4-128.5c2.3-7.2 12.1-7.1 14.3 0.1l34.6 108.2h215.9l34.5-108.2c2.2-7.2 12-7.3 14.3-0.1l41.5 128.5c2.2 6.8 0.2 14.5-5.2 19.6l-182 172.6c-4.5 4.3-11.6 4.3-16.1 0z" />
                </svg>
              </a>
            </Button>
          </motion.div>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-12"
        >
          <Button
            asChild
            size="xl"
            className="border-primary text-accent-foreground px-12 py-6 text-2xl font-bold shadow-lg hover:bg-primary/90 transition-colors"
          >
            <a
              href="https://gitlab.com/LoicCapdeville/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3"
            >
              View the source code of my portfolio <Code className="w-6 h-6" />
            </a>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      ></motion.div>
    </div>
  );
};

export default HomePage;
