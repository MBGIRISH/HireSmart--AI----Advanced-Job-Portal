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
        """Extract education information - balance between accuracy and completeness"""
        education = []
        text_lower = text.lower()
        original_text = text  # Keep original for better matching
        
        # Look for education section
        education_pattern = r'(?:education|academic background|qualifications?|academic qualifications?)[:;]?\s*(.*?)(?:\n\n|\n(?:experience|work experience|professional experience|projects?|skills?|technical skills?)|$)'
        education_match = re.search(education_pattern, text_lower, re.IGNORECASE | re.DOTALL)
        
        education_text = ""
        if education_match:
            education_text = education_match.group(1)
        else:
            # If no explicit section, search entire text but be more careful
            education_text = text
        
        # Flexible degree patterns - look for degree keywords followed by field and institution
        degree_patterns = [
            # B.E. / B.E in Computer Science / B.E Computer Science
            r'(b\.?e\.?|bachelor(?:\s+of)?\s+engineering)\s+(?:in\s+)?([^\n,]{0,50}?)(?:\s*[,\-]\s*|\s+)([A-Z][^\n,]{0,80}?(?:college|university|institute|school|univ|university))',
            # B.Sc / Bachelor of Science
            r'(b\.?s\.?c\.?|bachelor(?:\s+of)?\s+science)\s+(?:in\s+)?([^\n,]{0,50}?)(?:\s*[,\-]\s*|\s+)([A-Z][^\n,]{0,80}?(?:college|university|institute|school|univ|university))',
            # M.Sc / Master of Science
            r'(m\.?s\.?c\.?|master(?:\s+of)?\s+science)\s+(?:in\s+)?([^\n,]{0,50}?)(?:\s*[,\-]\s*|\s+)([A-Z][^\n,]{0,80}?(?:college|university|institute|school|univ|university))',
            # M.E / Master of Engineering
            r'(m\.?e\.?|master(?:\s+of)?\s+engineering)\s+(?:in\s+)?([^\n,]{0,50}?)(?:\s*[,\-]\s*|\s+)([A-Z][^\n,]{0,80}?(?:college|university|institute|school|univ|university))',
            # MBA
            r'(m\.?b\.?a\.?|master(?:\s+of)?\s+business\s+administration)\s+(?:in\s+)?([^\n,]{0,50}?)(?:\s*[,\-]\s*|\s+)([A-Z][^\n,]{0,80}?(?:college|university|institute|school|univ|university))',
            # PhD
            r'(ph\.?d\.?|doctorate|ph\.?d)\s+(?:in\s+)?([^\n,]{0,50}?)(?:\s*[,\-]\s*|\s+)([A-Z][^\n,]{0,80}?(?:college|university|institute|school|univ|university))',
        ]
        
        for pattern in degree_patterns:
            matches = re.finditer(pattern, education_text, re.IGNORECASE)
            for match in matches:
                groups = match.groups()
                if len(groups) >= 3:
                    degree_type = groups[0].strip()
                    field = groups[1].strip() if groups[1] else ""
                    institution = groups[2].strip()
                    
                    # Build degree name
                    if field:
                        degree = f"{degree_type} in {field}".strip()
                    else:
                        degree = degree_type
                    
                    # Skip if this looks like a project (has project-like keywords)
                    if any(proj_word in degree.lower() for proj_word in ['project', 'system', 'detection', 'forecasting', 'matching', 'anomaly', 'screening']):
                        continue
                    
                    year = self._extract_year(education_text, match.start())
                    
                    education.append({
                        "degree": degree.title(),
                        "institution": institution,
                        "year": year
                    })
        
        # Fallback: Simple pattern matching for common formats
        if not education:
            # Pattern: "B.E in Computer Science" or "B.E Computer Science" followed by institution
            simple_pattern = r'\b(b\.?e\.?|b\.?s\.?c\.?|m\.?s\.?c\.?|m\.?e\.?|m\.?b\.?a\.?|ph\.?d\.?|bachelor|master|doctorate)\b[^\n]{0,150}?(college|university|institute|school|univ)[^\n]{0,50}'
            matches = re.finditer(simple_pattern, text_lower, re.IGNORECASE)
            for match in matches:
                match_text = original_text[match.start():match.end()].strip()
                # Find where institution keyword starts
                inst_match = re.search(r'(college|university|institute|school|univ)', match_text, re.IGNORECASE)
                if inst_match:
                    degree = match_text[:inst_match.start()].strip()
                    institution = match_text[inst_match.start():].strip()
                    
                    # Skip projects
                    if not any(proj_word in degree.lower() for proj_word in ['project', 'system', 'detection', 'forecasting', 'matching', 'anomaly']):
                        year = self._extract_year(text, match.start())
                        education.append({
                            "degree": degree.title(),
                            "institution": institution[:100],
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
        """Extract work experience and projects"""
        experience = []
        text_lower = text.lower()
        original_text = text
        
        # Look for experience/projects section
        experience_pattern = r'(?:experience|work experience|employment|professional experience|projects?|project experience)[:;]?\s*(.*?)(?:\n\n|\n(?:education|academic|skills?|technical skills?|certifications?)|$)'
        experience_match = re.search(experience_pattern, text_lower, re.IGNORECASE | re.DOTALL)
        
        experience_text = ""
        if experience_match:
            experience_text = experience_match.group(1)
        else:
            # If no explicit section, try to find project/experience entries in the text
            experience_text = text
        
        # Split into lines for line-by-line parsing
        lines = experience_text.split('\n')
        current_entry = None
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            if not line_stripped or len(line_stripped) < 5:
                continue
            
            # Skip education lines
            if any(edu_word in line_stripped.lower() for edu_word in ['bachelor', 'master', 'phd', 'b.e', 'm.s', 'degree', 'university', 'college']):
                # But allow if it's clearly a project about education systems
                if not any(proj_word in line_stripped.lower() for proj_word in ['project', 'system', 'application']):
                    continue
            
            # Pattern 1: Title at Company (Duration)
            match1 = re.search(r'^([A-Z][^\n(]{5,80}?)\s+(?:at|@)\s+([A-Z][^\n(]{3,50}?)\s*\(([^)]+)\)', line_stripped, re.IGNORECASE)
            if match1:
                if current_entry:
                    experience.append(current_entry)
                current_entry = {
                    "title": match1.group(1).strip(),
                    "company": match1.group(2).strip(),
                    "duration": match1.group(3).strip(),
                    "description": ""
                }
                continue
            
            # Pattern 2: Project Title or Job Title (standalone, might be followed by description)
            if re.match(r'^[A-Z][^\n]{10,100}?$', line_stripped) and len(line_stripped.split()) >= 2:
                # Check if next lines have more info
                if i + 1 < len(lines) and lines[i + 1].strip():
                    # Might be a project or job title
                    if current_entry:
                        experience.append(current_entry)
                    current_entry = {
                        "title": line_stripped,
                        "company": "Not specified",
                        "duration": "Not specified",
                        "description": ""
                    }
                    # Collect description from next lines
                    desc_lines = []
                    for j in range(i + 1, min(i + 5, len(lines))):
                        next_line = lines[j].strip()
                        if not next_line or len(next_line) < 10:
                            break
                        # Stop if we hit another entry
                        if re.match(r'^[A-Z][^\n]{10,100}?$', next_line) and len(next_line.split()) >= 2:
                            break
                        desc_lines.append(next_line)
                    if desc_lines:
                        current_entry["description"] = ' '.join(desc_lines)[:500]
                    experience.append(current_entry)
                    current_entry = None
                continue
            
            # Pattern 3: Add to description if we have a current entry
            if current_entry and len(line_stripped) > 10:
                if not current_entry["description"]:
                    current_entry["description"] = line_stripped[:500]
                else:
                    current_entry["description"] += " " + line_stripped[:200]
                    if len(current_entry["description"]) > 500:
                        current_entry["description"] = current_entry["description"][:500]
        
        # Add last entry if exists
        if current_entry:
            experience.append(current_entry)
        
        # Fallback: Look for common project/job patterns in entire text
        if not experience:
            # Pattern: Lines that look like project titles (capitalized, multiple words, not education)
            project_pattern = r'^([A-Z][A-Za-z\s]{10,100}?)(?:\s*\(([^)]+)\))?$'
            for line in lines:
                line_stripped = line.strip()
                match = re.match(project_pattern, line_stripped)
                if match and len(line_stripped.split()) >= 2:
                    title = match.group(1).strip()
                    # Skip education
                    if any(edu_word in title.lower() for edu_word in ['bachelor', 'master', 'phd', 'b.e', 'degree']):
                        continue
                    # Skip if too short or looks like a header
                    if len(title) < 10 or title.isupper():
                        continue
                    
                    duration = match.group(2).strip() if match.group(2) else "Not specified"
                    experience.append({
                        "title": title,
                        "company": "Not specified",
                        "duration": duration,
                        "description": ""
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

