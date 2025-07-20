"use client";

import { useState, useEffect, useRef } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { useToast } from "@/components/ui/use-toast";
import {
    BookOpen,
    Search,
    GraduationCap,
    HelpCircle,
    X,
} from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
    sampleCourses, 
    sampleSelectedCourses, 
    sampleCoursePlan, 
    sampleUserProgram
} from "@/lib/sampleData";

/**
 * How to Use the Planner:
 * 1. Select your program from the dropdown menu
 * 2. Use the course search to find and add courses to your plan
 * 3. Assign courses to specific requirements by dragging them to the appropriate section
 * 4. Track your progress through the progress bars and credit counters
 * 5. Mark courses as "taken" if you've already completed them
 * 6. Your plan will be automatically saved as you make changes
 *
 * Tips:
 * - Hover over requirement sections to see detailed descriptions
 * - Use the search bar to quickly find specific courses
 * - Check the additional requirements section for important program rules
 * - The progress bars show your completion status for each requirement
 */

interface Course {
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

interface Requirement {
    credits: number;
    description: string;
    courses?: Course[];
    categories?: {
        [key: string]: string[];
    };
}

interface ProgramRequirement {
    name: string;
    totalCredits: number;
    requirements: {
        [key: string]: Requirement;
    };
    additionalRequirements?: string[];
    optionalCertificate?: {
        name: string;
        requirements: string[];
    };
}

interface ProgramRequirements {
    [key: string]: ProgramRequirement;
}

// Program requirements data structure
const programRequirements: ProgramRequirements = {
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
            "Technion students with GPA ≥ 75 may take up to two semesters break during degree",
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
            "Technion students with GPA ≥ 75 may take up to two semesters break during degree",
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
            "Technion students with GPA ≥ 75 may take up to two semesters break during degree",
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

const CourseSelector = dynamic(() => import("./components/CourseSelector"), {
    ssr: false,
    loading: () => <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
});

const SelectedCourses = dynamic(() => import("./components/SelectedCourses"), {
    ssr: true,
    loading: () => <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
});

const CourseSchedule = dynamic(() => import("./components/CourseSchedule"), {
    ssr: true,
    loading: () => <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
});

const AdditionalQuestions = dynamic(
    () => import("./components/AdditionalQuestions"),
    {
        ssr: true,
        loading: () => <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
    }
);

export default function PlannerPage() {
    const { data: session, status } = useSession();
    const [userProgram, setUserProgram] = useState<string | null>(null);
    const [coursePlan, setCoursePlan] = useState<{ [key: string]: Course[] }>(
        {}
    );
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
    const { toast } = useToast();
    const [coursePlanIds, setCoursePlanIds] = useState<{
        [courseId: string]: string;
    }>({});
    const selectedCoursesRef = useRef<HTMLDivElement>(null);
    const coursePlanRef = useRef<HTMLDivElement>(null);
    const [showHelp, setShowHelp] = useState(true);
    const [showHelpModal, setShowHelpModal] = useState(false); // new state for modal
    // Add state for collapsible requirement cards
    const [expandedRequirements, setExpandedRequirements] = useState<{
        [key: string]: boolean;
    }>({});
    // Add state for collapsible Additional Questions and Additional Requirements
    const [expandedAdditionalQuestions, setExpandedAdditionalQuestions] =
        useState(true);
    const [expandedAdditionalRequirements, setExpandedAdditionalRequirements] =
        useState(true);
    
    // Demo mode state
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [showDemoBanner, setShowDemoBanner] = useState(true);
    
    // Ethics course tracking state
    const [selectedEthicsCourse, setSelectedEthicsCourse] = useState<Course | null>(null);
    const [ethicsDeductionCategory, setEthicsDeductionCategory] = useState<string | null>(null);

    // Helper: toggle expanded state for a requirement card
    const toggleRequirement = (key: string) => {
        setExpandedRequirements((prev) => {
            const newState = { ...prev, [key]: !prev[key] };
            if (typeof window !== "undefined") {
                localStorage.setItem(
                    "plannerExpandedRequirements",
                    JSON.stringify(newState)
                );
            }
            return newState;
        });
    };
    // Helper: toggle for Additional Questions
    const toggleAdditionalQuestions = () => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setExpandedAdditionalQuestions((prev) => {
                const newState = !prev;
                localStorage.setItem(
                    "plannerExpandedAdditionalQuestions",
                    JSON.stringify(newState)
                );
                return newState;
            });
        }
    };
    // Helper: toggle for Additional Requirements
    const toggleAdditionalRequirements = () => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setExpandedAdditionalRequirements((prev) => {
                const newState = !prev;
                localStorage.setItem(
                    "plannerExpandedAdditionalRequirements",
                    JSON.stringify(newState)
                );
                return newState;
            });
        }
    };

    // Helper: toggle showHelp for How to Use the Planner card
    const toggleShowHelp = (value: boolean) => {
        setShowHelp(value);
        if (typeof window !== "undefined") {
            localStorage.setItem("plannerShowHelp", JSON.stringify(value));
        }
    };

    // Restore expanded/collapsed state from localStorage on mount
    useEffect(() => {
        // Restore expanded/collapsed state for requirements
        if (typeof window !== "undefined") {
            const savedExpandedRequirements = localStorage.getItem(
                "plannerExpandedRequirements"
            );
            if (savedExpandedRequirements) {
                setExpandedRequirements(JSON.parse(savedExpandedRequirements));
            }
            // Restore Additional Questions
            const savedAdditionalQuestions = localStorage.getItem(
                "plannerExpandedAdditionalQuestions"
            );
            if (savedAdditionalQuestions !== null) {
                setExpandedAdditionalQuestions(
                    JSON.parse(savedAdditionalQuestions)
                );
            }
            // Restore Additional Requirements
            const savedAdditionalRequirements = localStorage.getItem(
                "plannerExpandedAdditionalRequirements"
            );
            if (savedAdditionalRequirements !== null) {
                setExpandedAdditionalRequirements(
                    JSON.parse(savedAdditionalRequirements)
                );
            }
            // Restore How to Use the Planner help card
            const savedShowHelp = localStorage.getItem("plannerShowHelp");
            if (savedShowHelp !== null) {
                setShowHelp(JSON.parse(savedShowHelp));
            }
        }
        // No cleanup needed
    }, []);

    // Add scroll position persistence
    useEffect(() => {
        // Restore scroll position
        const savedScrollPosition = sessionStorage.getItem(
            "plannerScrollPosition"
        );
        if (savedScrollPosition) {
            window.scrollTo(0, parseInt(savedScrollPosition));
        }

        // Save scroll position before unload
        const handleBeforeUnload = () => {
            sessionStorage.setItem(
                "plannerScrollPosition",
                window.scrollY.toString()
            );
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        const initializePage = async () => {
            try {
                setIsLoading(true);

                if (status === 'loading') {
                    // Don't initialize while session is still loading
                    return;
                }

                if (status === 'authenticated' && session?.user?.program) {
                    setUserProgram(session.user.program);
                    setIsDemoMode(false);
                    await loadSavedCoursePlans();
                } else if (status === 'authenticated' && session) {
                    setIsDemoMode(false);
                    // Parallel fetch user program and prepare for course plans
                    const [userProgram] = await Promise.all([
                        fetchUserProgramAsync(),
                        // Could add other parallel operations here
                    ]);
                    if (userProgram) {
                        setUserProgram(userProgram);
                        await loadSavedCoursePlans();
                    }
                } else if (status === 'unauthenticated') {
                    // No session - initialize demo mode
                    initializeDemoMode();
                }
            } catch (error) {
                console.error("Error initializing page:", error);
                toast({
                    title: "Error",
                    description: "Failed to initialize the page",
                    variant: "destructive",
                });
            } finally {
                // Only stop loading if we're not in the 'loading' status
                if (status !== 'loading') {
                    setIsLoading(false);
                }
            }
        };

        const initializeDemoMode = () => {
            // Load demo data
            setIsDemoMode(true);
            setUserProgram(sampleUserProgram);
            setSelectedCourses([...sampleSelectedCourses]);
            setCoursePlan(JSON.parse(JSON.stringify(sampleCoursePlan))); // Deep copy
            
            // Check if we should force refresh demo data (can be controlled via URL param or localStorage flag)
            const urlParams = new URLSearchParams(window.location.search);
            const forceRefresh = urlParams.get('refresh') === 'true' || localStorage.getItem('forceRefreshDemo') === 'true';
            
            if (forceRefresh) {
                // Clear all demo-related localStorage and use fresh sample data
                localStorage.removeItem('plannerDemoData');
                localStorage.removeItem('demoScheduleData');
                localStorage.removeItem('additionalQuestionsDemo');
                localStorage.removeItem('showTakenCoursesDemo');
                localStorage.removeItem('forceRefreshDemo');
                console.log('Demo data refreshed with latest sample data');
            } else {
                // Load from localStorage if available (preserving user changes)
                const savedDemoData = localStorage.getItem('plannerDemoData');
                if (savedDemoData) {
                    try {
                        const demoData = JSON.parse(savedDemoData);
                        setSelectedCourses(demoData.selectedCourses || [...sampleSelectedCourses]);
                        setCoursePlan(demoData.coursePlan || JSON.parse(JSON.stringify(sampleCoursePlan)));
                        setUserProgram(demoData.userProgram || sampleUserProgram);
                    } catch (error) {
                        console.warn('Failed to load demo data from localStorage:', error);
                        // Fall back to fresh sample data
                        setSelectedCourses([...sampleSelectedCourses]);
                        setCoursePlan(JSON.parse(JSON.stringify(sampleCoursePlan)));
                        setUserProgram(sampleUserProgram);
                    }
                }
            }
        };

        // Initialize when we have a definitive authentication status
        if (status !== 'loading' && !userProgram) {
            initializePage();
        }
    }, [session, status]);

    const loadSavedCoursePlans = async () => {
        try {
            const response = await fetch("/api/planner");

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error response:", errorText);
                throw new Error(`Failed to load course plans: ${errorText}`);
            }

            const data = await response.json();

            // Optimize data processing with single loop
            const uniqueCoursesMap = new Map<string, Course>();
            const newCoursePlan: { [key: string]: Course[] } = {};
            const coursePlanIds: { [courseId: string]: string } = {};

            // Single pass through data for better performance
            for (const plan of data) {
                const courseId = plan.course.id;
                
                // Handle unique courses map
                const existing = uniqueCoursesMap.get(courseId);
                if (!existing || plan.course.taken) {
                    uniqueCoursesMap.set(courseId, plan.course);
                }

                // Handle course plan structure
                if (plan.requirementType) {
                    if (!newCoursePlan[plan.requirementType]) {
                        newCoursePlan[plan.requirementType] = [];
                    }
                    newCoursePlan[plan.requirementType].push(plan.course);
                    coursePlanIds[courseId] = plan.id;
                }
            }

            setSelectedCourses(Array.from(uniqueCoursesMap.values()));

            // Store the plan IDs in state
            setCoursePlanIds(coursePlanIds);
            setCoursePlan(newCoursePlan);
        } catch (error) {
            console.error("Error loading course plans:", error);
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to load your saved course plans",
                variant: "destructive",
            });
            throw error; // Re-throw to be caught by the parent
        }
    };


    const fetchUserProgramAsync = async (): Promise<string | null> => {
        try {
            const response = await fetch("/api/user");
            const data = await response.json();

            if (!data.program) {
                toast({
                    title: "Program not set",
                    description:
                        "Please set your program in the settings page first.",
                    variant: "destructive",
                });
                return null;
            }
            return data.program;
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load your program information.",
                variant: "destructive",
            });
            return null;
        }
    };

    // Save demo data to localStorage
    const saveDemoData = () => {
        if (isDemoMode) {
            const demoData = {
                selectedCourses,
                coursePlan,
                userProgram,
            };
            localStorage.setItem('plannerDemoData', JSON.stringify(demoData));
        }
    };

    // Demo mode handler for requirement assignment
    const handleAddToRequirementDemo = (course: Course, requirementKey: string | null) => {
        if (!requirementKey) {
            // Remove from all requirements
            setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
                const newPlan = { ...prevPlan };
                for (const key in newPlan) {
                    newPlan[key] = newPlan[key].filter((c) => c.id !== course.id);
                }
                setTimeout(() => saveDemoData(), 0);
                return newPlan;
            });
            return;
        }

        // Remove from other requirements first
        setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
            const newPlan = { ...prevPlan };
            for (const key in newPlan) {
                if (key !== requirementKey) {
                    newPlan[key] = newPlan[key].filter((c) => c.id !== course.id);
                }
            }
            return newPlan;
        });

        // Add to selected requirement
        setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
            const currentCourses = prevPlan[requirementKey] || [];
            const newPlan = {
                ...prevPlan,
                [requirementKey]: [...currentCourses, course],
            };
            setTimeout(() => saveDemoData(), 0);
            return newPlan;
        });
    };


    const calculateTotalCredits = () => {
        if (!userProgram) return 0;

        let totalCredits = 0;
        let totalEthicsDeductions = 0;

        Object.keys(coursePlan).forEach(categoryKey => {
            const creditInfo = calculateCategoryCredits(categoryKey);
            totalCredits += creditInfo.totalCredits;
            totalEthicsDeductions += creditInfo.ethicsDeduction;
        });

        return totalCredits - totalEthicsDeductions;
    };

    const calculateRequirementProgress = (requirementKey: string) => {
        if (!userProgram) return 0;

        const creditInfo = calculateCategoryCredits(requirementKey);
        const requiredCredits =
            programRequirements[userProgram].requirements[requirementKey]
                .credits;

        return (creditInfo.netCredits / requiredCredits) * 100;
    };

    const calculateOverallProgress = () => {
        if (!userProgram) return 0;

        const totalCredits = calculateTotalCredits();
        const requiredCredits = programRequirements[userProgram].totalCredits;

        return (totalCredits / requiredCredits) * 100;
    };


    const handleAddToRequirement = async (
        course: Course,
        requirementKey: string | null
    ) => {
        if (!userProgram) {
            toast({
                title: "Error",
                description: "Program must be selected",
                variant: "destructive",
            });
            return;
        }

        // Demo mode - handle locally without API calls
        if (isDemoMode) {
            handleAddToRequirementDemo(course, requirementKey);
            return;
        }

        if (!session?.user?.id) {
            toast({
                title: "Error",
                description:
                    "You must be logged in and have a program selected",
                variant: "destructive",
            });
            return;
        }

        try {
            if (!requirementKey) {
                // Remove from all requirements
                setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
                    const newPlan = { ...prevPlan };
                    for (const key in newPlan) {
                        newPlan[key] = newPlan[key].filter(
                            (c) => c.id !== course.id
                        );
                    }
                    return newPlan;
                });

                // Delete from database
                const planId = coursePlanIds[course.id];
                if (planId) {
                    const deleteResponse = await fetch(
                        `/api/planner?id=${planId}`,
                        {
                            method: "DELETE",
                        }
                    );

                    if (!deleteResponse.ok) {
                        const errorText = await deleteResponse.text();
                        console.error("Error deleting course plan:", errorText);
                        throw new Error(
                            `Failed to delete course plan: ${errorText}`
                        );
                    }

                    // Remove the plan ID from state
                    setCoursePlanIds((prev) => {
                        const newIds = { ...prev };
                        delete newIds[course.id];
                        return newIds;
                    });
                }

                return;
            }

            // Remove from other requirements first
            setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
                const newPlan = { ...prevPlan };
                for (const key in newPlan) {
                    if (key !== requirementKey) {
                        newPlan[key] = newPlan[key].filter(
                            (c) => c.id !== course.id
                        );
                    }
                }
                return newPlan;
            });

            // Add to selected requirement
            setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
                const currentCourses = prevPlan[requirementKey] || [];
                const newTotalCredits =
                    currentCourses.reduce(
                        (sum: number, c: Course) => sum + c.credits,
                        0
                    ) + course.credits;

                if (
                    newTotalCredits >
                    programRequirements[userProgram].totalCredits
                ) {
                    toast({
                        title: "Warning",
                        description: `You have selected ${newTotalCredits} total credits, but only ${programRequirements[userProgram].totalCredits} are required for your program.`,
                        variant: "destructive",
                        duration: 5000,
                    });
                } else if (
                    newTotalCredits ===
                    programRequirements[userProgram].totalCredits
                ) {
                    toast({
                        title: "Success",
                        description: `You have selected the required ${programRequirements[userProgram].totalCredits} credits for your program.`,
                        variant: "default",
                        duration: 3000,
                    });
                }

                return {
                    ...prevPlan,
                    [requirementKey]: [...currentCourses, course],
                };
            });

            // Save to database
            const saveData = {
                courseId: course.id,
                requirementType: requirementKey,
                semester: course.semester || "Fall",
                year: course.year || new Date().getFullYear(),
                status: "planned",
            };

            try {
                // First check if a plan already exists for this course
                const existingPlanId = coursePlanIds[course.id];
                if (existingPlanId) {
                    // Update existing plan
                    const updateResponse = await fetch("/api/planner", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            id: existingPlanId,
                            requirementType: requirementKey,
                            semester: course.semester || "Fall",
                            year: course.year || new Date().getFullYear(),
                            status: "planned",
                        }),
                    });

                    if (!updateResponse.ok) {
                        const errorText = await updateResponse.text();
                        console.error("Error updating course plan:", errorText);
                        throw new Error(
                            `Failed to update course plan: ${errorText}`
                        );
                    }

                    await updateResponse.json();
                } else {
                    // Create new plan
                    const createResponse = await fetch("/api/planner", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(saveData),
                    });

                    if (!createResponse.ok) {
                        const errorText = await createResponse.text();
                        console.error("Error creating course plan:", errorText);
                        throw new Error(
                            `Failed to create course plan: ${errorText}`
                        );
                    }

                    const newPlan = await createResponse.json();

                    // Store the new plan ID
                    setCoursePlanIds((prev) => ({
                        ...prev,
                        [course.id]: newPlan.id,
                    }));
                }
            } catch (error) {
                console.error("Error in save operation:", error);
                toast({
                    title: "Error",
                    description:
                        error instanceof Error
                            ? error.message
                            : "Failed to save course plan",
                    variant: "destructive",
                });
                // Revert the UI state on error
                setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
                    const newPlan = { ...prevPlan };
                    if (requirementKey) {
                        newPlan[requirementKey] = newPlan[
                            requirementKey
                        ].filter((c) => c.id !== course.id);
                    }
                    return newPlan;
                });
            }
        } catch (error) {
            console.error("Error handling requirement assignment:", error);
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to update course requirements",
                variant: "destructive",
            });
        }
    };

    const handleRemoveCourse = async (course: Course) => {
        try {
            // Remove from selectedCourses
            setSelectedCourses((prevCourses: Course[]) =>
                prevCourses.filter((c) => c.id !== course.id)
            );

            // Remove from all requirements in coursePlan
            setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
                const newPlan = { ...prevPlan };
                for (const key in newPlan) {
                    newPlan[key] = newPlan[key].filter(
                        (c) => c.id !== course.id
                    );
                }
                return newPlan;
            });

            // Demo mode - just save to localStorage
            if (isDemoMode) {
                setTimeout(() => saveDemoData(), 0);
                toast({
                    title: "Success",
                    description: "Course removed successfully",
                    variant: "default",
                });
                return;
            }

            // Delete all course plans for this course from database
            const response = await fetch(`/api/planner?courseId=${course.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error deleting course plans:", errorText);
                throw new Error(`Failed to delete course plans: ${errorText}`);
            }

            // Remove all plan IDs for this course from state
            setCoursePlanIds((prev) => {
                const newIds = { ...prev };
                delete newIds[course.id];
                return newIds;
            });

            toast({
                title: "Success",
                description: "Course removed successfully",
                variant: "default",
            });
        } catch (error) {
            console.error("Error removing course:", error);
            // Revert UI state on error
            setSelectedCourses((prev) => [...prev, course]);
            setCoursePlan((prevPlan) => {
                const newPlan = { ...prevPlan };
                // Restore course to its original requirement if it exists
                if (coursePlanIds[course.id]) {
                    const requirementKey = Object.keys(newPlan).find((key) =>
                        newPlan[key].some((c) => c.id === course.id)
                    );
                    if (requirementKey) {
                        newPlan[requirementKey] = [
                            ...newPlan[requirementKey],
                            course,
                        ];
                    }
                }
                return newPlan;
            });
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to remove the course. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleEthicsCourseChange = async (
        hasEthicsCourse: boolean,
        course?: Course,
        deductFromCategory?: string
    ) => {
        // Update the ethics course tracking state
        if (hasEthicsCourse && course && deductFromCategory) {
            setSelectedEthicsCourse(course);
            setEthicsDeductionCategory(deductFromCategory);
            console.log("Ethics course set:", course.code, "deducting from:", deductFromCategory);
        } else {
            setSelectedEthicsCourse(null);
            setEthicsDeductionCategory(null);
            console.log("Ethics course cleared");
        }
        
        // Simplified for demo mode - just save to localStorage
        if (isDemoMode) {
            setTimeout(() => saveDemoData(), 0);
        }
    };

    const handleTechie5901Change = async (hasTechie5901: boolean) => {
        // Simplified for demo mode - just save to localStorage
        if (isDemoMode) {
            setTimeout(() => saveDemoData(), 0);
        }
        console.log("Techie 5901 change:", hasTechie5901);
    };

    // Helper function to check if a course fulfills ethics requirement
    const isEthicsCourse = (courseCode: string): boolean => {
        // List of courses that can fulfill ethics requirement
        const ethicsCourseCodes = [
            "INFO 5910", // Revolutionary Technologies
            "INFO 5325", // Social and Ethical Issues in Tech
            "TECH 5010", // Ethics in Technology
            "INFO 5999", // Ethics in AI and Data Science
        ];
        return ethicsCourseCodes.includes(courseCode);
    };

    // Helper function to check if ethics requirement is fulfilled and get the course
    const getEthicsFulfillmentInfo = () => {
        // Check Additional Questions state for selected ethics course
        // For demo mode, we'll assume INFO 5910 is the ethics course if it's assigned
        const ethicsCourse = Object.values(coursePlan).flat().find(course => 
            isEthicsCourse(course.code)
        );
        return ethicsCourse;
    };

    // Helper function to calculate credits for a category including ethics deduction
    const calculateCategoryCredits = (categoryKey: string) => {
        const courses = coursePlan[categoryKey] || [];
        const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
        
        // Check if this category should have ethics deduction based on user selection
        const shouldDeductEthicsCredit = selectedEthicsCourse && 
            ethicsDeductionCategory === categoryKey &&
            courses.some(course => course.id === selectedEthicsCourse.id);
        
        // Programs that have ethics requirements typically include MS IS programs
        const programsWithEthicsRequirements = [
            "ms-is-cm", "ms-is-ht", "ms-is-ut"  // MS Information Systems programs
        ];
        const ethicsDeduction = shouldDeductEthicsCredit && 
            userProgram && 
            programsWithEthicsRequirements.includes(userProgram) ? 1 : 0;
            
        return {
            totalCredits,
            ethicsDeduction,
            netCredits: totalCredits - ethicsDeduction
        };
    };

    const handleCourseTaken = async (course: Course, taken: boolean) => {
        try {
            setSelectedCourses((prevCourses) =>
                prevCourses.map((c) =>
                    c.id === course.id ? { ...c, taken } : c
                )
            );
            setCoursePlan((prevPlan) => {
                const newPlan = { ...prevPlan };
                for (const key in newPlan) {
                    newPlan[key] = newPlan[key].map((c) =>
                        c.id === course.id ? { ...c, taken } : c
                    );
                }
                return newPlan;
            });

            // Demo mode - just save to localStorage
            if (isDemoMode) {
                setTimeout(() => saveDemoData(), 0);
                return;
            }

            const planId = coursePlanIds[course.id];
            if (planId) {
                // Find the requirementType for this course
                let planRequirementType = null;
                for (const [reqKey, courses] of Object.entries(coursePlan)) {
                    if (courses.some((c) => c.id === course.id)) {
                        planRequirementType = reqKey;
                        break;
                    }
                }
                // Use course fields for semester/year, and default status/notes
                const planSemester = course.semester;
                const planYear = course.year;
                const planStatus = "planned";
                const planNotes = "";

                const response = await fetch(`/api/planner?id=${planId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: planId,
                        requirementType: planRequirementType,
                        semester: planSemester,
                        year: planYear,
                        status: planStatus,
                        notes: planNotes,
                        taken,
                    }),
                });
                if (!response.ok)
                    throw new Error("Failed to update course status");
            }
        } catch (error) {
            console.error("Error updating course status:", error);
            toast({
                title: "Error",
                description: "Failed to update course status",
                variant: "destructive",
            });
        }
    };

    if (isLoading || status === 'loading') {
        return (
            <div>
                {/* Loading Skeleton */}
                <div className="w-full bg-gradient-to-b from-pink-50 to-white">
                    <div className="container mx-auto p-4">
                        <div className="text-center py-12">
                            <div className="h-12 bg-gray-200 rounded-md w-64 mx-auto mb-4 animate-pulse"></div>
                            <div className="h-6 bg-gray-200 rounded-md w-96 mx-auto animate-pulse"></div>
                        </div>
                        <div className="text-center mb-8">
                            <div className="h-8 bg-gray-200 rounded-md w-80 mx-auto animate-pulse"></div>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto p-4 space-y-6">
                    <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-4 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                        <div className="md:col-span-8 space-y-6">
                            <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
                            <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    if (!userProgram || !programRequirements[userProgram]) {
        return (
            <div className="flex min-h-screen flex-col">
                <div className="flex-1">
                    <section className="w-full py-12 md:py-24 lg:py-16">
                        <div className="container px-4 md:px-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <Card className="w-full max-w-2xl">
                                    <CardHeader className="space-y-1">
                                        <CardTitle className="text-2xl">
                                            Program Not Set
                                        </CardTitle>
                                        <CardDescription>
                                            Please set your program in the
                                            settings page before using the
                                            course planner.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center space-y-4">
                                        <p className="text-muted-foreground">
                                            You need to select your program to
                                            start planning your courses.
                                        </p>
                                        <Button asChild>
                                            <Link href="/settings">
                                                Go to Settings
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Help Icon Floating Button (when help is hidden) */}
            {!showHelp && (
                <button
                    className="fixed bottom-6 right-6 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors"
                    aria-label="Show How to Use the Planner"
                    onClick={() => setShowHelpModal(true)}
                >
                    <HelpCircle className="h-6 w-6" />
                </button>
            )}
            {/* Modal Popup for Help */}
            {showHelpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <Card className="relative w-full max-w-2xl mx-4 p-6 bg-blue-50 border-blue-200 shadow-xl">
                        <button
                            className="absolute top-4 right-4 text-blue-500 hover:text-blue-700"
                            aria-label="Close How to Use the Planner"
                            onClick={() => setShowHelpModal(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <CardHeader className="pb-0">
                            <CardTitle className="flex items-center gap-2 justify-center text-center w-full">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                How to Use the Planner
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                <div className="space-y-2">
                                    <h3 className="font-medium">
                                        Getting Started
                                    </h3>
                                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                        <li>
                                            Select your program in the{" "}
                                            <b>settings</b> page
                                        </li>
                                        <li>
                                            Use the course search to find and
                                            add courses to your plan
                                        </li>
                                        <li>
                                            Assign courses to specific
                                            requirements using the dropdown menu
                                            on the right
                                        </li>
                                        <li>
                                            Track your progress through the
                                            progress bars and credit counters
                                        </li>
                                        <li>
                                            Add your courses to the Course
                                            Schedule section to plan your weekly
                                            timetable
                                        </li>
                                    </ol>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-medium">
                                        Tips & Tricks
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                        <li>
                                            Hover over requirement sections to
                                            see detailed descriptions
                                        </li>
                                        <li>
                                            Use the search bar to quickly find
                                            specific courses
                                        </li>
                                        <li>
                                            Mark courses as "taken" if you've
                                            already completed them
                                        </li>
                                        <li>
                                            Selected Courses and Course Schedule
                                            are collapsible
                                        </li>
                                        <li>
                                            Your plan will be automatically
                                            saved as you make changes
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Top Section with Gradient Background */}
            <div className="w-full bg-gradient-to-b from-pink-50 to-white">
                <div className="container mx-auto p-4">
                    {/* Program Title */}
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-mono tracking-tighter sm:text-3xl md:text-4xl mb-4">
                            Course Planner
                        </h1>
                        <p className="text-gray-600 text-base md:text-lg font-mono">
                            Plan and track your academic journey.
                        </p>
                    </div>
                    {/* Program Info */}
                    <div className="text-center mb-4">
                        <div className="flex items-center justify-center gap-3">
                            <GraduationCap className="h-6 w-6" />
                            <h2 className="text-xl font-mono font-semibold tracking-tighter">
                                {programRequirements[userProgram].name}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Demo Mode Banner */}
            {isDemoMode && showDemoBanner && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <div className="container mx-auto p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">You're viewing the Course Planner in Demo Mode</h3>
                                    <p className="text-blue-100 text-sm md:text-base">
                                        Explore all features with sample data. Your changes are saved locally. 
                                        <span className="font-medium"> Create an account to save your real course plan!</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 flex-shrink-0">
                                <Button 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={() => {
                                        // Reset demo data to fresh Connective Media sample
                                        localStorage.setItem('forceRefreshDemo', 'true');
                                        window.location.reload();
                                    }}
                                    className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                                >
                                    Reset Demo
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={() => signIn()}
                                    className="bg-white text-blue-600 hover:bg-blue-50"
                                >
                                    Sign In
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDemoBanner(false)}
                                    className="text-white hover:bg-white/20"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="container mx-auto p-4 space-y-6">
                {/* Help Section (hidable) */}
                {showHelp && !showHelpModal && (
                    <Card className="relative p-6 bg-blue-50 border-blue-200">
                        <button
                            className="absolute top-4 right-4 text-blue-500 hover:text-blue-700"
                            aria-label="Hide How to Use the Planner"
                            onClick={() => toggleShowHelp(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <CardHeader className="pb-0">
                            <CardTitle className="flex items-center gap-2 justify-center text-center w-full">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                How to Use the Planner
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                <div className="space-y-2">
                                    <h3 className="font-medium">
                                        Getting Started
                                    </h3>
                                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                        <li>
                                            Select your program from the{" "}
                                            <b>
                                                dropdown menu in the settings
                                                page
                                            </b>
                                        </li>
                                        <li>
                                            Use the course search to find and
                                            add courses to your plan
                                        </li>
                                        <li>
                                            Assign courses to specific
                                            requirements using the dropdown menu
                                            on the right
                                        </li>
                                        <li>
                                            Track your progress through the
                                            progress bars and credit counters
                                        </li>
                                        <li>
                                            Add your courses to the Course
                                            Schedule section to plan your weekly
                                            timetable
                                        </li>
                                    </ol>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-medium">
                                        Tips & Tricks
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                        <li>
                                            Hover over requirement sections to
                                            see detailed descriptions
                                        </li>
                                        <li>
                                            Use the search bar to quickly find
                                            specific courses
                                        </li>
                                        <li>
                                            Mark courses as "taken" if you've
                                            already completed them
                                        </li>
                                        <li>
                                            Selected Courses and Course Schedule
                                            are collapsible
                                        </li>
                                        <li>
                                            Your plan will be automatically
                                            saved as you make changes
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {/* Overall Progress */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">
                                Overall Progress
                            </h2>
                            <span className="text-sm text-muted-foreground">
                                {calculateTotalCredits()} /{" "}
                                {programRequirements[userProgram].totalCredits}{" "}
                                credits
                            </span>
                        </div>
                        <Progress
                            value={calculateOverallProgress()}
                            className="h-3"
                        />
                    </div>
                </Card>
                {/* Main Content - Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left Column - Categories */}
                    <div
                        ref={coursePlanRef}
                        className="md:col-span-4 space-y-4"
                    >
                        {Object.entries(
                            programRequirements[userProgram].requirements
                        ).map(([key, requirement]) => {
                            // Responsive: expanded by default on desktop, toggle on mobile
                            const isMobile =
                                typeof window !== "undefined" &&
                                window.innerWidth < 768;
                            const expanded =
                                expandedRequirements[key] ?? !isMobile;
                            return (
                                <Card
                                    key={key}
                                    className="p-0 hover:shadow-md transition-shadow group"
                                >
                                    {/* Header as button on mobile, static on desktop */}
                                    <div
                                        className={`flex flex-wrap items-center px-4 py-3 cursor-pointer md:cursor-default select-none md:select-text`}
                                        onClick={() => {
                                            if (window.innerWidth < 768)
                                                toggleRequirement(key);
                                        }}
                                        aria-expanded={expanded}
                                        aria-controls={`requirement-content-${key}`}
                                        role={isMobile ? "button" : undefined}
                                        tabIndex={isMobile ? 0 : -1}
                                    >
                                        {/* Title and status row */}
                                        <div className="flex-1 flex flex-col items-start gap-y-1 min-w-0">
                                            <span className="font-medium truncate">
                                                {key
                                                    .replace(/([A-Z])/g, " $1")
                                                    .trim()}
                                            </span>
                                            <span className="text-sm text-muted-foreground font-normal">
                                                {(() => {
                                                    const creditInfo = calculateCategoryCredits(key);
                                                    
                                                    if (creditInfo.ethicsDeduction > 0) {
                                                        return `${creditInfo.netCredits} / ${requirement.credits} cr (incl. -1 ethics deduction)`;
                                                    }
                                                    return `${creditInfo.totalCredits} / ${requirement.credits} cr`;
                                                })()}
                                            </span>
                                        </div>
                                        {/* Chevron for mobile */}
                                        <span className="ml-2 md:hidden">
                                            <svg
                                                className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </span>
                                    </div>
                                    {/* Collapsible content */}
                                    <div
                                        id={`requirement-content-${key}`}
                                        className={`px-4 pb-4 transition-all duration-300 overflow-hidden ${expanded ? "block" : "hidden"} md:block`}
                                    >
                                        <Progress
                                            value={calculateRequirementProgress(
                                                key
                                            )}
                                            className="h-2 mb-3"
                                        />
                                        <p className="text-sm text-muted-foreground opacity-0 h-0 group-hover:opacity-100 group-hover:h-auto group-hover:mt-2 transition-all duration-300 overflow-hidden">
                                            {requirement.description}
                                        </p>
                                        {/* Selected Courses for this category */}
                                        {(coursePlan[key] || []).length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {coursePlan[key].map(
                                                    (course) => (
                                                        <div
                                                            key={course.id}
                                                            className={`flex justify-between items-center text-sm p-2 rounded ${
                                                                selectedEthicsCourse && selectedEthicsCourse.id === course.id
                                                                    ? "bg-blue-50 border border-blue-200" 
                                                                    : "bg-muted"
                                                            }`}
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <div className={`font-medium ${
                                                                    selectedEthicsCourse && selectedEthicsCourse.id === course.id
                                                                        ? "text-blue-800" 
                                                                        : ""
                                                                }`}>
                                                                    {course.code}
                                                                    {selectedEthicsCourse && selectedEthicsCourse.id === course.id && " (Ethics)"}
                                                                </div>
                                                                <div className={`text-sm truncate ${
                                                                    selectedEthicsCourse && selectedEthicsCourse.id === course.id
                                                                        ? "text-blue-600" 
                                                                        : "text-muted-foreground"
                                                                }`}>
                                                                    {course.name}
                                                                    {selectedEthicsCourse && selectedEthicsCourse.id === course.id && " - fulfills ethics requirement"}
                                                                </div>
                                                            </div>
                                                            <Badge
                                                                variant="secondary"
                                                                className={`ml-2 ${
                                                                    selectedEthicsCourse && selectedEthicsCourse.id === course.id
                                                                        ? "bg-blue-100 text-blue-800" 
                                                                        : ""
                                                                }`}
                                                            >
                                                                {course.credits}{" "}
                                                                cr
                                                                {selectedEthicsCourse && selectedEthicsCourse.id === course.id && " (-1)"}
                                                            </Badge>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                        
                        {/* Collapsible Additional Questions Card */}
                        <Card className="p-0 hover:shadow-md transition-shadow group">
                            <div
                                className={`flex justify-between items-center px-4 py-3 cursor-pointer md:cursor-default select-none md:select-text`}
                                onClick={toggleAdditionalQuestions}
                                aria-expanded={expandedAdditionalQuestions}
                                aria-controls="additional-questions-content"
                                role={
                                    typeof window !== "undefined" &&
                                    window.innerWidth < 768
                                        ? "button"
                                        : undefined
                                }
                                tabIndex={
                                    typeof window !== "undefined" &&
                                    window.innerWidth < 768
                                        ? 0
                                        : -1
                                }
                            >
                                <h3 className="font-medium">
                                    Additional Questions
                                </h3>
                                {/* Chevron for mobile */}
                                <span className="ml-2 md:hidden">
                                    <svg
                                        className={`w-4 h-4 transition-transform ${expandedAdditionalQuestions ? "rotate-90" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </span>
                            </div>
                            <div
                                id="additional-questions-content"
                                className={`px-4 pb-4 transition-all duration-300 overflow-hidden ${expandedAdditionalQuestions ? "block" : "hidden"} md:block`}
                            >
                                <AdditionalQuestions
                                    onEthicsCourseChange={
                                        handleEthicsCourseChange
                                    }
                                    onTechie5901Change={handleTechie5901Change}
                                    selectedCourses={selectedCourses}
                                    coursePlan={coursePlan}
                                    isDemoMode={isDemoMode}
                                    currentSelectedEthicsCourse={selectedEthicsCourse}
                                    currentEthicsDeductionCategory={ethicsDeductionCategory}
                                />
                            </div>
                        </Card>
                        {/* Additional Requirements Card */}
                        {programRequirements[userProgram]
                            .additionalRequirements && (
                            <Card className="p-0 hover:shadow-md transition-shadow group">
                                <div
                                    className={`flex justify-between items-center px-4 py-3 cursor-pointer md:cursor-default select-none md:select-text`}
                                    onClick={toggleAdditionalRequirements}
                                    aria-expanded={
                                        expandedAdditionalRequirements
                                    }
                                    aria-controls="additional-requirements-content"
                                    role={
                                        typeof window !== "undefined" &&
                                        window.innerWidth < 768
                                            ? "button"
                                            : undefined
                                    }
                                    tabIndex={
                                        typeof window !== "undefined" &&
                                        window.innerWidth < 768
                                            ? 0
                                            : -1
                                    }
                                >
                                    <h3 className="font-medium">
                                        Additional Requirements
                                    </h3>
                                    {/* Chevron for mobile */}
                                    <span className="ml-2 md:hidden">
                                        <svg
                                            className={`w-4 h-4 transition-transform ${expandedAdditionalRequirements ? "rotate-90" : ""}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </span>
                                </div>
                                <div
                                    id="additional-requirements-content"
                                    className={`px-4 pb-4 transition-all duration-300 overflow-hidden ${expandedAdditionalRequirements ? "block" : "hidden"} md:block`}
                                >
                                    <div className="space-y-3">
                                        <ul className="text-sm text-muted-foreground space-y-2">
                                            {programRequirements[
                                                userProgram
                                            ].additionalRequirements.map(
                                                (requirement, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-start gap-2"
                                                    >
                                                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground"></span>
                                                        <span>
                                                            {requirement}
                                                        </span>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                    {/* Right Column - Course Search and Management */}
                    <div className="md:col-span-8 space-y-6">
                        {/* Search Section */}
                        <Card className="p-6">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Search className="h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search for courses..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="flex-1"
                                    />
                                </div>
                                {/* Course Selector */}
                                <CourseSelector
                                    requirement={{
                                        credits:
                                            programRequirements[userProgram]
                                                .totalCredits,
                                        description: "All available courses",
                                    }}
                                    selectedCourses={selectedCourses}
                                    onSelectCourse={async (course) => {
                                        try {
                                            // Add to selectedCourses state
                                            setSelectedCourses([
                                                ...selectedCourses,
                                                course,
                                            ]);
                                            setSearchQuery("");

                                            // Demo mode - just save locally
                                            if (isDemoMode) {
                                                setTimeout(() => saveDemoData(), 0);
                                                toast({
                                                    title: "Success",
                                                    description: "Course added to your plan",
                                                    variant: "default",
                                                });
                                                return;
                                            }

                                            // Save to database
                                            const saveData = {
                                                courseId: course.id,
                                                requirementType: null, // No requirement type initially
                                                semester:
                                                    course.semester || "Fall",
                                                year:
                                                    course.year ||
                                                    new Date().getFullYear(),
                                                status: "planned",
                                            };

                                            const createResponse = await fetch(
                                                "/api/planner",
                                                {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                    },
                                                    body: JSON.stringify(
                                                        saveData
                                                    ),
                                                }
                                            );

                                            if (!createResponse.ok) {
                                                const errorText =
                                                    await createResponse.text();
                                                console.error(
                                                    "Error creating course plan:",
                                                    errorText
                                                );
                                                throw new Error(
                                                    `Failed to create course plan: ${errorText}`
                                                );
                                            }

                                            const newPlan =
                                                await createResponse.json();

                                            // Store the new plan ID
                                            setCoursePlanIds((prev) => ({
                                                ...prev,
                                                [course.id]: newPlan.id,
                                            }));

                                            toast({
                                                title: "Success",
                                                description:
                                                    "Course added to your plan",
                                                variant: "default",
                                            });
                                        } catch (error) {
                                            console.error(
                                                "Error saving course:",
                                                error
                                            );
                                            // Revert the UI state on error
                                            setSelectedCourses((prev) =>
                                                prev.filter(
                                                    (c) => c.id !== course.id
                                                )
                                            );
                                            toast({
                                                title: "Error",
                                                description:
                                                    error instanceof Error
                                                        ? error.message
                                                        : "Failed to save course to your plan",
                                                variant: "destructive",
                                            });
                                        }
                                    }}
                                    searchQuery={searchQuery}
                                    sampleCourses={isDemoMode ? sampleCourses : undefined}
                                />
                            </div>
                        </Card>
                        {/* Selected Courses List */}
                        <div ref={selectedCoursesRef}>
                            <SelectedCourses
                                selectedCourses={selectedCourses}
                                onRemoveCourse={handleRemoveCourse}
                                requirements={
                                    programRequirements[userProgram!]
                                        .requirements
                                }
                                onAddToRequirement={handleAddToRequirement}
                                coursePlan={coursePlan}
                                onCourseTaken={handleCourseTaken}
                                isDemoMode={isDemoMode}
                            />
                        </div>
                        <CourseSchedule
                            selectedCourses={selectedCourses.filter(
                                (course) => !course.taken
                            )}
                            isDemoMode={isDemoMode}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
