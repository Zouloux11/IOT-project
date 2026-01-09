import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import StudiesPage from '@/pages/StudiesPage';
import SkillsPage from '@/pages/SkillsPages.tsx';
import ReactionGamePage from '@/pages/ReactionGamePage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import { Toaster } from '@/components/ui/toaster';
import ExperiencePage from './pages/ExperiencesPage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="studies" element={<StudiesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="experiences" element={<ExperiencePage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="games" element={<ReactionGamePage />} />
          <Route path="project/:projectId" element={<ProjectDetailPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;