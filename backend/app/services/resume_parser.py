"""
Resume parsing service using NLP and PDF extraction
"""
import re
import logging
from typing import Dict, List, Any
import PyPDF2
from io import BytesIO

logger = logging.getLogger(__name__)


class ResumeParser:
    """Service for parsing resumes and extracting structured data"""
    
    # Common skill keywords
    SKILL_KEYWORDS = [
        # Programming Languages
        "python", "javascript", "java", "typescript", "c++", "c#", "go", "rust", "php", "ruby",
        "swift", "kotlin", "scala", "r", "matlab", "sql", "html", "css", "sass", "less",
        # Frameworks & Libraries
        "react", "vue", "angular", "node.js", "express", "django", "flask", "fastapi",
        "spring", "laravel", "rails", "asp.net", "next.js", "nuxt.js", "svelte",
        # Databases
        "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "cassandra", "dynamodb",
        # Cloud & DevOps
        "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "ci/cd", "terraform",
        "ansible", "git", "github", "gitlab", "linux", "bash", "shell scripting",
        # Data Science & ML
        "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
        "pandas", "numpy", "matplotlib", "seaborn", "jupyter", "data analysis",
        # Other
        "agile", "scrum", "rest api", "graphql", "microservices", "api development",
        "testing", "tdd", "bdd", "selenium", "cypress", "jest", "pytest"
    ]
    
    # Education keywords
    EDUCATION_KEYWORDS = [
        "bachelor", "master", "phd", "doctorate", "degree", "university", "college",
        "bsc", "msc", "mba", "ba", "ma", "bs", "ms", "ph.d", "diploma", "certificate"
    ]
    
    # Experience keywords
    EXPERIENCE_KEYWORDS = [
        "experience", "worked", "employed", "intern", "internship", "position",
        "role", "responsibilities", "achievements", "projects"
    ]
    
    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """Extract text from PDF file"""
        try:
            pdf_file = BytesIO(pdf_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume text"""
        text_lower = text.lower()
        found_skills = []
        
        # Check for skills section
        skills_section_pattern = r'(?:skills?|technical skills?|technologies?|proficiencies?)[:;]?\s*(.*?)(?:\n\n|\n[A-Z]|$)'
        skills_match = re.search(skills_section_pattern, text_lower, re.IGNORECASE | re.DOTALL)
        
        if skills_match:
            skills_text = skills_match.group(1)
            # Extract skills from the section
            for skill in self.SKILL_KEYWORDS:
                if skill in skills_text:
                    found_skills.append(skill.title())
        
        # Also check entire text for skill mentions
        for skill in self.SKILL_KEYWORDS:
            if skill in text_lower and skill.title() not in found_skills:
                # Check if it's a meaningful mention (not just part of another word)
                pattern = r'\b' + re.escape(skill) + r'\b'
                if re.search(pattern, text_lower, re.IGNORECASE):
                    found_skills.append(skill.title())
        
        return list(set(found_skills))  # Remove duplicates
    
    def extract_education(self, text: str) -> List[Dict[str, str]]:
        """Extract education information"""
        education = []
        text_lower = text.lower()
        
        # Look for education section
        education_pattern = r'(?:education|academic background|qualifications?)[:;]?\s*(.*?)(?:\n\n|\n(?:experience|work|projects)|$)'
        education_match = re.search(education_pattern, text_lower, re.IGNORECASE | re.DOTALL)
        
        if education_match:
            education_text = education_match.group(1)
            
            # Extract degree patterns
            degree_patterns = [
                r'(bachelor|b\.?s\.?c\.?|b\.?a\.?|b\.?e\.?)\s+(?:of\s+)?(?:science|arts|engineering|technology)?\s*(?:in\s+)?([^\n,]+)',
                r'(master|m\.?s\.?c\.?|m\.?a\.?|m\.?e\.?|m\.?b\.?a\.?)\s+(?:of\s+)?(?:science|arts|engineering|business|technology)?\s*(?:in\s+)?([^\n,]+)',
                r'(ph\.?d\.?|doctorate|ph\.?d)\s+(?:in\s+)?([^\n,]+)',
                r'(diploma|certificate)\s+(?:in\s+)?([^\n,]+)'
            ]
            
            for pattern in degree_patterns:
                matches = re.finditer(pattern, education_text, re.IGNORECASE)
                for match in matches:
                    degree = match.group(0).strip()
                    # Try to find institution and year
                    institution = self._extract_institution(education_text, match.start())
                    year = self._extract_year(education_text, match.start())
                    
                    education.append({
                        "degree": degree.title(),
                        "institution": institution,
                        "year": year
                    })
        
        return education
    
    def _extract_institution(self, text: str, position: int) -> str:
        """Extract institution name near a position"""
        # Look for common institution indicators
        context = text[max(0, position-100):position+200]
        institution_patterns = [
            r'university\s+of\s+([^\n,]+)',
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:university|college|institute|school)',
        ]
        
        for pattern in institution_patterns:
            match = re.search(pattern, context, re.IGNORECASE)
            if match:
                return match.group(0).strip()
        
        return "Not specified"
    
    def _extract_year(self, text: str, position: int) -> str:
        """Extract year near a position"""
        context = text[max(0, position-50):position+50]
        year_pattern = r'\b(19|20)\d{2}\b'
        match = re.search(year_pattern, context)
        if match:
            return match.group(0)
        return "Not specified"
    
    def extract_experience(self, text: str) -> List[Dict[str, str]]:
        """Extract work experience"""
        experience = []
        text_lower = text.lower()
        
        # Look for experience section
        experience_pattern = r'(?:experience|work experience|employment|professional experience)[:;]?\s*(.*?)(?:\n\n|\n(?:education|skills|projects)|$)'
        experience_match = re.search(experience_pattern, text_lower, re.IGNORECASE | re.DOTALL)
        
        if experience_match:
            experience_text = experience_match.group(1)
            
            # Pattern for job entries (title, company, duration)
            # Common formats:
            # - Title at Company (Duration)
            # - Company - Title (Duration)
            job_patterns = [
                r'([A-Z][^\n]+?)\s+(?:at|@)\s+([A-Z][^\n(]+?)\s*\(([^)]+)\)',
                r'([A-Z][^\n]+?)\s*[-–]\s*([A-Z][^\n(]+?)\s*\(([^)]+)\)',
                r'([A-Z][^\n]+?)\s+([A-Z][^\n]+?)\s+(\d{4}\s*[-–]\s*(?:present|\d{4}))',
            ]
            
            for pattern in job_patterns:
                matches = re.finditer(pattern, experience_text, re.MULTILINE)
                for match in matches:
                    if len(match.groups()) >= 3:
                        title = match.group(1).strip()
                        company = match.group(2).strip()
                        duration = match.group(3).strip()
                        
                        # Extract description (next few lines)
                        start_pos = match.end()
                        next_entry = re.search(r'[A-Z][^\n]+?\s+(?:at|@|[-–])\s+[A-Z]', experience_text[start_pos:start_pos+500])
                        if next_entry:
                            description = experience_text[start_pos:start_pos+next_entry.start()].strip()
                        else:
                            description = experience_text[start_pos:start_pos+200].strip()
                        
                        experience.append({
                            "title": title,
                            "company": company,
                            "duration": duration,
                            "description": description[:500]  # Limit description length
                        })
        
        return experience
    
    def extract_summary(self, text: str) -> str:
        """Extract summary/objective from resume"""
        summary_patterns = [
            r'(?:summary|objective|profile|about)[:;]?\s*(.*?)(?:\n\n|\n(?:experience|education|skills)|$)',
            r'^([^\n]{50,300})',  # First paragraph if no explicit summary
        ]
        
        for pattern in summary_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                summary = match.group(1).strip()
                if len(summary) > 50:  # Ensure meaningful summary
                    return summary[:500]  # Limit length
        
        return ""
    
    def parse_resume(self, resume_text: str) -> Dict[str, Any]:
        """Main method to parse resume and return structured data"""
        try:
            parsed_data = {
                "skills": self.extract_skills(resume_text),
                "experience": self.extract_experience(resume_text),
                "education": self.extract_education(resume_text),
                "summary": self.extract_summary(resume_text)
            }
            
            logger.info(f"Successfully parsed resume. Found {len(parsed_data['skills'])} skills, "
                       f"{len(parsed_data['experience'])} experiences, "
                       f"{len(parsed_data['education'])} education entries")
            
            return parsed_data
        except Exception as e:
            logger.error(f"Error parsing resume: {str(e)}")
            raise ValueError(f"Failed to parse resume: {str(e)}")

