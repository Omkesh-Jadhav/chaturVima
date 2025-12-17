export interface ManualEmployee {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  location: string;
  avatar: string;
}

export interface ManualDepartment {
  id: string;
  name: string;
  summary: string;
  employees: ManualEmployee[];
}

// Re-export assessment types from centralized location
export { assessmentTypeOptions as manualAssessmentTypes } from "./assessmentDashboard";

export const manualDepartments: ManualDepartment[] = [
  {
    id: "dept-eng",
    name: "Engineering Ops",
    summary: "Platform reliability, automation, and tooling squads.",
    employees: [
      {
        id: "emp-rohan",
        name: "Rohan Patel",
        title: "Lead DevOps Engineer",
        department: "Engineering Ops",
        email: "rohan.patel@example.com",
        location: "Bengaluru • Hybrid",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
      },
      {
        id: "emp-isha",
        name: "Isha Menon",
        title: "Senior Platform Engineer",
        department: "Engineering Ops",
        email: "isha.menon@example.com",
        location: "Pune • Remote",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Isha",
      },
      {
        id: "emp-veer",
        name: "Veer Saxena",
        title: "Automation Specialist",
        department: "Engineering Ops",
        email: "veer.saxena@example.com",
        location: "Gurgaon • Hybrid",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Veer",
      },
      {
        id: "emp-ananya",
        name: "Ananya Krishnan",
        title: "Site Reliability Engineer",
        department: "Engineering Ops",
        email: "ananya.krishnan@example.com",
        location: "Hyderabad • On-site",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
      },
    ],
  },
  {
    id: "dept-fin",
    name: "Finance",
    summary: "Planning, controllership, and procurement pods.",
    employees: [
      {
        id: "emp-nikhil",
        name: "Nikhil Verma",
        title: "FP&A Manager",
        department: "Finance",
        email: "nikhil.verma@example.com",
        location: "Mumbai • On-site",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nikhil",
      },
      {
        id: "emp-shruti",
        name: "Shruti Rao",
        title: "Procurement Lead",
        department: "Finance",
        email: "shruti.rao@example.com",
        location: "Chennai • Hybrid",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shruti",
      },
      {
        id: "emp-david",
        name: "David Thomas",
        title: "Senior Controller",
        department: "Finance",
        email: "david.thomas@example.com",
        location: "Bengaluru • Hybrid",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      },
      {
        id: "emp-lucia",
        name: "Lucia Fernandes",
        title: "Treasury Analyst",
        department: "Finance",
        email: "lucia.fernandes@example.com",
        location: "Pune • Remote",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucia",
      },
    ],
  },
  {
    id: "dept-marketing",
    name: "Marketing",
    summary: "Brand, demand generation, and field enablement teams.",
    employees: [
      {
        id: "emp-aarav",
        name: "Aarav Kapoor",
        title: "Brand Strategist",
        department: "Marketing",
        email: "aarav.kapoor@example.com",
        location: "Delhi • Hybrid",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
      },
      {
        id: "emp-meera",
        name: "Meera Shah",
        title: "Field Marketing Manager",
        department: "Marketing",
        email: "meera.shah@example.com",
        location: "Mumbai • On-site",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
      },
      {
        id: "emp-ziya",
        name: "Ziya Khan",
        title: "Content Lead",
        department: "Marketing",
        email: "ziya.khan@example.com",
        location: "Remote • Global",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ziya",
      },
      {
        id: "emp-farhan",
        name: "Farhan Ali",
        title: "Growth Analyst",
        department: "Marketing",
        email: "farhan.ali@example.com",
        location: "Hyderabad • Hybrid",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Farhan",
      },
    ],
  },
];
