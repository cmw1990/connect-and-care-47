import { supabase } from '@/lib/supabase/client';
import { Tables } from '@/types/database.types';
import { analyticsService } from './analytics.service';
import { fileService } from './file.service';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'audio' | 'document' | 'link';
  category: 'mental_health' | 'physical_health' | 'nutrition' | 'exercise' | 'stress_management' | 'care_guides';
  tags: string[];
  url?: string;
  fileId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  modules: CourseModule[];
  prerequisites?: string[];
  certification?: boolean;
  status: 'draft' | 'published' | 'archived';
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  content: string;
  resources: string[]; // Resource IDs
  quiz?: Quiz;
  duration: number; // in minutes
  order: number;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
  passingScore: number;
  attempts: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'open_ended';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface Progress {
  userId: string;
  courseId: string;
  moduleId: string;
  completed: boolean;
  score?: number;
  lastAccessed: string;
  certificateUrl?: string;
}

class WellnessService {
  async createResource(resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource> {
    const { data, error } = await supabase
      .from('resources')
      .insert({
        title: resource.title,
        description: resource.description,
        type: resource.type,
        category: resource.category,
        tags: resource.tags,
        url: resource.url,
        file_id: resource.fileId,
        metadata: resource.metadata,
      })
      .select()
      .single();

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'wellness',
      action: 'create_resource',
      label: resource.category,
    });

    return data;
  }

  async getResources(params: {
    category?: Resource['category'];
    type?: Resource['type'];
    tags?: string[];
    search?: string;
  }): Promise<Resource[]> {
    let query = supabase
      .from('resources')
      .select('*');

    if (params.category) {
      query = query.eq('category', params.category);
    }

    if (params.type) {
      query = query.eq('type', params.type);
    }

    if (params.tags && params.tags.length > 0) {
      query = query.contains('tags', params.tags);
    }

    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createCourse(course: Omit<Course, 'id'>): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        modules: course.modules,
        prerequisites: course.prerequisites,
        certification: course.certification,
        status: course.status,
      })
      .select()
      .single();

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'wellness',
      action: 'create_course',
      label: course.category,
    });

    return data;
  }

  async getCourses(params: {
    category?: string;
    level?: Course['level'];
    status?: Course['status'];
    search?: string;
  }): Promise<Course[]> {
    let query = supabase
      .from('courses')
      .select('*');

    if (params.category) {
      query = query.eq('category', params.category);
    }

    if (params.level) {
      query = query.eq('level', params.level);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    const { data, error } = await query.order('title', { ascending: true });

    if (error) throw error;
    return data;
  }

  async enrollUser(userId: string, courseId: string): Promise<void> {
    const { error } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        status: 'in_progress',
        enrolled_at: new Date().toISOString(),
      });

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'wellness',
      action: 'enroll_course',
      label: courseId,
      metadata: { userId },
    });
  }

  async updateProgress(progress: Progress): Promise<void> {
    const { error } = await supabase
      .from('course_progress')
      .upsert({
        user_id: progress.userId,
        course_id: progress.courseId,
        module_id: progress.moduleId,
        completed: progress.completed,
        score: progress.score,
        last_accessed: progress.lastAccessed,
        certificate_url: progress.certificateUrl,
      });

    if (error) throw error;

    if (progress.completed) {
      analyticsService.trackEvent({
        category: 'wellness',
        action: 'complete_module',
        label: progress.moduleId,
        metadata: { userId: progress.userId, courseId: progress.courseId },
      });
    }
  }

  async getUserProgress(userId: string, courseId: string): Promise<Progress[]> {
    const { data, error } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .order('last_accessed', { ascending: false });

    if (error) throw error;
    return data;
  }

  async submitQuiz(userId: string, courseId: string, moduleId: string, answers: Record<string, string | string[]>): Promise<{
    score: number;
    passed: boolean;
    feedback: Record<string, string>;
  }> {
    // Get quiz questions
    const { data: module } = await supabase
      .from('courses')
      .select('modules')
      .eq('id', courseId)
      .single();

    const quiz = module.modules.find((m: CourseModule) => m.id === moduleId)?.quiz;
    if (!quiz) throw new Error('Quiz not found');

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    const feedback: Record<string, string> = {};

    for (const question of quiz.questions) {
      const userAnswer = answers[question.id];
      totalPoints += question.points;

      if (Array.isArray(question.correctAnswer)) {
        // Multiple correct answers
        if (Array.isArray(userAnswer) && 
            question.correctAnswer.length === userAnswer.length && 
            question.correctAnswer.every(a => userAnswer.includes(a))) {
          earnedPoints += question.points;
          feedback[question.id] = 'Correct!';
        } else {
          feedback[question.id] = question.explanation || 'Incorrect';
        }
      } else {
        // Single correct answer
        if (userAnswer === question.correctAnswer) {
          earnedPoints += question.points;
          feedback[question.id] = 'Correct!';
        } else {
          feedback[question.id] = question.explanation || 'Incorrect';
        }
      }
    }

    const score = (earnedPoints / totalPoints) * 100;
    const passed = score >= quiz.passingScore;

    // Record quiz attempt
    await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        course_id: courseId,
        module_id: moduleId,
        score,
        passed,
        answers,
        feedback,
      });

    // Update progress if passed
    if (passed) {
      await this.updateProgress({
        userId,
        courseId,
        moduleId,
        completed: true,
        score,
        lastAccessed: new Date().toISOString(),
      });

      // Generate certificate if course completed
      await this.checkCourseCompletion(userId, courseId);
    }

    analyticsService.trackEvent({
      category: 'wellness',
      action: 'submit_quiz',
      label: moduleId,
      metadata: { userId, courseId, score, passed },
    });

    return { score, passed, feedback };
  }

  private async checkCourseCompletion(userId: string, courseId: string): Promise<void> {
    const [courseData, progressData] = await Promise.all([
      supabase.from('courses').select('*').eq('id', courseId).single(),
      this.getUserProgress(userId, courseId),
    ]);

    const course = courseData.data;
    const completedModules = progressData.filter(p => p.completed);

    if (completedModules.length === course.modules.length && course.certification) {
      const certificateUrl = await this.generateCertificate(userId, courseId);
      
      await this.updateProgress({
        userId,
        courseId,
        moduleId: course.modules[course.modules.length - 1].id,
        completed: true,
        lastAccessed: new Date().toISOString(),
        certificateUrl,
      });

      analyticsService.trackEvent({
        category: 'wellness',
        action: 'complete_course',
        label: courseId,
        metadata: { userId },
      });
    }
  }

  private async generateCertificate(userId: string, courseId: string): Promise<string> {
    // Generate certificate PDF
    // This is a placeholder - implement actual certificate generation
    const certificate = {
      userId,
      courseId,
      completionDate: new Date().toISOString(),
      // Add more certificate data
    };

    // Upload certificate to storage
    const blob = new Blob([JSON.stringify(certificate)], { type: 'application/pdf' });
    const file = new File([blob], `certificate_${userId}_${courseId}.pdf`, { type: 'application/pdf' });

    const fileMetadata = await fileService.uploadFile(file, 'document', {
      purpose: 'certificate',
      userId,
      courseId,
    });

    return fileMetadata.url!;
  }
}

export const wellnessService = new WellnessService();
