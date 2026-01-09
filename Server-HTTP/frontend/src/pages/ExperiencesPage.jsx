import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import experiences from '@/data/ExperiencesData';

const ExperiencePage = () => {
  const navigate = useNavigate();

  return (
    <div className="py-12 px-4 md:px-8 max-w-4xl mx-auto">
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-center mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        My Experience
      </motion.h1>

      <div className="relative border-l-4 border-primary pl-6 space-y-16">
        {experiences.map((exp, index) => (
          <motion.div
            key={exp.id}
            className="relative"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="absolute -left-4 top-2 w-4 h-4 bg-primary rounded-full shadow-lg" />

            <div className="bg-card p-6 rounded-xl border border-border shadow-md">
              <h2 className="text-2xl font-bold text-foreground">{exp.title}</h2>
              <p className="text-muted-foreground text-sm mb-2">
                {exp.company} — {exp.location} | <em>{exp.duration}</em>
              </p>

              <p className="text-base text-foreground whitespace-pre-line mb-4">
                {exp.longDescription.trim()}
              </p>

              {exp.tags && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {exp.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-muted text-sm text-muted-foreground px-3 py-1 rounded-full border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {exp.github && (
                <a
                  href={exp.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:opacity-80"
                >
                  View GitHub Project
                </a>
              )}

              {exp.website && (
                <a
                  href={exp.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-primary underline hover:opacity-80"
                >
                  Visit Company Website
                </a>
              )}

              {exp.imageUrls && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {exp.imageUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`${exp.company} screenshot ${i + 1}`}
                      className="rounded-lg w-full h-48 object-cover border"
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ExperiencePage;
