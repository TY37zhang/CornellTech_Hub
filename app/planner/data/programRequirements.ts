import type { ProgramRequirements } from "../types";

export const programRequirements: ProgramRequirements = {
  "meng-cs": {
    name: "MEng in Computer Science",
    totalCredits: 30,
    requirements: {
      TechnicalCourses: {
        credits: 18,
        description:
          "15 credits must be CS courses (5000-level or above). The remaining 3 credits must be Technical Electives (5000-level or above, choose from CS, ORIE, ECE, and INFO courses).",
        courses: [],
      },
      StudioCourses: {
        credits: 8,
        description:
          "TECH 5900 Product Studio (4 credits), TECH 5910/5920/5930 Startup/BigCo/PiTech Impact Studio (3 credits), and TECH Studio Elective (1 credit). All Studio courses must be taken for a letter grade and require a grade of B or higher.",
        courses: [],
      },
      GeneralElectives: {
        credits: 4,
        description:
          "Select from any offerings on Cornell Tech's campus (CS, ECE, ORIE, INFO, LAW, NBAY, TECH, TECHIE). Note: TECHIE 5310: Business Fundamentals (Fall only) must be taken as a prerequisite for all business courses. Maximum 2 credits can be taken S/U.",
        courses: [],
      },
    },
    additionalRequirements: [
      "Must maintain minimum 12 credits enrollment each semester",
      "Maximum 18 credits per semester without Program Director approval",
      "Maximum 2 credit hours graded as S/U towards degree requirements",
      "Minimum grade of C- required for all courses",
      "Must maintain at least 2.5 GPA",
      "TECH 5999 (CPT credits) do not count towards degree requirements",
    ],
  },
  "meng-ds": {
    name: "MEng in Data Science & Decision Analytics",
    totalCredits: 30,
    requirements: {
      DataScienceCourses: {
        credits: 9,
        description:
          "Three courses total with at least one from each category. Category 1 - ML/Data Science: CS 5304 Data Science in the Wild, ORIE 5355 Applied Data Science, CS 5785 Applied Machine Learning, CS 5781 Machine Learning Engineering, CS 5787 Deep Learning, ORIE 5381 Optimization for AI. Category 2 - Modeling and Decision-Making: ECE 5242 Intelligent Autonomous Systems, ORIE 5751 Learning & Decision-Making, ECE 5260 Data Science for Networked Systems, ORIE 5380 Optimization Methods, ORIE 5530 Modeling Under Uncertainty.",
        categories: {
          mlDataScience: [
            "CS 5304",
            "ORIE 5355",
            "CS 5785",
            "CS 5781",
            "CS 5787",
            "ORIE 5381",
          ],
          modelingDecisionMaking: [
            "ECE 5242",
            "ORIE 5751",
            "ECE 5260",
            "ORIE 5380",
            "ORIE 5530",
          ],
        },
        courses: [],
      },
      TechnicalCourses: {
        credits: 9,
        description:
          "9 credits of Technical Electives (choose from any ECE, CS, ORIE, or INFO course offerings). Note: Any data science core classes not taken to fulfill the core requirement can be taken to fulfill the technical course requirements. You should discuss your choices with the program director.",
        courses: [],
      },
      StudioCourses: {
        credits: 8,
        description:
          "TECH 5900 Product Studio (4 credits), TECH 5910/5920/5930 Startup/BigCo/PiTech Impact Studio (3 credits), and TECH Studio Elective (1 credit). All Studio courses must be taken for a letter grade and require a grade of B or higher. Note: TECHIE prefix classes do not qualify as Studio electives.",
        courses: [],
      },
      GeneralElectives: {
        credits: 4,
        description:
          "Select from any offerings on Cornell Tech's campus (CS, ECE, ORIE, INFO, LAW, NBAY, TECH, TECHIE). Note: TECHIE 5310: Business Fundamentals (Fall only) must be taken as a prerequisite for all business courses. Students must complete coursework focusing on social and ethical implications of technology-driven decision-making through courses like TECH 5010 or INFO 5325.",
        courses: [],
      },
    },
    additionalRequirements: [
      "Must maintain minimum 12 credits enrollment each semester",
      "Maximum 18 credits per semester without Program Director approval",
      "Maximum 2 credit hours graded as S/U towards degree requirements",
      "Must receive a B or higher in TECH 5900 or TECH 5910/5920/5930",
      "Minimum grade of C- required for all courses",
      "Must maintain at least 2.5 GPA",
      "TECH 5999 (CPT credits) do not count towards degree requirements",
    ],
  },
  "meng-ece": {
    name: "MEng in Electrical and Computer Engineering",
    totalCredits: 30,
    requirements: {
      TechnicalCourses: {
        credits: 18,
        description:
          "Required core courses (6 credits): ECE 5414 Applied Machine Learning OR CS 5781 Machine Learning Engineering (3 credits), AND ECE 5415 Applied Digital Signal Processing and Communications OR ECE 5746 Applied Digital ASIC Design OR ECE 5755 Computer Systems & Architecture (3 credits). Additional requirements: 6 credits of ECE Electives, and 6 credits of Technical Electives (choose from any ECE, CS, ORIE, or INFO course offerings).",
        courses: [],
        categories: {
          mlCore: ["ECE 5414", "CS 5781"],
          systemsCore: ["ECE 5415", "ECE 5746", "ECE 5755"],
        },
      },
      StudioCourses: {
        credits: 8,
        description:
          "TECH 5900 Product Studio (4 credits), TECH 5910/5920/5930 Startup/BigCo/PiTech Impact Studio (3 credits), and TECH Studio Elective (1 credit). All Studio courses must be taken for a letter grade and require a grade of B or higher. Note: TECHIE prefix classes do not qualify as Studio electives.",
        courses: [],
      },
      GeneralElectives: {
        credits: 4,
        description:
          "Select from any offerings on Cornell Tech's campus (CS, ECE, ORIE, INFO, LAW, NBAY, TECH, TECHIE). Note: TECHIE 5310: Business Fundamentals (Fall only) must be taken as a prerequisite for all business courses. Maximum 2 credits can be taken S/U.",
        courses: [],
      },
    },
    additionalRequirements: [
      "Must maintain minimum 12 credits enrollment each semester",
      "Maximum 18 credits per semester without Program Director approval",
      "Maximum 2 credit hours graded as S/U towards degree requirements",
      "Must receive a B or higher in TECH 5900 or TECH 5910/5920/5930",
      "Minimum grade of C- required for all courses",
      "Must maintain at least 2.5 GPA",
      "TECH 5999 (CPT credits) do not count towards degree requirements",
    ],
  },
  "meng-orie": {
    name: "MEng in Operations Research and Information Engineering",
    totalCredits: 30,
    requirements: {
      TechnicalCourses: {
        credits: 18,
        description:
          "Students must take at least 18 credits from advanced technical courses, with at least 12 credits from ORIE courses. Required core: ORIE 5530 Modeling Under Uncertainty (3cr), ORIE 5380 Optimization Methods (3cr), ORIE 5750 Applied Machine Learning OR CS 5781 Machine Learning Engineering (3cr)*. Additional requirements: 3 credits of ORIE electives, and 6 credits of Technical Electives (choose from any ECE, CS, ORIE, or INFO course offerings). *Note: CS 5781 counts towards 18 technical credits but not towards 12 required ORIE credits.",
        courses: [],
        categories: {
          requiredCore: ["ORIE 5530", "ORIE 5380"],
          mlCore: ["ORIE 5750", "CS 5781"],
        },
      },
      StudioCourses: {
        credits: 8,
        description:
          "TECH 5900 Product Studio (4 credits), TECH 5910/5920/5930 Startup/BigCo/PiTech Impact Studio (3 credits), and TECH Studio Elective (1 credit). All Studio courses must be taken for a letter grade and require a grade of B or higher. Note: TECHIE prefix classes do not qualify as Studio electives.",
        courses: [],
      },
      GeneralElectives: {
        credits: 4,
        description:
          "Select from any offerings on Cornell Tech's campus (CS, ECE, ORIE, INFO, LAW, NBAY, TECH, TECHIE). Note: TECHIE 5310: Business Fundamentals (Fall only) must be taken as a prerequisite for all business courses. Maximum 2 credits can be taken S/U.",
        courses: [],
      },
    },
    additionalRequirements: [
      "Must maintain minimum 12 credits enrollment each semester",
      "Maximum 18 credits per semester without Program Director approval",
      "Maximum 2 credit hours graded as S/U towards degree requirements",
      "Must receive a B or higher in TECH 5900 or TECH 5910/5920/5930",
      "Minimum grade of C- required for all courses",
      "Must maintain at least 2.5 GPA",
      "TECH 5999 (CPT credits) do not count towards degree requirements",
    ],
  },
  "ms-dt": {
    name: "MS in Design Technology",
    totalCredits: 60,
    requirements: {
      FirstYearCore: {
        credits: 30,
        description:
          "First year core courses (both tracks): Fall - DESIGN 6151 Design and Making Across Disciplines I (6cr), DESIGN 6397 Design for Physical Interaction I (3cr), DESIGN 6297 Coding for Design I (3cr), Minor/Open Elective (3cr). Spring - DESIGN 6152 Design and Making Across Disciplines II (6cr), DESIGN 6398 Design for Physical Interaction II (3cr), DESIGN 6298 Coding for Design II (3cr), Minor/Open Elective (3cr).",
        courses: [],
      },
      ThesisTrack: {
        credits: 24,
        description:
          "Thesis Research Track (Ithaca-based): Fall - DESIGN 8151 Design Topic Research I (9cr), Minor/Open Elective (3cr). Spring - DESIGN 8905 Independent Design Thesis (9cr), Minor/Open Elective (3cr). Optional summer research: GRAD 9016 Thesis Research (6cr).",
        courses: [],
      },
      StudioTrack: {
        credits: 26,
        description:
          "Studio Professional Track (Cornell Tech-based): Fall - DESIGN 8131 Specialization Project I (3cr), TECH 5900 Product Studio (4cr), Two Minor/Open Electives (6cr). Spring - DESIGN 8935 Specialization Project II (6cr), TECH 5910/5920/5930 Startup/BigCo/PiTech Studio (3cr), Minor/Open Elective (3cr), Studio Elective (1cr).",
        courses: [],
      },
    },
    additionalRequirements: [
      "Students must select either Thesis Research Track (Ithaca) or Studio Professional Track (Cornell Tech) for their second year",
      "First year is common to both tracks and focuses on foundational skills in design and technology",
      "Students are encouraged to work in faculty labs or research programs during summer between first and second year",
      "Studio track students must complete a collaborative specialization project in teams",
      "A studio elective is required for graduation in the Studio Professional Track",
      "Thesis track students must have a two-person special committee by end of first year",
      "Thesis track students must produce a comprehensive research plan with supporting materials",
    ],
  },
  "ms-is-cm": {
    name: "MS in Information Systems (Connective Media)",
    totalCredits: 60,
    requirements: {
      JacobsProgrammaticCore: {
        credits: 17,
        description:
          "Studio courses (8cr): TECH 5900 Product Studio (4cr), TECH 5910/5920/5930 Startup/BigCo/PiTech Studio (3cr), TECH Studio Elective (1cr). Note: TECHIE 5300/5310/5320 do not qualify as Studio electives. All studio courses must be taken for letter grade with B or higher. Additionally: TECHIE 5901 Preparing for Spec (1cr, Fall YR1), Specialization Project (8cr over Spring YR1 and Fall YR2) - choose between Anchor Course + Paired-Prototyping Project OR Faculty-Directed Study.",
        courses: [],
      },
      JacobsTechnicalCore: {
        credits: 10,
        description:
          "Required courses: CS 5112 Algorithms and Data Structures for Applications OR CS 5356 Building Startup Systems (3cr); CS 5785 Applied Machine Learning OR CS 5781 Machine Learning Engineering OR INFO 5368 Practice & Applications of Machine Learning (3cr); INFO 6410 HCI & Design (3cr); Ethics requirement (1cr, can be waived with Program Director approval if covered in other courses).",
        courses: [],
      },
      ConcentrationCore: {
        credits: 9,
        description:
          "INFO 5310 Psychological and Social Aspects of Technology (3cr) plus 6 additional credits from approved Concentration Core courses. Check Class Roster for current offerings.",
        courses: [],
      },
      ConcentrationElectives: {
        credits: 12,
        description:
          "12 credits of approved Concentration Electives. Check Class Roster for current offerings.",
        courses: [],
      },
      GeneralElectives: {
        credits: 12,
        description:
          "Select from any offerings on Cornell Tech's campus (CS, ECE, ORIE, INFO, LAW, NBAY, TECH, TECHIE). Note: TECHIE 5310: Business Fundamentals (Fall only) must be taken as a prerequisite for all business courses.",
        courses: [],
      },
    },
    additionalRequirements: [
      "Must maintain minimum 12 credits enrollment each semester (average 15 credits recommended)",
      "Maximum 18 credits per semester without Program Director approval",
      "All classes must be taken for a letter grade (except S/U-only courses)",
      "Must receive a B or higher in TECH 5900 or TECH 5910/5920/5930",
      "Minimum grade of C- required for all courses",
      "Must maintain at least 2.5 GPA",
      "TECH 5999 (CPT credits) do not count towards degree requirements",
      "Technion students in proper academic state (GPA ≥ 75, English requirement compliance) may take up to two semesters break during degree",
    ],
    optionalCertificate: {
      name: "Jacobs Technion-Cornell Institute Certificate of Accomplishment in Computer Science",
      requirements: [
        "Complete 18 credits of advanced technical courses",
        "At least 15 credits must be CS courses (not practicums/seminars/independent studies/projects)",
        "All courses must be approved by Cornell and Jacobs",
        "Must be taken for letter grade with C- or better",
        "Must maintain 2.5 GPA minimum",
      ],
    },
  },
  "ms-is-ht": {
    name: "MS in Information Systems (Health Tech)",
    totalCredits: 60,
    requirements: {
      JacobsProgrammaticCore: {
        credits: 17,
        description:
          "Studio courses (8cr): TECH 5900 Product Studio (4cr), TECH 5910/5920/5930 Startup/BigCo/PiTech Studio (3cr), TECH Studio Elective (1cr). Note: TECHIE 5300/5310/5320 do not qualify as Studio electives. All studio courses must be taken for letter grade with B or higher. Additionally: TECHIE 5901 Preparing for Spec (1cr, Fall YR1), Specialization Project (8cr over Spring YR1 and Fall YR2) - choose between Anchor Course + Paired-Prototyping Project OR Faculty-Directed Study.",
        courses: [],
      },
      JacobsTechnicalCore: {
        credits: 10,
        description:
          "Required courses: CS 5112 Algorithms and Data Structures for Applications OR CS 5356 Building Startup Systems (3cr); CS 5785 Applied Machine Learning OR CS 5781 Machine Learning Engineering OR INFO 5368 Practice & Applications of Machine Learning (3cr); INFO 6410 HCI & Design (3cr); Ethics requirement (1cr, can be waived with Program Director approval if covered in other courses).",
        courses: [],
      },
      ConcentrationCore: {
        credits: 9,
        description:
          "Required courses: INFO 5360 Healthcare Organizations & Delivery (2cr) + TECH 5999 Companion Independent Study (1cr), INFO 5375 Health Tech Oriented Machine Learning (3cr), plus 3 additional credits from approved Weill Cornell offerings or Concentration Core courses. Check Class Roster for current offerings.",
        courses: [],
      },
      ConcentrationElectives: {
        credits: 12,
        description:
          "12 credits of approved Concentration Electives. Choose from available offerings from Weill Cornell and approved elective courses. Check Class Roster for current offerings.",
        courses: [],
      },
      GeneralElectives: {
        credits: 12,
        description:
          "Select from any offerings on Cornell Tech's campus (CS, ECE, ORIE, INFO, LAW, NBAY, TECH, TECHIE). Note: TECHIE 5310: Business Fundamentals (Fall only) must be taken as a prerequisite for all business courses.",
        courses: [],
      },
    },
    additionalRequirements: [
      "Must maintain minimum 12 credits enrollment each semester (average 15 credits recommended)",
      "Maximum 18 credits per semester without Program Director approval",
      "All classes must be taken for a letter grade (except S/U-only courses)",
      "Must receive a B or higher in TECH 5900 or TECH 5910/5920/5930",
      "Minimum grade of C- required for all courses",
      "Must maintain at least 2.5 GPA",
      "TECH 5999 (CPT credits) do not count towards degree requirements",
      "Technion students in proper academic state (GPA ≥ 75, English requirement compliance) may take up to two semesters break during degree",
    ],
    optionalCertificate: {
      name: "Jacobs Technion-Cornell Institute Certificate of Accomplishment in Computer Science",
      requirements: [
        "Complete 18 credits of advanced technical courses",
        "At least 15 credits must be CS courses (not practicums/seminars/independent studies/projects)",
        "All courses must be approved by Cornell and Jacobs",
        "Must be taken for letter grade with C- or better",
        "Must maintain 2.5 GPA minimum",
      ],
    },
  },
  "ms-is-ut": {
    name: "MS in Information Systems (Urban Tech)",
    totalCredits: 60,
    requirements: {
      JacobsProgrammaticCore: {
        credits: 17,
        description:
          "Studio courses (8cr): TECH 5900 Product Studio (4cr), TECH 5910/5920/5930 Startup/BigCo/PiTech Studio (3cr), TECH Studio Elective (1cr). Note: TECHIE 5300/5310/5320 do not qualify as Studio electives. All studio courses must be taken for letter grade with B or higher. Additionally: TECHIE 5901 Preparing for Spec (1cr, Fall YR1), Specialization Project (8cr over Spring YR1 and Fall YR2) - choose between Anchor Course + Paired-Prototyping Project OR Faculty-Directed Study.",
        courses: [],
      },
      JacobsTechnicalCore: {
        credits: 10,
        description:
          "Required courses: CS 5112 Algorithms and Data Structures for Applications OR CS 5356 Building Startup Systems (3cr); CS 5785 Applied Machine Learning OR CS 5781 Machine Learning Engineering OR INFO 5368 Practice & Applications of Machine Learning (3cr); INFO 6410 HCI & Design (3cr); Ethics requirement (1cr, can be waived with Program Director approval if covered in other courses).",
        courses: [],
      },
      ConcentrationCore: {
        credits: 9,
        description:
          "Required courses: INFO 5410 Urban Systems (3cr), INFO 5420 Urban Design Strategies and Case Studies (3cr), and INFO 5430 Urban Data OR CS/INFO 5304 Data Science in the Wild (3cr).",
        courses: [],
      },
      ConcentrationElectives: {
        credits: 12,
        description:
          "12 credits of approved Concentration Electives. Check Class Roster for current offerings.",
        courses: [],
      },
      GeneralElectives: {
        credits: 12,
        description:
          "Select from any offerings on Cornell Tech's campus (CS, ECE, ORIE, INFO, LAW, NBAY, TECH, TECHIE). Note: TECHIE 5310: Business Fundamentals (Fall only) must be taken as a prerequisite for all business courses.",
        courses: [],
      },
    },
    additionalRequirements: [
      "Must maintain minimum 12 credits enrollment each semester (average 15 credits recommended)",
      "Maximum 18 credits per semester without Program Director approval",
      "All classes must be taken for a letter grade (except S/U-only courses)",
      "Must receive a B or higher in TECH 5900 or TECH 5910/5920/5930",
      "Minimum grade of C- required for all courses",
      "Must maintain at least 2.5 GPA",
      "TECH 5999 (CPT credits) do not count towards degree requirements",
      "Technion students in proper academic state (GPA ≥ 75, English requirement compliance) may take up to two semesters break during degree",
    ],
    optionalCertificate: {
      name: "Jacobs Technion-Cornell Institute Certificate of Accomplishment in Computer Science",
      requirements: [
        "Complete 18 credits of advanced technical courses",
        "At least 15 credits must be CS courses (not practicums/seminars/independent studies/projects)",
        "All courses must be approved by Cornell and Jacobs",
        "Must be taken for letter grade with C- or better",
        "Must maintain 2.5 GPA minimum",
      ],
    },
  },
  mba: {
    name: "Johnson Cornell Tech MBA",
    totalCredits: 50,
    requirements: {
      JohnsonCore: {
        credits: 20,
        description:
          "Required core courses: NCCY 5000 Financial Accounting (2.5cr), NCCY 5020 Microeconomics for Management (2.5cr), NCCY 5030 Marketing Management (2.5cr), NCCY 5040 Leading Teams (1cr), NCCY 5050 Critical & Strategic Thinking (1.5cr), NCCY 5060 Managerial Finance (2.5cr), NCCY 5090 Strategy (2.5cr), NCCY 5010 Data Analytics & Modeling (2.5cr), NCCY 5080 Operations Management (2.5cr). All courses must be taken in specified semesters.",
        courses: [],
      },
      JohnsonRequired: {
        credits: 4,
        description:
          "Required courses: NBAY 6550 Programming for Data Analysis (2cr), NBAY 6150 Demystifying AI Technologies (0.5cr), NBAY 5300 Entrepreneurial Finance (1.5cr).",
        courses: [],
      },
      StudioCourses: {
        credits: 8,
        description:
          "TECH 5900 Product Studio (4cr, Fall), TECH 5910/5920/5930 Startup/BigCo/PiTech Impact Studio (3cr, Spring), and TECH Studio Elective (1cr, Spring). Note: TECHIE prefix classes do not qualify as Studio electives. All Studio courses must be taken for a letter grade.",
        courses: [],
      },
      GeneralElectives: {
        credits: 18,
        description:
          "9 credits must come from NBA, NBAY, NCCY, NMI (Fall & Spring). 9 credits selected from any offerings on Cornell Tech's campus (CS, ECE, ORIE, INFO, LAW, NBA, NBAY, TECH, TECHIE).",
        courses: [],
      },
    },
    additionalRequirements: [
      "Must maintain minimum 12 credits enrollment each semester",
      "Maximum 20 credits per semester without Faculty Program Director approval",
      "All JCT MBA students must complete a minimum of 50 credits and meet all requirements outlined above to graduate",
      "Maximum 2 Grade Option courses as Satisfactory/Unsatisfactory (S/U-only courses don't count towards this limit)",
      "Must receive a B or higher in TECH 5900 or TECH 5910/5920/5930",
      "D- is the minimum grade required for other courses to count towards degree requirements",
      "Maximum 6 directed reading credits (no more than 3 credits per term)",
      "Must maintain at least 2.7 GPA overall and 2.5 in core NCCY courses",
      "Must complete 3 semesters of residency at Johnson/Cornell Tech (minimum 12 credits per semester)",
      "Curricular Practical Training credits (TECH 5999) do not count towards graduation/degree requirements",
    ],
  },
  llm: {
    name: "LLM in Law, Technology, and Entrepreneurship",
    totalCredits: 33,
    requirements: {
      CoreRequirements: {
        credits: 18,
        description:
          "Required courses: LAW 6331 Employment Law (1cr), LAW 6470 High Growth Corporate Transactions (2cr), LAW 6512 Intellectual Property Law (3cr), LAW 6568 Internet Law, Privacy and Security (3cr), LAW 6614 Law Team (1cr), LAW 6893 Technology Transactions (2cr), LAW 6896 Technology Transactions II (2cr), NBAY 5301 Introduction to Entrepreneurial Finance: Firm Valuation and Term Sheets (1cr), TECHIE 5300 Fundamentals of Modern Software (2cr), TECHIE 5310 Business Fundamentals (1cr).",
        courses: [],
      },
      StudioCourses: {
        credits: 8,
        description:
          "TECH 5900 Product Studio (4cr), TECH 5910/5920/5930 Startup/BigCo/PiTech Impact Studio (3cr), and TECH Studio Elective (1cr). Note: TECHIE prefix classes do not qualify as Studio electives. All Studio courses must be taken for a letter grade.",
        courses: [],
      },
      Electives: {
        credits: 7,
        description:
          "6 credits of LAW electives (at least 2 credits must be from approved Corporate Law electives) and 1 credit of Free Electives. Maximum of 12 credits permitted for electives.",
        courses: [],
      },
    },
    additionalRequirements: [
      "Must maintain minimum 12 credits enrollment each semester (average 15 credits recommended)",
      "Maximum 20 credits per semester without Program Director approval",
      "Students must receive a passing grade to receive credit (audited electives do not count)",
      "Must receive a B or higher in TECH 5900 or TECH 5910/5920/5930",
      "All required courses must be taken for a letter grade",
      "At least 3 credits of law electives must be taken for a letter grade",
      "Other courses may be taken graded or S/U",
      "Students with merit point ratio below 2.50 after first semester will be placed on informal probation",
      "Must meet with Program Director if placed on probation before continued enrollment",
      "Curricular Practical Training credits (TECH 5999) do not count towards graduation/degree requirements",
    ],
  },
};
