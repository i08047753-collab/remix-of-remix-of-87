import type { CategorySlug, IntentKey } from "./catalog";

/** Shared content contracts and empty collections. No fabricated community activity.
 * User-created device data is stored separately and must not be cleared here.
 */

export type Member = {
  username: string;
  name: string;
  bio: string;
  hue: number; // avatar tint, 0-360
  fields: CategorySlug[]; // only fields the member chose to show publicly
  joined: string;
  role?: "founder" | "member";
};

export const MEMBERS: Member[] = [];

export const memberByUsername = (u: string) => MEMBERS.find((m) => m.username === u);

export type Post = {
  id: string;
  author: string;
  category: CategorySlug;
  intent: IntentKey;
  title: string;
  body: string;
  time: string;
  likes: number;
  replies: number;
};

export const POSTS: Post[] = [];

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type Submission = {
  id: string;
  title: string;
  body: string;
  category: CategorySlug;
  intent: IntentKey;
  status: SubmissionStatus;
  submittedAt: string;
  note?: string;
};

export const SAMPLE_SUBMISSIONS: Submission[] = [];

export type ModerationItem = Submission & { author: string };

export const REVIEW_QUEUE: ModerationItem[] = [];

export type Report = {
  id: string;
  target: string;
  kind: "post" | "member" | "message";
  reason: string;
  reportedAt: string;
};

export const REPORTS: Report[] = [];

export type Room = {
  id: string;
  name: string;
  topic: string;
  category: CategorySlug;
  visibility: "public" | "private";
  members: string[];
  online: number;
};

export const ROOMS: Room[] = [];

export type ChatMessage = { id: string; author: string; text: string; time: string };

export const ROOM_MESSAGES: Record<string, ChatMessage[]> = {};

export const SUGGESTED_TOPICS = ["تاريخ العلوم", "الطاقة المتجددة", "علم المناخ", "الطب", "علم النفس", "الألعاب التعليمية"];
export const PROJECT_KINDS = ["تجارب منزلية", "برمجة تطبيقات", "بناء روبوتات", "رصد السماء", "مسابقات وأولمبياد", "بحث وقراءة"];
