// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  getAal: vi.fn(),
  signOut: vi.fn(),
  profile: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({
    auth: {
      getUser: mocks.getUser,
      signOut: mocks.signOut,
      mfa: { getAuthenticatorAssuranceLevel: mocks.getAal },
    },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: mocks.profile }) }),
    }),
  }),
}));

import { requireAdmin } from "@/lib/auth/admin";

const profile = { id: "p1", auth_user_id: "u1", display_name: "Admin", role: "admin" };

function withUser(factors: { status: string }[] = []) {
  mocks.getUser.mockResolvedValue({ data: { user: { id: "u1", factors } } });
}

describe("requireAdmin MFA step-up", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.profile.mockResolvedValue({ data: profile });
  });

  it("allows a password-only session for an admin with no MFA factor", async () => {
    withUser();
    mocks.getAal.mockResolvedValue({ data: { currentLevel: "aal1", nextLevel: "aal1" }, error: null });
    await expect(requireAdmin()).resolves.toMatchObject({ profile });
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it("signs out an admin with a verified factor whose session is only aal1", async () => {
    withUser([{ status: "verified" }]);
    mocks.getAal.mockResolvedValue({ data: { currentLevel: "aal1", nextLevel: "aal2" }, error: null });
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/admin/login");
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(mocks.profile).not.toHaveBeenCalled();
  });

  it("allows an admin with a verified factor and an aal2 session", async () => {
    withUser([{ status: "verified" }]);
    mocks.getAal.mockResolvedValue({ data: { currentLevel: "aal2", nextLevel: "aal2" }, error: null });
    await expect(requireAdmin()).resolves.toMatchObject({ profile });
  });

  it("ignores an unverified (half-enrolled) factor", async () => {
    withUser([{ status: "unverified" }]);
    mocks.getAal.mockResolvedValue({ data: { currentLevel: "aal1", nextLevel: "aal1" }, error: null });
    await expect(requireAdmin()).resolves.toMatchObject({ profile });
  });

  it("fails closed when the assurance level cannot be read", async () => {
    withUser();
    mocks.getAal.mockResolvedValue({ data: null, error: new Error("session error") });
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/admin/login");
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
  });
});
