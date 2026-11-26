/**
 * Supabase Database TypeScript Definitions (Phase 02 — Complete Relational Architecture)
 * Represents the PostgreSQL schema managed via Supabase CLI migrations.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ------------------------------------------------------------------------------
// ENUMS
// ------------------------------------------------------------------------------
export type UserRole = "student" | "counsellor" | "admin" | "super_admin";

export type AccountStatus = "active" | "suspended" | "pending_verification" | "deactivated";

export type CollegePublicationStatus = "draft" | "published" | "archived";

export type AdmissionStatus = "open" | "closing_soon" | "closed" | "upcoming";

export type CourseStatus = "active" | "inactive" | "archived";

export type DurationUnit = "years" | "months" | "semesters";

export type LeadStatus =
  | "new"
  | "contacted"
  | "interested"
  | "counselling_scheduled"
  | "application_started"
  | "application_submitted"
  | "admitted"
  | "not_interested"
  | "lost";

export type LeadPriority = "low" | "medium" | "high" | "urgent";

export type AssignmentStatus = "active" | "reassigned" | "completed";

export type FollowUpStatus = "pending" | "completed" | "cancelled" | "rescheduled";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "documents_required"
  | "verified"
  | "forwarded"
  | "accepted"
  | "rejected"
  | "waitlisted"
  | "withdrawn";

export type DocumentVerificationStatus = "pending" | "verified" | "rejected";

export type AdmissionOutcome = "admitted" | "rejected" | "waitlisted" | "withdrawn";

// ------------------------------------------------------------------------------
// DATABASE DEFINITION
// ------------------------------------------------------------------------------
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          alternate_phone: string | null;
          date_of_birth: string | null;
          gender: string | null;
          country: string;
          pin_code: string | null;
          avatar_url: string | null;
          role: UserRole;
          account_status: AccountStatus;
          city: string | null;
          state: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          alternate_phone?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          country?: string;
          pin_code?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          account_status?: AccountStatus;
          city?: string | null;
          state?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          alternate_phone?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          country?: string;
          pin_code?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          account_status?: AccountStatus;
          city?: string | null;
          state?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
            referencedSchema: "auth";
          }
        ];
      };

      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: UserRole;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      colleges: {
        Row: {
          id: string;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          college_type: string | null;
          ownership_type: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          website_url: string | null;
          email: string | null;
          phone: string | null;
          country: string;
          state: string;
          city: string;
          address: string | null;
          pincode: string | null;
          established_year: number | null;
          accreditation: string | null;
          affiliation: string | null;
          ranking_information: Json;
          average_placement: number | null;
          highest_placement: number | null;
          placement_percentage: number | null;
          admission_status: AdmissionStatus;
          publication_status: CollegePublicationStatus;
          is_featured: boolean;
          seo_title: string | null;
          seo_description: string | null;
          gallery_images: string[];
          facilities: string[];
          highlights: string[];
          latitude: number | null;
          longitude: number | null;
          alternate_phone: string | null;
          admission_contact: string | null;
          admission_email: string | null;
          admission_process: string | null;
          eligibility_overview: string | null;
          entrance_exams: string | null;
          admission_start_date: string | null;
          admission_end_date: string | null;
          accreditation_body: string | null;
          accreditation_grade: string | null;
          naac_grade: string | null;
          nirf_rank: number | null;
          other_rankings: string | null;
          recognition_details: string | null;
          canonical_url: string | null;
          og_image_url: string | null;
          no_index: boolean;
          published_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          short_description?: string | null;
          description?: string | null;
          college_type?: string | null;
          ownership_type?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          website_url?: string | null;
          email?: string | null;
          phone?: string | null;
          country?: string;
          state: string;
          city: string;
          address?: string | null;
          pincode?: string | null;
          established_year?: number | null;
          accreditation?: string | null;
          affiliation?: string | null;
          ranking_information?: Json;
          average_placement?: number | null;
          highest_placement?: number | null;
          placement_percentage?: number | null;
          admission_status?: AdmissionStatus;
          publication_status?: CollegePublicationStatus;
          is_featured?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          gallery_images?: string[];
          facilities?: string[];
          highlights?: string[];
          latitude?: number | null;
          longitude?: number | null;
          alternate_phone?: string | null;
          admission_contact?: string | null;
          admission_email?: string | null;
          admission_process?: string | null;
          eligibility_overview?: string | null;
          entrance_exams?: string | null;
          admission_start_date?: string | null;
          admission_end_date?: string | null;
          accreditation_body?: string | null;
          accreditation_grade?: string | null;
          naac_grade?: string | null;
          nirf_rank?: number | null;
          other_rankings?: string | null;
          recognition_details?: string | null;
          canonical_url?: string | null;
          og_image_url?: string | null;
          no_index?: boolean;
          published_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          short_description?: string | null;
          description?: string | null;
          college_type?: string | null;
          ownership_type?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          website_url?: string | null;
          email?: string | null;
          phone?: string | null;
          country?: string;
          state?: string;
          city?: string;
          address?: string | null;
          pincode?: string | null;
          established_year?: number | null;
          accreditation?: string | null;
          affiliation?: string | null;
          ranking_information?: Json;
          average_placement?: number | null;
          highest_placement?: number | null;
          placement_percentage?: number | null;
          admission_status?: AdmissionStatus;
          publication_status?: CollegePublicationStatus;
          is_featured?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          gallery_images?: string[];
          facilities?: string[];
          highlights?: string[];
          latitude?: number | null;
          longitude?: number | null;
          alternate_phone?: string | null;
          admission_contact?: string | null;
          admission_email?: string | null;
          admission_process?: string | null;
          eligibility_overview?: string | null;
          entrance_exams?: string | null;
          admission_start_date?: string | null;
          admission_end_date?: string | null;
          accreditation_body?: string | null;
          accreditation_grade?: string | null;
          naac_grade?: string | null;
          nirf_rank?: number | null;
          other_rankings?: string | null;
          recognition_details?: string | null;
          canonical_url?: string | null;
          og_image_url?: string | null;
          no_index?: boolean;
          published_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "colleges_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          },
          {
            foreignKeyName: "colleges_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      college_campuses: {
        Row: {
          id: string;
          college_id: string;
          campus_name: string;
          country: string;
          state: string;
          city: string;
          address: string | null;
          pincode: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          college_id: string;
          campus_name: string;
          country?: string;
          state: string;
          city: string;
          address?: string | null;
          pincode?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          college_id?: string;
          campus_name?: string;
          country?: string;
          state?: string;
          city?: string;
          address?: string | null;
          pincode?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "college_campuses_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "colleges";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      courses: {
        Row: {
          id: string;
          name: string;
          slug: string;
          degree_type: string;
          stream: string;
          duration: number;
          duration_unit: DurationUnit;
          description: string | null;
          eligibility: string | null;
          entrance_exam_information: string | null;
          status: CourseStatus;
          category: string;
          code: string | null;
          specialization: string | null;
          short_description: string | null;
          study_mode: string;
          level: string;
          intake: number | null;
          language: string;
          min_qualification: string | null;
          min_percentage: number | null;
          required_subjects: string | null;
          age_criteria: string | null;
          additional_requirements: string | null;
          thumbnail_url: string | null;
          banner_url: string | null;
          gallery_images: Json;
          seo_title: string | null;
          seo_description: string | null;
          og_image_url: string | null;
          no_index: boolean;
          publication_status: string;
          is_featured: boolean;
          published_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          degree_type: string;
          stream: string;
          duration: number;
          duration_unit?: DurationUnit;
          description?: string | null;
          eligibility?: string | null;
          entrance_exam_information?: string | null;
          status?: CourseStatus;
          category?: string;
          code?: string | null;
          specialization?: string | null;
          short_description?: string | null;
          study_mode?: string;
          level?: string;
          intake?: number | null;
          language?: string;
          min_qualification?: string | null;
          min_percentage?: number | null;
          required_subjects?: string | null;
          age_criteria?: string | null;
          additional_requirements?: string | null;
          thumbnail_url?: string | null;
          banner_url?: string | null;
          gallery_images?: Json;
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          no_index?: boolean;
          publication_status?: string;
          is_featured?: boolean;
          published_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          degree_type?: string;
          stream?: string;
          duration?: number;
          duration_unit?: DurationUnit;
          description?: string | null;
          eligibility?: string | null;
          entrance_exam_information?: string | null;
          status?: CourseStatus;
          category?: string;
          code?: string | null;
          specialization?: string | null;
          short_description?: string | null;
          study_mode?: string;
          level?: string;
          intake?: number | null;
          language?: string;
          min_qualification?: string | null;
          min_percentage?: number | null;
          required_subjects?: string | null;
          age_criteria?: string | null;
          additional_requirements?: string | null;
          thumbnail_url?: string | null;
          banner_url?: string | null;
          gallery_images?: Json;
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          no_index?: boolean;
          publication_status?: string;
          is_featured?: boolean;
          published_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      college_courses: {
        Row: {
          id: string;
          college_id: string;
          course_id: string;
          course_code: string | null;
          intake_capacity: number | null;
          admission_status: AdmissionStatus;
          eligibility_override: string | null;
          course_name_override: string | null;
          is_active: boolean;
          fee_notes_override: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          college_id: string;
          course_id: string;
          course_code?: string | null;
          intake_capacity?: number | null;
          admission_status?: AdmissionStatus;
          eligibility_override?: string | null;
          course_name_override?: string | null;
          is_active?: boolean;
          fee_notes_override?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          college_id?: string;
          course_id?: string;
          course_code?: string | null;
          intake_capacity?: number | null;
          admission_status?: AdmissionStatus;
          eligibility_override?: string | null;
          course_name_override?: string | null;
          is_active?: boolean;
          fee_notes_override?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "college_courses_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "colleges";
            referencedColumns: ["id"];
            referencedSchema: "public";
          },
          {
            foreignKeyName: "college_courses_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      college_fees: {
        Row: {
          id: string;
          college_course_id: string;
          academic_year: string;
          tuition_fee: number;
          admission_fee: number;
          hostel_fee: number;
          other_fees: number;
          currency: string;
          fee_notes: string | null;
          fee_type: string;
          payment_frequency: string;
          student_category: string;
          amount: number;
          effective_date: string | null;
          expiry_date: string | null;
          status: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          college_course_id: string;
          academic_year: string;
          tuition_fee?: number;
          admission_fee?: number;
          hostel_fee?: number;
          other_fees?: number;
          currency?: string;
          fee_notes?: string | null;
          fee_type?: string;
          payment_frequency?: string;
          student_category?: string;
          amount?: number;
          effective_date?: string | null;
          expiry_date?: string | null;
          status?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          college_course_id?: string;
          academic_year?: string;
          tuition_fee?: number;
          admission_fee?: number;
          hostel_fee?: number;
          other_fees?: number;
          currency?: string;
          fee_notes?: string | null;
          fee_type?: string;
          payment_frequency?: string;
          student_category?: string;
          amount?: number;
          effective_date?: string | null;
          expiry_date?: string | null;
          status?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "college_fees_college_course_id_fkey";
            columns: ["college_course_id"];
            isOneToOne: false;
            referencedRelation: "college_courses";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      scholarships: {
        Row: {
          id: string;
          college_id: string | null;
          college_course_id: string | null;
          name: string;
          description: string | null;
          eligibility: string | null;
          scholarship_amount: number;
          currency: string;
          application_deadline: string | null;
          status: string;
          slug: string | null;
          provider: string | null;
          category: string;
          min_percentage: number | null;
          scholarship_percentage: number | null;
          max_benefit: number | null;
          application_start_date: string | null;
          application_instructions: string | null;
          official_url: string | null;
          required_documents: Json;
          contact_info: string | null;
          publication_status: string;
          is_featured: boolean;
          published_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          college_id?: string | null;
          college_course_id?: string | null;
          name: string;
          description?: string | null;
          eligibility?: string | null;
          scholarship_amount?: number;
          currency?: string;
          application_deadline?: string | null;
          status?: string;
          slug?: string | null;
          provider?: string | null;
          category?: string;
          min_percentage?: number | null;
          scholarship_percentage?: number | null;
          max_benefit?: number | null;
          application_start_date?: string | null;
          application_instructions?: string | null;
          official_url?: string | null;
          required_documents?: Json;
          contact_info?: string | null;
          publication_status?: string;
          is_featured?: boolean;
          published_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          college_id?: string | null;
          college_course_id?: string | null;
          name?: string;
          description?: string | null;
          eligibility?: string | null;
          scholarship_amount?: number;
          currency?: string;
          application_deadline?: string | null;
          status?: string;
          slug?: string | null;
          provider?: string | null;
          category?: string;
          min_percentage?: number | null;
          scholarship_percentage?: number | null;
          max_benefit?: number | null;
          application_start_date?: string | null;
          application_instructions?: string | null;
          official_url?: string | null;
          required_documents?: Json;
          contact_info?: string | null;
          publication_status?: string;
          is_featured?: boolean;
          published_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scholarships_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "colleges";
            referencedColumns: ["id"];
            referencedSchema: "public";
          },
          {
            foreignKeyName: "scholarships_college_course_id_fkey";
            columns: ["college_course_id"];
            isOneToOne: false;
            referencedRelation: "college_courses";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      leads: {
        Row: {
          id: string;
          student_user_id: string | null;
          full_name: string;
          email: string;
          phone: string;
          interested_college_id: string | null;
          interested_course_id: string | null;
          source: string;
          status: LeadStatus;
          priority: LeadPriority;
          assigned_counsellor_id: string | null;
          enquiry_message: string | null;
          consent_status: boolean;
          preferred_location: string | null;
          current_qualification: string | null;
          passing_year: number | null;
          landing_page: string | null;
          referring_page: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_params: Json;
          lost_reason: string | null;
          status_reason: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          student_user_id?: string | null;
          full_name: string;
          email: string;
          phone: string;
          interested_college_id?: string | null;
          interested_course_id?: string | null;
          source?: string;
          status?: LeadStatus;
          priority?: LeadPriority;
          assigned_counsellor_id?: string | null;
          enquiry_message?: string | null;
          consent_status?: boolean;
          preferred_location?: string | null;
          current_qualification?: string | null;
          passing_year?: number | null;
          landing_page?: string | null;
          referring_page?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_params?: Json;
          lost_reason?: string | null;
          status_reason?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
        };
        Update: {
          id?: string;
          student_user_id?: string | null;
          full_name?: string;
          email?: string;
          phone?: string;
          interested_college_id?: string | null;
          interested_course_id?: string | null;
          source?: string;
          status?: LeadStatus;
          priority?: LeadPriority;
          assigned_counsellor_id?: string | null;
          enquiry_message?: string | null;
          consent_status?: boolean;
          preferred_location?: string | null;
          current_qualification?: string | null;
          passing_year?: number | null;
          landing_page?: string | null;
          referring_page?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_params?: Json;
          lost_reason?: string | null;
          status_reason?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leads_student_user_id_fkey";
            columns: ["student_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          },
          {
            foreignKeyName: "leads_interested_college_id_fkey";
            columns: ["interested_college_id"];
            isOneToOne: false;
            referencedRelation: "colleges";
            referencedColumns: ["id"];
            referencedSchema: "public";
          },
          {
            foreignKeyName: "leads_interested_course_id_fkey";
            columns: ["interested_course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
            referencedSchema: "public";
          },
          {
            foreignKeyName: "leads_assigned_counsellor_id_fkey";
            columns: ["assigned_counsellor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      lead_assignments: {
        Row: {
          id: string;
          lead_id: string;
          counsellor_id: string;
          assigned_by: string | null;
          assigned_at: string;
          assignment_status: AssignmentStatus;
          unassigned_at: string | null;
        };
        Insert: {
          id?: string;
          lead_id: string;
          counsellor_id: string;
          assigned_by?: string | null;
          assigned_at?: string;
          assignment_status?: AssignmentStatus;
          unassigned_at?: string | null;
        };
        Update: {
          id?: string;
          lead_id?: string;
          counsellor_id?: string;
          assigned_by?: string | null;
          assigned_at?: string;
          assignment_status?: AssignmentStatus;
          unassigned_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lead_assignments_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
            referencedSchema: "public";
          },
          {
            foreignKeyName: "lead_assignments_counsellor_id_fkey";
            columns: ["counsellor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      lead_activities: {
        Row: {
          id: string;
          lead_id: string;
          actor_id: string | null;
          activity_type: string;
          description: string;
          old_status: LeadStatus | null;
          new_status: LeadStatus | null;
          metadata: Json;
          is_internal: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          actor_id?: string | null;
          activity_type: string;
          description: string;
          old_status?: LeadStatus | null;
          new_status?: LeadStatus | null;
          metadata?: Json;
          is_internal?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          actor_id?: string | null;
          activity_type?: string;
          description?: string;
          old_status?: LeadStatus | null;
          new_status?: LeadStatus | null;
          metadata?: Json;
          is_internal?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      follow_ups: {
        Row: {
          id: string;
          lead_id: string;
          counsellor_id: string;
          scheduled_at: string;
          follow_up_type: string;
          title: string | null;
          notes: string | null;
          completion_notes: string | null;
          priority: LeadPriority;
          status: FollowUpStatus;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          counsellor_id: string;
          scheduled_at: string;
          follow_up_type: string;
          title?: string | null;
          notes?: string | null;
          completion_notes?: string | null;
          priority?: LeadPriority;
          status?: FollowUpStatus;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          counsellor_id?: string;
          scheduled_at?: string;
          follow_up_type?: string;
          title?: string | null;
          notes?: string | null;
          completion_notes?: string | null;
          priority?: LeadPriority;
          status?: FollowUpStatus;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follow_ups_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
            referencedSchema: "public";
          },
          {
            foreignKeyName: "follow_ups_counsellor_id_fkey";
            columns: ["counsellor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      student_academics: {
        Row: {
          id: string;
          student_id: string;
          education_level: string;
          highest_qualification: string | null;
          institution_name: string | null;
          board_or_university: string | null;
          passing_year: number | null;
          percentage_or_cgpa: number | null;
          stream: string | null;
          entrance_exam_name: string | null;
          entrance_exam_score: string | null;
          additional_details: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          education_level?: string;
          highest_qualification?: string | null;
          institution_name?: string | null;
          board_or_university?: string | null;
          passing_year?: number | null;
          percentage_or_cgpa?: number | null;
          stream?: string | null;
          entrance_exam_name?: string | null;
          entrance_exam_score?: string | null;
          additional_details?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          education_level?: string;
          highest_qualification?: string | null;
          institution_name?: string | null;
          board_or_university?: string | null;
          passing_year?: number | null;
          percentage_or_cgpa?: number | null;
          stream?: string | null;
          entrance_exam_name?: string | null;
          entrance_exam_score?: string | null;
          additional_details?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_academics_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      student_preferences: {
        Row: {
          id: string;
          student_id: string;
          preferred_study_level: string | null;
          preferred_stream: string | null;
          preferred_course_id: string | null;
          preferred_specialization: string | null;
          preferred_college_type: string | null;
          preferred_study_mode: string | null;
          preferred_state: string | null;
          preferred_city: string | null;
          budget_min: number | null;
          budget_max: number | null;
          preferred_admission_year: number | null;
          entrance_exam_preference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          preferred_study_level?: string | null;
          preferred_stream?: string | null;
          preferred_course_id?: string | null;
          preferred_specialization?: string | null;
          preferred_college_type?: string | null;
          preferred_study_mode?: string | null;
          preferred_state?: string | null;
          preferred_city?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          preferred_admission_year?: number | null;
          entrance_exam_preference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          preferred_study_level?: string | null;
          preferred_stream?: string | null;
          preferred_course_id?: string | null;
          preferred_specialization?: string | null;
          preferred_college_type?: string | null;
          preferred_study_mode?: string | null;
          preferred_state?: string | null;
          preferred_city?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          preferred_admission_year?: number | null;
          entrance_exam_preference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_preferences_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      student_shortlists: {
        Row: {
          id: string;
          student_id: string;
          college_id: string | null;
          course_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          college_id?: string | null;
          course_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          college_id?: string | null;
          course_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_shortlists_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          },
          {
            foreignKeyName: "student_shortlists_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "colleges";
            referencedColumns: ["id"];
            referencedSchema: "public";
          },
          {
            foreignKeyName: "student_shortlists_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      applications: {
        Row: {
          id: string;
          application_number: string;
          student_id: string;
          college_id: string;
          college_course_id: string;
          assigned_counsellor_id: string | null;
          application_status: ApplicationStatus;
          submitted_at: string | null;
          reviewed_at: string | null;
          personal_details: Record<string, any> | null;
          academic_details: Record<string, any> | null;
          additional_info: Record<string, any> | null;
          academic_year: string | null;
          review_notes: string | null;
          decision_reason: string | null;
          forwarded_to: string | null;
          forwarded_at: string | null;
          decision_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_number: string;
          student_id: string;
          college_id: string;
          college_course_id: string;
          assigned_counsellor_id?: string | null;
          application_status?: ApplicationStatus;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          personal_details?: Record<string, any> | null;
          academic_details?: Record<string, any> | null;
          additional_info?: Record<string, any> | null;
          academic_year?: string | null;
          review_notes?: string | null;
          decision_reason?: string | null;
          forwarded_to?: string | null;
          forwarded_at?: string | null;
          decision_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_number?: string;
          student_id?: string;
          college_id?: string;
          college_course_id?: string;
          assigned_counsellor_id?: string | null;
          application_status?: ApplicationStatus;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          personal_details?: Record<string, any> | null;
          academic_details?: Record<string, any> | null;
          additional_info?: Record<string, any> | null;
          academic_year?: string | null;
          review_notes?: string | null;
          decision_reason?: string | null;
          forwarded_to?: string | null;
          forwarded_at?: string | null;
          decision_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          },
          {
            foreignKeyName: "applications_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "colleges";
            referencedColumns: ["id"];
            referencedSchema: "public";
          },
          {
            foreignKeyName: "applications_college_course_id_fkey";
            columns: ["college_course_id"];
            isOneToOne: false;
            referencedRelation: "college_courses";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      application_documents: {
        Row: {
          id: string;
          application_id: string;
          document_type: string;
          storage_path: string;
          original_filename: string;
          verification_status: DocumentVerificationStatus;
          verified_by: string | null;
          rejection_reason: string | null;
          file_size_bytes: number | null;
          mime_type: string | null;
          uploaded_at: string;
          verified_at: string | null;
        };
        Insert: {
          id?: string;
          application_id: string;
          document_type: string;
          storage_path: string;
          original_filename: string;
          verification_status?: DocumentVerificationStatus;
          verified_by?: string | null;
          rejection_reason?: string | null;
          file_size_bytes?: number | null;
          mime_type?: string | null;
          uploaded_at?: string;
          verified_at?: string | null;
        };
        Update: {
          id?: string;
          application_id?: string;
          document_type?: string;
          storage_path?: string;
          original_filename?: string;
          verification_status?: DocumentVerificationStatus;
          verified_by?: string | null;
          rejection_reason?: string | null;
          file_size_bytes?: number | null;
          mime_type?: string | null;
          uploaded_at?: string;
          verified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      admissions: {
        Row: {
          id: string;
          application_id: string;
          student_id: string;
          college_id: string;
          course_id: string;
          admission_status: AdmissionOutcome;
          admission_date: string;
          academic_year: string;
          admission_reference: string;
          admitted_by: string | null;
          remarks: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          student_id: string;
          college_id: string;
          course_id: string;
          admission_status?: AdmissionOutcome;
          admission_date?: string;
          academic_year: string;
          admission_reference: string;
          admitted_by?: string | null;
          remarks?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          student_id?: string;
          college_id?: string;
          course_id?: string;
          admission_status?: AdmissionOutcome;
          admission_date?: string;
          academic_year?: string;
          admission_reference?: string;
          admitted_by?: string | null;
          remarks?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admissions_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: true;
            referencedRelation: "applications";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          category: string;
          title: string;
          message: string;
          notification_type: string;
          related_entity_type: string | null;
          related_entity_id: string | null;
          destination_url: string | null;
          is_read: boolean;
          created_at: string;
          read_at: string | null;
          expires_at: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          category?: string;
          title: string;
          message: string;
          notification_type: string;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          destination_url?: string | null;
          is_read?: boolean;
          created_at?: string;
          read_at?: string | null;
          expires_at?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          category?: string;
          title?: string;
          message?: string;
          notification_type?: string;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          destination_url?: string | null;
          is_read?: boolean;
          created_at?: string;
          read_at?: string | null;
          expires_at?: string | null;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          in_app_enabled: boolean;
          email_enabled: boolean;
          reminder_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          in_app_enabled?: boolean;
          email_enabled?: boolean;
          reminder_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          in_app_enabled?: boolean;
          email_enabled?: boolean;
          reminder_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      follow_up_reminders: {
        Row: {
          id: string;
          follow_up_id: string;
          recipient_id: string;
          reminder_type: string;
          idempotency_key: string;
          status: string;
          sent_at: string;
          error_message: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          follow_up_id: string;
          recipient_id: string;
          reminder_type: string;
          idempotency_key: string;
          status?: string;
          sent_at?: string;
          error_message?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          follow_up_id?: string;
          recipient_id?: string;
          reminder_type?: string;
          idempotency_key?: string;
          status?: string;
          sent_at?: string;
          error_message?: string | null;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "follow_up_reminders_follow_up_id_fkey";
            columns: ["follow_up_id"];
            isOneToOne: false;
            referencedRelation: "follow_ups";
            referencedColumns: ["id"];
            referencedSchema: "public";
          },
          {
            foreignKeyName: "follow_up_reminders_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_values: Json | null;
          new_values: Json | null;
          ip_address_if_appropriate: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address_if_appropriate?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address_if_appropriate?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      staff_invitations: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          token: string;
          invited_by: string | null;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: UserRole;
          token: string;
          invited_by?: string | null;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          token?: string;
          invited_by?: string | null;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_invitations_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            referencedSchema: "public";
          }
        ];
      };

      system_health: {
        Row: {
          id: string;
          status: string;
          version: string;
          last_ping: string;
        };
        Insert: {
          id?: string;
          status: string;
          version?: string;
          last_ping?: string;
        };
        Update: {
          id?: string;
          status?: string;
          version?: string;
          last_ping?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: { check_role: UserRole };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_counsellor: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
    };
    Enums: {
      user_role: UserRole;
      account_status: AccountStatus;
      college_publication_status: CollegePublicationStatus;
      admission_status: AdmissionStatus;
      course_status: CourseStatus;
      duration_unit: DurationUnit;
      lead_status: LeadStatus;
      lead_priority: LeadPriority;
      assignment_status: AssignmentStatus;
      follow_up_status: FollowUpStatus;
      application_status: ApplicationStatus;
      document_verification_status: DocumentVerificationStatus;
      admission_outcome: AdmissionOutcome;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];
export type NotificationUpdate = Database["public"]["Tables"]["notifications"]["Update"];

export type NotificationPreferenceRow = Database["public"]["Tables"]["notification_preferences"]["Row"];
export type NotificationPreferenceInsert = Database["public"]["Tables"]["notification_preferences"]["Insert"];
export type NotificationPreferenceUpdate = Database["public"]["Tables"]["notification_preferences"]["Update"];

export type FollowUpReminderRow = Database["public"]["Tables"]["follow_up_reminders"]["Row"];
export type FollowUpReminderInsert = Database["public"]["Tables"]["follow_up_reminders"]["Insert"];

