export const projectsData = [
  {
    id: "project-capdeville",
    title: "Capdeville Voyages Platform",
    category: "Full Stack Web Application",
    description:
      "Complete platform for a tourist transportation company: public showcase site and secure employee portal with administrative management.",
    longDescription:
      "Development of a full web platform for Capdeville Voyages, a family-run tourist transport company in the Aude region. The project includes a modern showcase website presenting transport services and tourist routes, as well as a secure employee portal for managing schedules and documents. The microservices architecture uses React, Golang, PostgreSQL, NATS for messaging, and Keycloak for authentication, all containerized with Docker.",
    imageUrl: "../../public/images/capdevillevoyages.jpg",
    tags: [
      "React",
      "Golang",
      "PostgreSQL",
      "Docker",
      "Keycloak",
      "Resgate",
      "NATS",
      "CDN",
      "Microservices",
    ],
    githubLink: "#",
    liveLink: "https://capdevillevoyages.fr",
  },

  {
    id: "project-flappybird-RL",
    title: "Python Deep Learning - Flappy Bird Agent",
    category: "Machine Learning / AI",
    description:
      "Development and learning project in Python: Deep Learning for a Flappy Bird agent using epsilon greedy method and comparing different strategies.",
    longDescription:
      "This project consists of developing an intelligent agent capable of learning to play Flappy Bird using Deep Learning. Multiple versions of the game were created to increase complexity and prevent the agent from achieving a perfect score every time. The full report and code are available on GitHub. The implementation compares various learning methods and exploration strategies (epsilon greedy).",
    imageUrl: "../../public/images/flappybird.JPG",
    tags: ["Python", "Deep Learning", "Reinforcement Learning", "Epsilon Greedy"],
    githubLink: "https://github.com/Zouloux11/apprentissage",
    liveLink: null,
  },
];
