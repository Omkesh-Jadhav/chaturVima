/**
 * Pagination Component
 * Navigation component for paginated data with consistent styling
 */
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  size?: "sm" | "md" | "lg";
}

interface PaginationButtonProps {
  isActive?: boolean;
  isDisabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      className,
      currentPage,
      totalPages,
      onPageChange,
      showFirstLast = true,
      showPrevNext = true,
      maxVisiblePages = 5,
      size = "md",
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: {
        button: "h-8 w-8 text-sm",
        gap: "gap-1",
      },
      md: {
        button: "h-10 w-10 text-base",
        gap: "gap-2",
      },
      lg: {
        button: "h-12 w-12 text-lg",
        gap: "gap-3",
      },
    };

    const getVisiblePages = () => {
      const pages: (number | string)[] = [];
      const halfVisible = Math.floor(maxVisiblePages / 2);

      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, currentPage + halfVisible);

      // Adjust if we're near the beginning or end
      if (currentPage <= halfVisible) {
        endPage = Math.min(totalPages, maxVisiblePages);
      }
      if (currentPage + halfVisible >= totalPages) {
        startPage = Math.max(1, totalPages - maxVisiblePages + 1);
      }

      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("...");
        }
      }

      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }

      return pages;
    };

    const PaginationButton = ({
      isActive = false,
      isDisabled = false,
      children,
      onClick,
    }: PaginationButtonProps) => {
      const baseStyles = cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-teal rounded-lg",
        sizes[size].button,
        {
          "bg-brand-teal text-white shadow-sm hover:bg-brand-teal/90": isActive,
          "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300":
            !isActive && !isDisabled,
          "bg-gray-100 text-gray-400 cursor-not-allowed": isDisabled,
        }
      );

      if (isDisabled) {
        return <div className={baseStyles}>{children}</div>;
      }

      return (
        <motion.button
          whileHover={{ scale: isActive ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={baseStyles}
          onClick={onClick}
          disabled={isDisabled}
        >
          {children}
        </motion.button>
      );
    };

    const visiblePages = getVisiblePages();

    if (totalPages <= 1) {
      return null;
    }

    return (
      <nav
        ref={ref}
        className={cn("flex items-center justify-center", sizes[size].gap, className)}
        role="navigation"
        aria-label="Pagination"
        {...props}
      >
        {/* First page button */}
        {showFirstLast && currentPage > 1 && (
          <PaginationButton
            onClick={() => onPageChange(1)}
            isDisabled={currentPage === 1}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </PaginationButton>
        )}

        {/* Previous page button */}
        {showPrevNext && (
          <PaginationButton
            onClick={() => onPageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </PaginationButton>
        )}

        {/* Page numbers */}
        {visiblePages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-gray-500 font-medium"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          return (
            <PaginationButton
              key={pageNumber}
              isActive={pageNumber === currentPage}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </PaginationButton>
          );
        })}

        {/* Next page button */}
        {showPrevNext && (
          <PaginationButton
            onClick={() => onPageChange(currentPage + 1)}
            isDisabled={currentPage === totalPages}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </PaginationButton>
        )}

        {/* Last page button */}
        {showFirstLast && currentPage < totalPages && (
          <PaginationButton
            onClick={() => onPageChange(totalPages)}
            isDisabled={currentPage === totalPages}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </PaginationButton>
        )}
      </nav>
    );
  }
);

Pagination.displayName = "Pagination";

export default Pagination;

// Pagination info component for showing "Showing X to Y of Z results"
export const PaginationInfo = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    size?: "sm" | "md" | "lg";
  }
>(({ className, currentPage, itemsPerPage, totalItems, size = "md", ...props }, ref) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "text-gray-600 font-medium",
        textSizes[size],
        className
      )}
      {...props}
    >
      Showing <span className="font-semibold text-gray-900">{startItem}</span> to{" "}
      <span className="font-semibold text-gray-900">{endItem}</span> of{" "}
      <span className="font-semibold text-gray-900">{totalItems}</span> results
    </div>
  );
});

PaginationInfo.displayName = "PaginationInfo";
