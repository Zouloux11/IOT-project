import CBNL1 from '../../public/images/CBNL1.jpg';
import CBNL2 from '../../public/images/CBNL2.jpg';
import GOLANG from '../../public/images/golang.png'

const experiencesData = [
  {
    id: "experience-cbnl",
    title: "Java Software Developer",
    company: "CrownBio Science",
    location: "The Netherlands",
    duration: "6-month internship (2024)",
    description: "Java plugin for ImageJ to automate image analysis tasks in the lab at CrownBio Science.",
    longDescription: `
      During my internship at CrownBio Science, I developed a Java plugin for ImageJ aimed at assisting lab technicians with their image analysis tasks.

      The plugin automated several routine steps, thus improving productivity. A simplified version (without proprietary internal techniques)is available on GitHub.

      I also contributed to updating workflows and migrating the software versions used by scientists.
    `,
    imageUrls: [CBNL1, CBNL2],
    tags: ["Java", "ImageJ", "Git", "Open Source", "Automation"],
    githubLink: "https://github.com/CrownBioscienceNL/ImageJ_Plugins_Published",
    liveLink: null,
  },
{
  id: "experience-loungeup",
  title: "Backend Developer (Golang & PHP)",
  company: "D-EDGE (LoungeUp)",
  location: "France",
  duration: "6-month internship (2024–2025) + 1-year apprenticeship (2025–2026)",
  description: "Backend web development in Golang and PHP for a secure file management system integrated with BunnyCDN. I developed the complete API architecture using NATS and Resgate following the Store-Domain-Service pattern.",
  longDescription: `
    At D-EDGE (LoungeUp), I contributed to the modernization of the platform by developing new backend features in Golang.

    My main project was to build a permission-based file management system, integrated with BunnyCDN for fast file delivery.

    I also migrated PHP code to Golang and performed database migrations. The infrastructure relies on Docker, Kubernetes and Gitlab CI/CD for deployment.
  `,
  imageUrls: [GOLANG],
  tags: [
    "Golang",
    "PHP",
    "Docker",
    "Kubernetes",
    "PostgreSQL",
    "BunnyCDN",
    "Microservices",
    "NATS",
    "Resgate",
    "SDS"
  ],
  githubLink: null,
  liveLink: "https://www.d-edge.com/",
}
];

export default experiencesData;