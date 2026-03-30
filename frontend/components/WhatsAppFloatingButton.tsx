'use client';

import Link from 'next/link';

const PHONE_DISPLAY = '03277236384';
// WhatsApp uses international format without + for wa.me
const PHONE_WA = '923277236384';

export function WhatsAppFloatingButton() {
  const href = `https://wa.me/${PHONE_WA}?text=${encodeURIComponent('Hi! I want to know about your products.')}`;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl transition-all border border-white/20"
        aria-label={`Contact us on WhatsApp ${PHONE_DISPLAY}`}
      >
        <svg
          viewBox="0 0 32 32"
          width="26"
          height="26"
          fill="currentColor"
          aria-hidden="true"
          className="drop-shadow-sm group-hover:scale-105 transition-transform"
        >
          <path d="M19.11 17.37c-.27-.14-1.62-.8-1.87-.89-.25-.09-.43-.14-.61.14-.18.27-.7.89-.86 1.07-.16.18-.32.2-.59.07-.27-.14-1.16-.43-2.2-1.36-.81-.72-1.36-1.62-1.52-1.89-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.48-.84-2.03-.22-.52-.44-.45-.61-.46h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.63 1.12 2.82c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.66.21 1.26.18 1.73.11.53-.08 1.62-.66 1.85-1.3.23-.64.23-1.18.16-1.3-.07-.12-.25-.2-.52-.34zM16.04 27c-1.86 0-3.66-.5-5.24-1.45l-3.66.96.98-3.57A10.88 10.88 0 0 1 5 16.04C5 9.95 9.95 5 16.04 5c2.95 0 5.73 1.15 7.82 3.23A10.97 10.97 0 0 1 27 16.04C27 22.05 22.05 27 16.04 27zm0-20C11.06 7 7 11.06 7 16.04c0 1.83.55 3.6 1.6 5.1l.16.23-.58 2.1 2.16-.57.22.14A9.02 9.02 0 0 0 16.04 25C20.94 25 25 20.94 25 16.04c0-2.4-.94-4.66-2.64-6.36A8.94 8.94 0 0 0 16.04 7z" />
        </svg>
      </Link>
    </div>
  );
}

