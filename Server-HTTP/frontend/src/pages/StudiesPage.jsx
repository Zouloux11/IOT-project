import React from "react";
import { motion } from "framer-motion";
import { School, BookOpen, Calendar } from "lucide-react";

const studiesData = [
  {
    institution: "ENSEEIHT (N7), Toulouse, France",
    degree: "Master's Degree in Engineering – Digital Sciences",
    period: "2022 – 2026",
    highlights: [
      "Comprehensive training in algorithms, programming, and system architecture",
      "Specialized in networks and telecommunications with hands-on experience",
      "Practical experience with Linux, Wireshark, Java, and Matlab",
      "Explored operating systems in C, including custom assembler development",
      "Strong focus on applied mathematics and theoretical computer science",
      "Advanced study of distributed systems and network protocols"
    ],
    icon: School,
  },
  {
    institution:
      "Preparatory Classes for Grandes Écoles (CPGE – Lycée Pierre-de-Fermat, Toulouse)",
    degree: "PCSI / PC* (Physics, Chemistry, and Engineering Sciences)",
    period: "2020 – 2022",
    highlights: [
      "Rigorous academic program in advanced mathematics, physics, chemistry and engineering sciences",
      "Preparation for competitive entrance exams to top-tier French engineering schools",
      "Development of analytical problem-solving and theoretical rigor",
      "High-level scientific methodology and research techniques"
    ],
    icon: BookOpen,
  },
];

const StudiesPage = () => {
  return (
    <div className="py-12">
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-center mb-16 gradient-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Academic Journey
      </motion.h1>

      <div className="space-y-12 max-w-5xl mx-auto px-6">
        {studiesData.map((study, index) => (
          <motion.div
            key={index}
            className="bg-card p-8 md:p-10 rounded-3xl shadow-2xl border border-border overflow-hidden relative"
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="flex-shrink-0 p-4 bg-primary/10 rounded-xl text-primary">
                <study.icon className="w-10 h-10" />
              </div>
              
              <div className="flex-grow">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
                  {study.institution}
                </h2>
                
                <h3 className="text-xl text-primary font-semibold mb-4">
                  {study.degree}
                </h3>
                
                <div className="flex items-center text-muted-foreground text-sm mb-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="font-medium">{study.period}</span>
                </div>
                
                <div className="space-y-3">
                  {study.highlights.map((highlight, highlightIndex) => (
                    <motion.div
                      key={highlightIndex}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.2 + highlightIndex * 0.1 
                      }}
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                        {highlight}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Effet décoratif */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/15 rounded-full opacity-60 blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary/20 rounded-full opacity-40 blur-xl"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudiesPage;