// Course interface for sample data
export interface Course {
    id: string;
    code: string;
    name: string;
    credits: number;
    description?: string;
    department: string;
    semester: string;
    year: number;
    taken?: boolean;
}

// Sample course data for demo mode
export const sampleCourses: Course[] = [
    // Computer Science Courses
    {
        id: "sample-cs-5304",
        code: "CS 5304",
        name: "Data Science in the Wild",
        credits: 3,
        description: "This course covers the practical aspects of data science including data collection, cleaning, analysis, and visualization using real-world datasets.",
        department: "CS",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-cs-5356",
        code: "CS 5356",
        name: "Building Startup Systems",
        credits: 3,
        description: "Learn to build scalable systems for startup environments, covering architecture, databases, and deployment strategies.",
        department: "CS",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-cs-5785",
        code: "CS 5785",
        name: "Applied Machine Learning",
        credits: 3,
        description: "Practical machine learning techniques including supervised and unsupervised learning, neural networks, and deep learning.",
        department: "CS",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-cs-5781",
        code: "CS 5781",
        name: "Machine Learning Engineering",
        credits: 3,
        description: "Engineering practices for machine learning systems including MLOps, model deployment, and production considerations.",
        department: "CS",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-cs-5787",
        code: "CS 5787",
        name: "Deep Learning",
        credits: 3,
        description: "Advanced deep learning architectures including CNNs, RNNs, transformers, and generative models.",
        department: "CS",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-cs-5112",
        code: "CS 5112",
        name: "Algorithms and Data Structures for Applications",
        credits: 3,
        description: "Practical algorithms and data structures for real-world applications with emphasis on implementation and optimization.",
        department: "CS",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-cs-5412",
        code: "CS 5412",
        name: "Cloud Computing",
        credits: 3,
        description: "Distributed systems, cloud platforms, containerization, and microservices architecture.",
        department: "CS",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-cs-5430",
        code: "CS 5430",
        name: "System Security",
        credits: 3,
        description: "Computer and network security including cryptography, secure coding, and vulnerability assessment.",
        department: "CS",
        semester: "Fall",
        year: 2024,
    },

    // ECE Courses
    {
        id: "sample-ece-5414",
        code: "ECE 5414",
        name: "Applied Machine Learning",
        credits: 3,
        description: "Machine learning from an engineering perspective with focus on signal processing and embedded systems applications.",
        department: "ECE",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-ece-5415",
        code: "ECE 5415",
        name: "Applied Digital Signal Processing and Communications",
        credits: 3,
        description: "Digital signal processing techniques and their applications in modern communication systems.",
        department: "ECE",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-ece-5746",
        code: "ECE 5746",
        name: "Applied Digital ASIC Design",
        credits: 3,
        description: "ASIC design methodology including RTL design, synthesis, and verification for digital systems.",
        department: "ECE",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-ece-5755",
        code: "ECE 5755",
        name: "Computer Systems & Architecture",
        credits: 3,
        description: "Modern computer architecture including processors, memory systems, and parallel computing.",
        department: "ECE",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-ece-5242",
        code: "ECE 5242",
        name: "Intelligent Autonomous Systems",
        credits: 3,
        description: "Design and implementation of autonomous systems including robotics, control theory, and AI integration.",
        department: "ECE",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-ece-5260",
        code: "ECE 5260",
        name: "Data Science for Networked Systems",
        credits: 3,
        description: "Data analysis techniques for networked systems including IoT, sensor networks, and distributed systems.",
        department: "ECE",
        semester: "Spring",
        year: 2025,
    },

    // ORIE Courses
    {
        id: "sample-orie-5355",
        code: "ORIE 5355",
        name: "Applied Data Science",
        credits: 3,
        description: "Statistical methods and optimization techniques applied to large-scale data analysis problems.",
        department: "ORIE",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-orie-5381",
        code: "ORIE 5381",
        name: "Optimization for AI",
        credits: 3,
        description: "Optimization algorithms and theory with applications to machine learning and artificial intelligence.",
        department: "ORIE",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-orie-5751",
        code: "ORIE 5751",
        name: "Learning & Decision-Making",
        credits: 3,
        description: "Decision theory, reinforcement learning, and their applications to business and engineering problems.",
        department: "ORIE",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-orie-5380",
        code: "ORIE 5380",
        name: "Optimization Methods",
        credits: 3,
        description: "Linear and nonlinear optimization techniques with applications to operations research problems.",
        department: "ORIE",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-orie-5530",
        code: "ORIE 5530",
        name: "Modeling Under Uncertainty",
        credits: 3,
        description: "Stochastic modeling, simulation, and risk analysis for uncertain systems.",
        department: "ORIE",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-orie-5750",
        code: "ORIE 5750",
        name: "Applied Machine Learning",
        credits: 3,
        description: "Statistical learning methods with emphasis on practical applications and real-world datasets.",
        department: "ORIE",
        semester: "Fall",
        year: 2024,
    },

    // INFO Courses
    {
        id: "sample-info-5368",
        code: "INFO 5368",
        name: "Practice & Applications of Machine Learning",
        credits: 3,
        description: "Hands-on machine learning with focus on practical implementation and real-world applications.",
        department: "INFO",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-info-6410",
        code: "INFO 6410",
        name: "HCI & Design",
        credits: 3,
        description: "Human-computer interaction principles and user experience design for technology products.",
        department: "INFO",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-info-5310",
        code: "INFO 5310",
        name: "Psychological and Social Aspects of Technology",
        credits: 3,
        description: "Impact of technology on human behavior, society, and organizational structures.",
        department: "INFO",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-info-5325",
        code: "INFO 5325",
        name: "Social and Ethical Issues in Tech",
        credits: 3,
        description: "Ethical frameworks and social implications of technology design and deployment.",
        department: "INFO",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-info-5360",
        code: "INFO 5360",
        name: "Healthcare Organizations & Delivery",
        credits: 2,
        description: "Understanding healthcare systems, delivery models, and organizational structures.",
        department: "INFO",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-info-5375",
        code: "INFO 5375",
        name: "Health Tech Oriented Machine Learning",
        credits: 3,
        description: "Machine learning applications in healthcare including medical imaging and clinical decision support.",
        department: "INFO",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-info-5410",
        code: "INFO 5410",
        name: "Urban Systems",
        credits: 3,
        description: "Analysis and design of urban systems including transportation, utilities, and smart city technologies.",
        department: "INFO",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-info-5420",
        code: "INFO 5420",
        name: "Urban Design Strategies and Case Studies",
        credits: 3,
        description: "Urban planning methodologies and case studies of successful urban technology implementations.",
        department: "INFO",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-info-5430",
        code: "INFO 5430",
        name: "Urban Data",
        credits: 3,
        description: "Data collection, analysis, and visualization techniques for urban planning and smart cities.",
        department: "INFO",
        semester: "Fall",
        year: 2024,
    },

    // Additional Connective Media Program Courses
    {
        id: "sample-info-5920-spec",
        code: "INFO 5920",
        name: "Specialization Projects",
        credits: 4,
        description: "Multi-semester specialization project focusing on connective media research and development.",
        department: "INFO",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-info-5920-anchor",
        code: "INFO 5920",
        name: "Spec Project (Anchor)",
        credits: 1,
        description: "Anchor course component of the specialization project.",
        department: "INFO",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-ethics-course",
        code: "ETHICS",
        name: "Ethics Course Credit",
        credits: 1,
        description: "Ethics course requirement that can be fulfilled by INFO5910 - Revolutionary Technologies.",
        department: "ETHICS",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-ethics-deduct",
        code: "ETHICS-DEDUCT",
        name: "Ethics Credit Deduction",
        credits: -1,
        description: "Credit deduction when ethics requirement is fulfilled by another course.",
        department: "ETHICS",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-cs-5682",
        code: "CS 5682",
        name: "HCI and Design",
        credits: 3,
        description: "Human-computer interaction principles and user experience design methodologies.",
        department: "CS",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-info-5330",
        code: "INFO 5330",
        name: "Tech, Media & Democracy",
        credits: 3,
        description: "Intersection of technology, media systems, and democratic processes in the digital age.",
        department: "INFO",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-info-5910",
        code: "INFO 5910",
        name: "Revolutionary Technologies",
        credits: 3,
        description: "Analysis of transformative technologies and their societal impact throughout history.",
        department: "INFO",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-info-5915",
        code: "INFO 5915",
        name: "Remaking the City",
        credits: 3,
        description: "Urban innovation and technology's role in reshaping urban environments and communities.",
        department: "INFO",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-info-5303",
        code: "INFO 5303",
        name: "Privacy in the Digital Age",
        credits: 3,
        description: "Privacy frameworks, data protection, and individual rights in digital ecosystems.",
        department: "INFO",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-info-5345",
        code: "INFO 5345",
        name: "Developing and Designing Interactive Devices",
        credits: 3,
        description: "Design and development of interactive technologies and embedded systems.",
        department: "INFO",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-cs-5342",
        code: "CS 5342",
        name: "Trust and Safety: Platforms, Policies, Products",
        credits: 3,
        description: "Content moderation, platform governance, and trust and safety systems design.",
        department: "CS",
        semester: "Fall",
        year: 2024,
    },

    // TECH Studio Courses
    {
        id: "sample-tech-5900",
        code: "TECH 5900",
        name: "Product Studio",
        credits: 4,
        description: "Hands-on product development experience working in teams to build technology products from concept to launch.",
        department: "TECH",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-tech-5910",
        code: "TECH 5910",
        name: "Startup Studio",
        credits: 3,
        description: "Experience building a startup from ideation through business model development and pitch presentation.",
        department: "TECH",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-tech-5920",
        code: "TECH 5920",
        name: "BigCo Studio",
        credits: 3,
        description: "Corporate innovation experience working with large companies on digital transformation projects.",
        department: "TECH",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-tech-5930",
        code: "TECH 5930",
        name: "PiTech Impact Studio",
        credits: 3,
        description: "Social impact technology projects addressing real-world challenges in collaboration with nonprofits.",
        department: "TECH",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-tech-5010",
        code: "TECH 5010",
        name: "Ethics in Technology",
        credits: 1,
        description: "Ethical frameworks and decision-making processes for technology professionals.",
        department: "TECH",
        semester: "Fall",
        year: 2024,
    },

    // TECHIE Courses
    {
        id: "sample-techie-5300",
        code: "TECHIE 5300",
        name: "Fundamentals of Modern Software",
        credits: 2,
        description: "Introduction to software development practices, version control, and modern development tools.",
        department: "TECHIE",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-techie-5310",
        code: "TECHIE 5310",
        name: "Business Fundamentals",
        credits: 1,
        description: "Basic business concepts including finance, marketing, and strategy for technology professionals.",
        department: "TECHIE",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-techie-5901",
        code: "TECHIE 5901",
        name: "Preparing for Spec",
        credits: 1,
        description: "Preparation for specialization project including research methods and project planning.",
        department: "TECHIE",
        semester: "Fall",
        year: 2024,
    },

    // Business Courses (NBA/NBAY)
    {
        id: "sample-nbay-6550",
        code: "NBAY 6550",
        name: "Programming for Data Analysis",
        credits: 2,
        description: "Programming skills for business analytics including Python, R, and data visualization tools.",
        department: "NBAY",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-nbay-6150",
        code: "NBAY 6150",
        name: "Demystifying AI Technologies",
        credits: 0.5,
        description: "Introduction to AI technologies and their business applications for non-technical managers.",
        department: "NBAY",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-nbay-5300",
        code: "NBAY 5300",
        name: "Entrepreneurial Finance",
        credits: 1.5,
        description: "Financial principles and practices for technology startups and entrepreneurial ventures.",
        department: "NBAY",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-nbay-5301",
        code: "NBAY 5301",
        name: "Introduction to Entrepreneurial Finance: Firm Valuation and Term Sheets",
        credits: 1,
        description: "Fundamentals of startup valuation and investment term sheet analysis.",
        department: "NBAY",
        semester: "Fall",
        year: 2024,
    },

    // Law Courses
    {
        id: "sample-law-6331",
        code: "LAW 6331",
        name: "Employment Law",
        credits: 1,
        description: "Legal framework governing employment relationships in technology companies.",
        department: "LAW",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-law-6470",
        code: "LAW 6470",
        name: "High Growth Corporate Transactions",
        credits: 2,
        description: "Legal aspects of venture capital, mergers, acquisitions, and IPOs in the technology sector.",
        department: "LAW",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-law-6512",
        code: "LAW 6512",
        name: "Intellectual Property Law",
        credits: 3,
        description: "Patents, trademarks, copyrights, and trade secrets in the context of technology innovation.",
        department: "LAW",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-law-6568",
        code: "LAW 6568",
        name: "Internet Law, Privacy and Security",
        credits: 3,
        description: "Legal frameworks governing internet commerce, data privacy, and cybersecurity.",
        department: "LAW",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-law-6614",
        code: "LAW 6614",
        name: "Law Team",
        credits: 1,
        description: "Collaborative legal project work addressing real-world legal challenges for technology companies.",
        department: "LAW",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-law-6893",
        code: "LAW 6893",
        name: "Technology Transactions",
        credits: 2,
        description: "Legal aspects of technology licensing, software agreements, and SaaS contracts.",
        department: "LAW",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-law-6896",
        code: "LAW 6896",
        name: "Technology Transactions II",
        credits: 2,
        description: "Advanced technology transactions including complex licensing and strategic partnerships.",
        department: "LAW",
        semester: "Spring",
        year: 2025,
    },

    // Design Courses
    {
        id: "sample-design-6151",
        code: "DESIGN 6151",
        name: "Design and Making Across Disciplines I",
        credits: 6,
        description: "Interdisciplinary design thinking and making with focus on digital fabrication and prototyping.",
        department: "DESIGN",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-design-6152",
        code: "DESIGN 6152",
        name: "Design and Making Across Disciplines II",
        credits: 6,
        description: "Advanced interdisciplinary design projects with emphasis on user-centered design and iteration.",
        department: "DESIGN",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-design-6397",
        code: "DESIGN 6397",
        name: "Design for Physical Interaction I",
        credits: 3,
        description: "Physical computing and interaction design using sensors, actuators, and embedded systems.",
        department: "DESIGN",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-design-6398",
        code: "DESIGN 6398",
        name: "Design for Physical Interaction II",
        credits: 3,
        description: "Advanced physical interaction design with focus on IoT and connected devices.",
        department: "DESIGN",
        semester: "Spring",
        year: 2025,
    },
    {
        id: "sample-design-6297",
        code: "DESIGN 6297",
        name: "Coding for Design I",
        credits: 3,
        description: "Programming fundamentals for designers including creative coding and generative design.",
        department: "DESIGN",
        semester: "Fall",
        year: 2024,
    },
    {
        id: "sample-design-6298",
        code: "DESIGN 6298",
        name: "Coding for Design II",
        credits: 3,
        description: "Advanced programming for design including web technologies and interactive installations.",
        department: "DESIGN",
        semester: "Spring",
        year: 2025,
    },
];

// Sample course selections for demo - Connective Media Program courses with some marked as taken
export const sampleSelectedCourses: Course[] = [
    // Jacobs Programmatic Core courses (most taken)
    { ...sampleCourses.find(c => c.id === "sample-info-5920-spec")!, taken: true }, // Specialization Projects (4 cr) - TAKEN
    { ...sampleCourses.find(c => c.code === "TECHIE 5901")!, taken: true }, // Preparing for Spec (1 cr) - TAKEN
    { ...sampleCourses.find(c => c.code === "CS 5356")!, taken: false }, // Building Startup Systems (3 cr) - NOT TAKEN
    { ...sampleCourses.find(c => c.code === "TECH 5900")!, taken: true }, // Product Studio (4 cr) - TAKEN
    { ...sampleCourses.find(c => c.id === "sample-info-5920-anchor")!, taken: true }, // Spec Project (Anchor) (1 cr) - TAKEN
    
    // Jacobs Technical Core courses (most taken)
    { ...sampleCourses.find(c => c.code === "CS 5682")!, taken: true }, // HCI and Design (3 cr) - TAKEN
    { ...sampleCourses.find(c => c.code === "INFO 5368")!, taken: false }, // Practice & Applications of ML (3 cr) - NOT TAKEN
    { ...sampleCourses.find(c => c.code === "CS 5112")!, taken: true }, // Algorithms and Data Structures (3 cr) - TAKEN
    { ...sampleCourses.find(c => c.code === "ETHICS")!, taken: true }, // Ethics Course Credit (1 cr) - TAKEN
    
    // Concentration Core courses (most taken)
    { ...sampleCourses.find(c => c.code === "INFO 5330")!, taken: true }, // Tech, Media & Democracy (3 cr) - TAKEN
    { ...sampleCourses.find(c => c.code === "INFO 5310")!, taken: false }, // Psychological and Social Aspects of Technology (3 cr) - NOT TAKEN
    { ...sampleCourses.find(c => c.code === "INFO 5910")!, taken: true }, // Revolutionary Technologies (3 cr) - TAKEN
    { ...sampleCourses.find(c => c.code === "ETHICS-DEDUCT")!, taken: true }, // Ethics Credit Deduction (-1 cr) - TAKEN
    
    // Concentration Electives courses (most taken, but leave 1 not taken)
    { ...sampleCourses.find(c => c.code === "CS 5304")!, taken: true }, // Data Science in the Wild (3 cr) - TAKEN
    { ...sampleCourses.find(c => c.code === "INFO 5915")!, taken: false }, // Remaking the City (3 cr) - NOT TAKEN
    { ...sampleCourses.find(c => c.code === "INFO 5303")!, taken: false }, // Privacy in the Digital Age (3 cr) - NOT TAKEN
    { ...sampleCourses.find(c => c.code === "INFO 5345")!, taken: false }, // Developing and Designing Interactive Devices (3 cr) - NOT TAKEN
    
    // General Electives courses (leave 1 not taken)
    { ...sampleCourses.find(c => c.code === "TECHIE 5310")!, taken: true }, // Business Fundamentals (1 cr) - TAKEN
    { ...sampleCourses.find(c => c.code === "CS 5342")!, taken: false }, // Trust and Safety (3 cr) - NOT TAKEN
].filter(Boolean); // Remove any undefined courses

// Sample course plan assignments for demo - Connective Media Program matching screenshots exactly
export const sampleCoursePlan: { [key: string]: Course[] } = {
    JacobsProgrammaticCore: [
        sampleCourses.find(c => c.id === "sample-info-5920-spec")!, // Specialization Projects (4 cr)
        sampleCourses.find(c => c.code === "TECHIE 5901")!, // Preparing for Spec (1 cr)
        sampleCourses.find(c => c.code === "CS 5356")!, // Building Startup Systems (3 cr)
        sampleCourses.find(c => c.code === "TECH 5900")!, // Product Studio (4 cr)
        sampleCourses.find(c => c.id === "sample-info-5920-anchor")!, // Spec Project (Anchor) (1 cr)
    ].filter(Boolean),
    JacobsTechnicalCore: [
        sampleCourses.find(c => c.code === "CS 5682")!, // HCI and Design (3 cr)
        sampleCourses.find(c => c.code === "INFO 5368")!, // Practice & Applications of ML (3 cr)
        sampleCourses.find(c => c.code === "CS 5112")!, // Algorithms and Data Structures (3 cr)
        sampleCourses.find(c => c.code === "ETHICS")!, // Ethics Course Credit (1 cr)
    ].filter(Boolean),
    ConcentrationCore: [
        sampleCourses.find(c => c.code === "INFO 5330")!, // Tech, Media & Democracy (3 cr)
        sampleCourses.find(c => c.code === "INFO 5310")!, // Psychological and Social Aspects (3 cr)
        sampleCourses.find(c => c.code === "INFO 5910")!, // Revolutionary Technologies (3 cr)
        sampleCourses.find(c => c.code === "ETHICS-DEDUCT")!, // Ethics Credit Deduction (-1 cr)
    ].filter(Boolean),
    ConcentrationElectives: [
        sampleCourses.find(c => c.code === "CS 5304")!, // Data Science in the Wild (3 cr)
        sampleCourses.find(c => c.code === "INFO 5915")!, // Remaking the City (3 cr)
        sampleCourses.find(c => c.code === "INFO 5303")!, // Privacy in the Digital Age (3 cr)
        sampleCourses.find(c => c.code === "INFO 5345")!, // Developing and Designing Interactive Devices (3 cr)
    ].filter(Boolean),
    GeneralElectives: [
        sampleCourses.find(c => c.code === "TECHIE 5310")!, // Business Fundamentals (1 cr)
        sampleCourses.find(c => c.code === "CS 5342")!, // Trust and Safety (3 cr)
    ].filter(Boolean),
};

// Sample program for demo (MS Connective Media by default)
export const sampleUserProgram = "ms-is-cm";

// Sample schedule data for demo - includes some "not taken" courses with Monday conflicts and others without conflicts
export const sampleScheduleData = [
    // Monday conflicts - 2 courses overlapping
    {
        id: "demo-schedule-1",
        courseId: "sample-info-5345",
        courseName: "Developing and Designing Interactive Devices",
        day: "Monday",
        startTime: "10:00",
        endTime: "11:15",
    },
    {
        id: "demo-schedule-2",
        courseId: "sample-cs-5342",
        courseName: "Trust and Safety: Platforms, Policies, Products",
        day: "Monday",
        startTime: "10:30", // Conflicts with INFO 5345 (10:00-11:15)
        endTime: "11:45",
    },
    
    // Other days without conflicts
    {
        id: "demo-schedule-3",
        courseId: "sample-info-5368",
        courseName: "Practice & Applications of Machine Learning in Pr...",
        day: "Tuesday",
        startTime: "14:00",
        endTime: "15:15",
    },
    {
        id: "demo-schedule-4",
        courseId: "sample-info-5310",
        courseName: "Psychological and Social Aspects of Technology",
        day: "Wednesday",
        startTime: "10:00",
        endTime: "11:15",
    },
    {
        id: "demo-schedule-5",
        courseId: "sample-cs-5356",
        courseName: "Building Startup Systems",
        day: "Thursday",
        startTime: "14:00",
        endTime: "15:15",
    },
    
    // Note: Only INFO 5915 and INFO 5303 remain in Available Courses (not scheduled)
];