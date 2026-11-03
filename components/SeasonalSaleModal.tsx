import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SaleData {
  imageSrc: string;
  title: string;
  description: string;
  buttonLink: string;
  buttonText: string;
}

interface SeasonalSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleData: SaleData;
}

export default function SeasonalSaleModal({ isOpen, onClose, saleData }: SeasonalSaleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-3xl bg-white dark:bg-black/50 rounded-xl shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 text-gray-800 dark:text-gray-200 bg-gray-200/30 dark:bg-gray-700/30 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-2 transition-all duration-300"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="relative md:aspect-[4/3] aspect-[2/3]">
          <Image
            src={saleData.imageSrc || "/placeholder.svg"}
            alt={saleData.title}
            fill
            className="object-cover md:object-contain"
            priority
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-gradient-to-b from-transparent to-black/70 p-6">
          
            {/* <Button
              asChild
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-full transform hover:scale-105 transition-all duration-300"
            >
              <Link href={saleData.buttonLink}>{saleData.buttonText}</Link>
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
}