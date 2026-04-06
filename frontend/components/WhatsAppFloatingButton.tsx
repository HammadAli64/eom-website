'use client';

import Link from 'next/link';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

const PHONE_DISPLAY = '03277236384';
// WhatsApp uses international format without + for wa.me
const PHONE_WA = '923277236384';

export function WhatsAppFloatingButton() {
  const href = `https://wa.me/${PHONE_WA}?text=${encodeURIComponent('Hi! I want to know about your products.')}`;

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 ring-2 ring-white/40 transition-all hover:scale-105 hover:shadow-xl active:scale-95"
        aria-label={`Contact us on WhatsApp ${PHONE_DISPLAY}`}
      >
        <WhatsAppIcon className="h-[2.125rem] w-[2.125rem] shrink-0 drop-shadow-sm" />
      </Link>
    </div>
  );
}
