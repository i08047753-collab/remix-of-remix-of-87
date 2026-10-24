import type { CategorySlug, IntentKey } from "@/data/catalog";
import type { Submission } from "@/data/sample";
import { useLocalStore } from "./local-store";

export type Theme = "dark" | "light";

export type OnboardingAnswers = {
  fields: CategorySlug[];
  topics: string[];
  topicsNote: string;
  projects: string[];
  dreams: string;
  intents: IntentKey[];
};

export type Profile = {
  username: string;
  bio: string;
  answers: OnboardingAnswers;
  /** Member opts in to show favourite fields on the public profile. Off by default. */
  showFieldsPublicly: boolean;
};

export const EMPTY_ANSWERS: OnboardingAnswers = {
  fields: [],
  topics: [],
  topicsNote: "",
  projects: [],
  dreams: "",
  intents: [],
};

export const THEME_KEY = "sw-theme";

export const useTheme = () => useLocalStore<Theme | null>(THEME_KEY, null);
export const useProfile = () => useLocalStore<Profile | null>("sw-profile", null);
export const useMySubmissions = () => useLocalStore<Submission[]>("sw-submissions", []);
export const useBlocked = () => useLocalStore<string[]>("sw-blocked", []);
export const useLiked = () => useLocalStore<string[]>("sw-liked", []);

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

/** Runs before paint so the saved theme shows without a flash. */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=JSON.parse(localStorage.getItem("${THEME_KEY}"));var d=t!=="light";var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light";}catch(_){}})();`;
