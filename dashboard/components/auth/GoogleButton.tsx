"use client";

function handleClick() {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/signin`;
}

export function GoogleButton() {
  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full h-11 flex items-center justify-center gap-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[14px] text-[#374151] hover:bg-[#F9FAFB] transition-colors"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 48 48"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="#4285F4"
          d="M44.5 20H24v8.5h11.7C34.7 33.6 30 36.5 24 36.5c-6.9 0-12.5-5.6-12.5-12.5S17.1 11.5 24 11.5c3.2 0 6.1 1.2 8.3 3.2l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.4-.2-2.7-.5-4z"
        />
        <path
          fill="#34A853"
          d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.2 0 6.1 1.2 8.3 3.2l6-6C34.6 6.6 29.6 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z"
        />
        <path
          fill="#FBBC05"
          d="M24 44.5c5.5 0 10.5-1.9 14.1-5.1l-6.5-5.3c-2 1.4-4.5 2.2-7.6 2.2-5.9 0-10.9-3.8-12.7-9l-6.6 5.1C8 39.7 15.4 44.5 24 44.5z"
        />
        <path
          fill="#EA4335"
          d="M44.5 20H24v8.5h11.7c-1 2.8-2.9 5.1-5.6 6.6l6.5 5.3C40.5 36.6 44.5 30.9 44.5 24c0-1.4-.2-2.7-.5-4z"
        />
      </svg>
      Continue with Google
    </button>
  );
}
