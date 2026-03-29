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

export interface Requirement {
  credits: number;
  description: string;
  courses?: Course[];
  categories?: {
    [key: string]: string[];
  };
}

export interface ProgramRequirement {
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

export interface ProgramRequirements {
  [key: string]: ProgramRequirement;
}

export interface CreditTransfer {
  id: string;
  fromCategory: string;
  toCategory: string;
  amount: number;
}
