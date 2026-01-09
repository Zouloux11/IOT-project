import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Globe,
  Shield,
  Users,
  Server,
  Database,
  Layers,
  MessageSquare,
  Cloud,
  MapPin,
  Bus,
  Calendar,
  FileText,
  Lock,
} from "lucide-react";

const ProjectCapdevillePage = ({ project, navigate }) => {
  return (
    <div className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-8 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </Button>

{/* Hero Section */}
<div className="bg-card p-6 md:p-10 rounded-xl shadow-2xl border border-border mb-8">
  <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
    <motion.div
      className="w-full h-72 md:h-96 rounded-lg overflow-hidden relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <img
        src="../public/images/capdevillevoyages.jpg"
        alt="Capdeville Voyages"
        className="w-full h-full object-cover"
      />
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
        A complete web platform developed for a family-owned tourism transport company in south of France. The solution includes a modern showcase site and a secure employee portal with Keycloak authentication, microservices-based architecture, and real-time messaging.
      </motion.p>

      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Tech Stack:
        </h3>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary/20 text-primary text-xs font-medium px-3 py-1.5 rounded-full"
            >
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
          <a
            href="https://capdevillevoyages.fr"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Globe className="mr-2 h-4 w-4" /> Showcase Website
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a
            href="https://conducteurs.capdevillevoyages.fr"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Lock className="mr-2 h-4 w-4" /> Employee Portal
          </a>
        </Button>
      </motion.div>
    </div>
  </div>
</div>

{/* Architecture Diagram */}
<motion.div
  className="bg-card p-6 md:p-10 rounded-xl shadow-2xl border border-border mb-8"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.6 }}
>
  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
    Architecture Overview
  </h2>
  <div className="bg-muted p-6 rounded-lg">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {/* Frontend Layer */}
      <div className="text-center">
        <div className="bg-blue-500/20 p-4 rounded-lg mb-3">
          <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-foreground">Frontend Layer</h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="bg-card p-2 rounded">Public Website (React)</div>
          <div className="bg-card p-2 rounded">Employee Portal (React)</div>
          <div className="bg-card p-2 rounded">CDN Assets</div>
        </div>
      </div>

      {/* Infrastructure Layer */}
      <div className="text-center">
        <div className="bg-yellow-500/20 p-4 rounded-lg mb-3">
          <Layers className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <h3 className="font-semibold text-foreground">Infrastructure</h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="bg-card p-2 rounded">Resgate Gateway</div>
          <div className="bg-card p-2 rounded">NATS Messaging</div>
          <div className="bg-card p-2 rounded">Dockerized Services</div>
        </div>
      </div>

      {/* Backend Layer */}
      <div className="text-center">
        <div className="bg-green-500/20 p-4 rounded-lg mb-3">
          <Server className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-foreground">Backend Layer</h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="bg-card p-2 rounded">API Gateway (Golang)</div>
          <div className="bg-card p-2 rounded">Authentication (Keycloak)</div>
          <div className="bg-card p-2 rounded">Business Logic (Golang)</div>
          <div className="bg-card p-2 rounded">Email Sending via SMTP</div>
        </div>
      </div>

      {/* Data Layer */}
      <div className="text-center">
        <div className="bg-purple-500/20 p-4 rounded-lg mb-3">
          <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-foreground">Data Layer</h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="bg-card p-2 rounded">PostgreSQL</div>
          <div className="bg-card p-2 rounded">File Storage</div>
        </div>
      </div>
    </div>
  </div>
</motion.div>


        {/* Features Section */}
        <motion.div
          className="bg-card p-6 md:p-10 rounded-xl shadow-2xl border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Public Showcase Site */}
            <div className="border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Globe className="mr-2 h-5 w-5 text-primary" />
                Public Showcase Website
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <MapPin className="mr-2 h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Presentation of bus circuits
                </li>
                <li className="flex items-start">
                  <Bus className="mr-2 h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Vehicle catalog and transportation services
                </li>
                <li className="flex items-start">
                  <Users className="mr-2 h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  Fully responsive and accessible interface
                </li>
                <li className="flex items-start">
                  <Cloud className="mr-2 h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  CDN integration for optimal performance
                </li>
                <li className="flex items-start">
                  <Calendar className="mr-2 h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  Quote request using an email system
                </li>
              </ul>
            </div>
            {/* Secure Employee Portal */}
            <div className="border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Secure Employee Portal
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <Lock className="mr-2 h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  Keycloak SSO authentication
                </li>
                <li className="flex items-start">
                  <Calendar className="mr-2 h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Driver schedule management
                </li>
                <li className="flex items-start">
                  <FileText className="mr-2 h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Access to internal documents and resources
                </li>
                <li className="flex items-start">
                  <Users className="mr-2 h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  Advanced admin panel
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-card p-6 md:p-10 rounded-xl shadow-2xl border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            Detailed Technical Stack
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Frontend */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <Globe className="mr-2 h-5 w-5 text-blue-600" />
                Frontend
              </h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>• React with Hooks and Context</li>
                <li>• React Router for client-side navigation</li>
                <li>• Chakra UI for styling and layout</li>
                <li>• Mobile responsive design</li>
              </ul>
            </div>

            {/* Backend */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <Server className="mr-2 h-5 w-5 text-green-600" />
                Backend
              </h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>• Golang for microservices</li>
                <li>• Internal API Gateway (Golang)</li>
                <li>• NATS for messaging</li>
                <li>• Resgate for real-time resource access</li>
                <li>• Authentication via Keycloak (JWT / OAuth2)</li>
              </ul>
            </div>

            {/* Infrastructure */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <Layers className="mr-2 h-5 w-5 text-purple-600" />
                Infrastructure
              </h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>• Docker & Docker Compose</li>
                <li>• PostgreSQL with replication</li>
                <li>• Static assets served via CDN</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Security & Performance */}
<motion.div
  className="grid md:grid-cols-2 gap-6"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.9 }}
>
  <div className="bg-card p-6 md:p-8 rounded-xl shadow-2xl border border-border">
    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
      <Shield className="mr-2 h-6 w-6 text-green-600" />
      Security
    </h3>
    <ul className="text-muted-foreground space-y-2">
      <li>• Centralized authentication via Keycloak</li>
      <li>• End-to-end TLS/SSL encryption</li>
      <li>• Server-side data validation</li>
      <li>• Audit logs and monitoring</li>
    </ul>
  </div>

  <div className="bg-card p-6 md:p-8 rounded-xl shadow-2xl border border-border">
    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
      <MessageSquare className="mr-2 h-6 w-6 text-blue-600" />
      Performance
    </h3>
    <ul className="text-muted-foreground space-y-2">
      <li>• Real-time messaging with NATS</li>
      <li>• Caching layer using Resgate subscriptions</li>
      <li>• Asset optimization via CDN</li>
      <li>• Automatic load balancing</li>
    </ul>
  </div>
</motion.div>

      </motion.div>
    </div>
  );
};

export default ProjectCapdevillePage;
