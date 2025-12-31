"""
AI-powered resume-job matching service using TF-IDF and Cosine Similarity
"""
import logging
from typing import Dict, List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from app.models.job import Job
from app.models.parsed_profile import ParsedProfile

logger = logging.getLogger(__name__)


class MatchingService:
    """Service for matching resumes to job postings"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=500,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1
        )
    
    def extract_job_requirements(self, job: Job) -> str:
        """Extract and combine job requirements into a single text"""
        requirements_text = " ".join(job.requirements) if job.requirements else ""
        description_text = job.description or ""
        
        # Combine requirements and description
        combined_text = f"{description_text} {requirements_text}".lower()
        
        return combined_text
    
    def extract_resume_text(self, parsed_profile: ParsedProfile, resume_text: str = "") -> str:
        """Extract and combine resume information into a single text"""
        text_parts = []
        
        # Add skills
        if parsed_profile.skills:
            text_parts.extend([skill.lower() for skill in parsed_profile.skills])
        
        # Add experience descriptions
        if parsed_profile.experience:
            for exp in parsed_profile.experience:
                if isinstance(exp, dict):
                    text_parts.append(exp.get("title", "").lower())
                    text_parts.append(exp.get("description", "").lower())
        
        # Add education
        if parsed_profile.education:
            for edu in parsed_profile.education:
                if isinstance(edu, dict):
                    text_parts.append(edu.get("degree", "").lower())
        
        # Add summary
        if parsed_profile.summary:
            text_parts.append(parsed_profile.summary.lower())
        
        # Add raw resume text if available
        if resume_text:
            text_parts.append(resume_text.lower())
        
        return " ".join(text_parts)
    
    def calculate_match_score(
        self,
        job: Job,
        parsed_profile: ParsedProfile,
        resume_text: str = ""
    ) -> Tuple[int, str, List[str]]:
        """
        Calculate match score between a job and a resume
        
        Returns:
            Tuple of (score: int, analysis: str, missing_skills: List[str])
        """
        try:
            # Extract texts
            job_text = self.extract_job_requirements(job)
            resume_text_combined = self.extract_resume_text(parsed_profile, resume_text)
            
            if not job_text or not resume_text_combined:
                return 0, "Insufficient data for matching", []
            
            # Vectorize texts
            texts = [job_text, resume_text_combined]
            try:
                tfidf_matrix = self.vectorizer.fit_transform(texts)
            except ValueError as e:
                logger.warning(f"Vectorization error: {e}. Using fallback method.")
                return self._calculate_fallback_score(job, parsed_profile)
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            # Convert similarity (0-1) to score (0-100)
            base_score = int(similarity * 100)
            
            # Extract required skills from job
            required_skills = self._extract_skills_from_text(job_text)
            candidate_skills = [skill.lower() for skill in parsed_profile.skills] if parsed_profile.skills else []
            
            # Calculate skill match bonus
            matched_skills = [skill for skill in required_skills if skill in candidate_skills]
            skill_match_ratio = len(matched_skills) / len(required_skills) if required_skills else 0
            
            # Adjust score based on skill match
            skill_bonus = int(skill_match_ratio * 20)  # Up to 20 points bonus
            final_score = min(100, base_score + skill_bonus)
            
            # Find missing skills
            missing_skills = [skill for skill in required_skills if skill not in candidate_skills]
            
            # Generate analysis
            analysis = self._generate_analysis(
                final_score,
                matched_skills,
                missing_skills,
                parsed_profile,
                job
            )
            
            return final_score, analysis, missing_skills[:10]  # Limit missing skills
            
        except Exception as e:
            logger.error(f"Error calculating match score: {str(e)}")
            return 0, f"Error calculating match: {str(e)}", []
    
    def _extract_skills_from_text(self, text: str) -> List[str]:
        """Extract skill keywords from text"""
        # Common technical skills
        skill_keywords = [
            "python", "javascript", "java", "react", "node.js", "sql", "aws",
            "docker", "kubernetes", "git", "agile", "scrum", "api", "rest",
            "typescript", "angular", "vue", "django", "flask", "fastapi",
            "postgresql", "mongodb", "redis", "machine learning", "data analysis"
        ]
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in skill_keywords:
            if skill in text_lower:
                found_skills.append(skill)
        
        return found_skills
    
    def _calculate_fallback_score(
        self,
        job: Job,
        parsed_profile: ParsedProfile
    ) -> Tuple[int, str, List[str]]:
        """Fallback scoring method when vectorization fails"""
        required_skills = self._extract_skills_from_text(
            self.extract_job_requirements(job)
        )
        candidate_skills = [skill.lower() for skill in parsed_profile.skills] if parsed_profile.skills else []
        
        matched_skills = [skill for skill in required_skills if skill in candidate_skills]
        score = int((len(matched_skills) / len(required_skills) * 100)) if required_skills else 50
        missing_skills = [skill for skill in required_skills if skill not in candidate_skills]
        
        analysis = f"Matched {len(matched_skills)} out of {len(required_skills)} required skills."
        
        return score, analysis, missing_skills
    
    def _generate_analysis(
        self,
        score: int,
        matched_skills: List[str],
        missing_skills: List[str],
        parsed_profile: ParsedProfile,
        job: Job
    ) -> str:
        """Generate human-readable analysis of the match"""
        analysis_parts = []
        
        # Score interpretation
        if score >= 80:
            analysis_parts.append("Excellent match! The candidate's profile strongly aligns with the job requirements.")
        elif score >= 60:
            analysis_parts.append("Good match. The candidate has relevant skills and experience.")
        elif score >= 40:
            analysis_parts.append("Moderate match. Some relevant experience but missing key requirements.")
        else:
            analysis_parts.append("Weak match. Significant gaps between candidate profile and job requirements.")
        
        # Skills analysis
        if matched_skills:
            analysis_parts.append(f"Matched skills: {', '.join(matched_skills[:5])}.")
        
        if missing_skills:
            analysis_parts.append(f"Missing skills: {', '.join(missing_skills[:5])}.")
        
        # Experience analysis
        if parsed_profile.experience:
            exp_count = len(parsed_profile.experience)
            analysis_parts.append(f"Candidate has {exp_count} previous position(s).")
        
        # Education analysis
        if parsed_profile.education:
            edu_count = len(parsed_profile.education)
            analysis_parts.append(f"Candidate has {edu_count} education qualification(s).")
        
        return " ".join(analysis_parts)
    
    def rank_candidates(
        self,
        job: Job,
        candidates: List[Tuple[ParsedProfile, str]]
    ) -> List[Tuple[ParsedProfile, int, str]]:
        """
        Rank multiple candidates for a job
        
        Args:
            job: Job posting
            candidates: List of (ParsedProfile, resume_text) tuples
        
        Returns:
            List of (ParsedProfile, score, analysis) tuples sorted by score (descending)
        """
        results = []
        
        for parsed_profile, resume_text in candidates:
            score, analysis, _ = self.calculate_match_score(job, parsed_profile, resume_text)
            results.append((parsed_profile, score, analysis))
        
        # Sort by score (descending)
        results.sort(key=lambda x: x[1], reverse=True)
        
        return results

