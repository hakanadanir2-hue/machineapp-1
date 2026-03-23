export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  category: string;
  is_active: boolean;
  order_index: number;
}

export interface MembershipPlan {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  features: string[];
  is_highlighted: boolean;
  is_active: boolean;
}

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export interface Appointment {
  id: string;
  user_id: string;
  service_id: string;
  date: string;
  time_slot: string;
  status: AppointmentStatus;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  profiles?: Profile;
  services?: Service;
}

export type PaymentType = "program" | "membership";
export type PaymentStatus = "pending" | "success" | "failed";

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  paytr_order_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  profiles?: Profile;
}

export interface FitnessProgramInput {
  gender: "male" | "female";
  age: number;
  weight: number;
  height: number;
  goal: "weight_loss" | "muscle_gain" | "maintenance" | "boxing";
  activity_level:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "extra_active";
  level: "beginner" | "intermediate" | "advanced";
}

export interface NutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: {
    name: string;
    time: string;
    foods: { item: string; amount: string; calories: number }[];
  }[];
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    rest: string;
    notes: string;
  }[];
}

export interface WeeklyProgram {
  week: number;
  days: WorkoutDay[];
  notes: string;
}

export interface FitnessProgramData {
  input: FitnessProgramInput;
  bmr: number;
  tdee: number;
  targetCalories: number;
  nutrition: NutritionPlan;
  weeks: WeeklyProgram[];
  generalNotes: string[];
}

export interface FitnessProgram {
  id: string;
  user_id: string;
  payment_id: string | null;
  input_data: FitnessProgramInput;
  program_data: FitnessProgramData;
  pdf_url: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  profiles?: Profile;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt_text: string;
  category: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  discount_type: "fixed" | "percent" | "extra_days";
  discount_value: number;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "appointment";
  read: boolean;
  created_at: string;
}
