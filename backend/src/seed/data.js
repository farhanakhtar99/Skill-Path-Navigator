// data.js
// The seed dataset for the graph. Editing this file is the easiest way
// to add more skills, roles or courses without touching any query code.

// Every skill that can exist as a (:Skill) node.
const SKILLS = [
  "HTML", "CSS", "JavaScript", "TypeScript", "React", "Node.js",
  "Express.js", "REST APIs", "MongoDB", "SQL", "Git", "CI/CD",
  "Linux", "Docker", "Kubernetes", "AWS", "System Design",
  "Python", "Statistics", "Pandas", "NumPy", "Machine Learning",
  "GraphQL", "Redis",
];

// [prerequisite, unlocks] -> (:Skill)-[:PREREQUISITE_OF]->(:Skill)
// Read as "learn the first skill before the second becomes accessible".
const PREREQUISITES = [
  ["HTML", "CSS"],
  ["CSS", "JavaScript"],
  ["JavaScript", "TypeScript"],
  ["JavaScript", "React"],
  ["JavaScript", "Node.js"],
  ["Node.js", "Express.js"],
  ["Node.js", "GraphQL"],
  ["Express.js", "REST APIs"],
  ["Express.js", "Redis"],
  ["REST APIs", "MongoDB"],
  ["REST APIs", "SQL"],
  ["Git", "CI/CD"],
  ["CI/CD", "Docker"],
  ["Linux", "Docker"],
  ["Docker", "Kubernetes"],
  ["Docker", "AWS"],
  ["AWS", "System Design"],
  ["Python", "Statistics"],
  ["Statistics", "Pandas"],
  ["Pandas", "NumPy"],
  ["NumPy", "Machine Learning"],
  ["SQL", "Statistics"],
];

// name -> required skills. (:Role)-[:REQUIRES]->(:Skill)
const ROLES = {
  "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git"],
  "Backend Developer": ["JavaScript", "Node.js", "Express.js", "REST APIs", "MongoDB", "SQL", "Git"],
  "Full Stack Developer": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", "MongoDB", "REST APIs", "Git"],
  "DevOps Engineer": ["Linux", "Git", "CI/CD", "Docker", "Kubernetes", "AWS", "System Design"],
  "Data Analyst": ["Python", "SQL", "Statistics", "Pandas"],
  "Data Scientist": ["Python", "Statistics", "Pandas", "NumPy", "Machine Learning", "SQL"],
};

// name -> { provider, skills taught }. (:Course)-[:TEACHES]->(:Skill)
const COURSES = {
  "Frontend Web Development": { provider: "Apna College", skills: ["HTML", "CSS", "JavaScript", "React"] },
  "JavaScript & TypeScript Essentials": { provider: "Coding Spoon", skills: ["JavaScript", "TypeScript"] },
  "MERN Full Stack Development": { provider: "Coding Spoon", skills: ["Node.js", "Express.js", "MongoDB", "REST APIs", "React"] },
  "Git & CI/CD Fundamentals": { provider: "freeCodeCamp", skills: ["Git", "CI/CD"] },
  "Docker & Kubernetes Bootcamp": { provider: "KodeKloud", skills: ["Docker", "Kubernetes"] },
  "AWS Cloud Practitioner": { provider: "AWS Training", skills: ["AWS", "System Design"] },
  "Linux Fundamentals": { provider: "Linux Foundation", skills: ["Linux"] },
  "SQL for Developers": { provider: "Mode Analytics", skills: ["SQL"] },
  "Python for Data Analysis": { provider: "Apna College", skills: ["Python", "Pandas", "NumPy", "Statistics"] },
  "Machine Learning Foundations": { provider: "DeepLearning.AI", skills: ["Machine Learning", "Statistics"] },
  "GraphQL in Practice": { provider: "Egghead", skills: ["GraphQL"] },
};

module.exports = { SKILLS, PREREQUISITES, ROLES, COURSES };
