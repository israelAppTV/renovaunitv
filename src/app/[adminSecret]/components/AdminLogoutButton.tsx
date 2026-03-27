"use client";

export function AdminLogoutButton() {
  async function logout() {
    await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logout: true }),
      credentials: "include",
    });
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="mt-8 text-sm text-text/60 underline hover:text-text"
    >
      Sair
    </button>
  );
}
