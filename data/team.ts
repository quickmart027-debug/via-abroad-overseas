/**
 * No team members are published yet. This structure exists so real,
 * verified counsellor profiles can be added later without any change to
 * the About page component — the team section only renders when this
 * array is non-empty.
 */
export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  photoUrl?: string;
};

export const team: TeamMember[] = [];
