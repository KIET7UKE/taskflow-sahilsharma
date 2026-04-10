import { useState, useMemo } from "react";

export interface PaginationProps {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
}

/**
 * Custom hook for handling pagination logic.
 * 
 * @param {PaginationProps} props - Hook options including total items and page size.
 * @returns {object} Pagination state and handlers.
 */
export function usePagination({ 
  totalItems, 
  initialPage = 1, 
  initialPageSize = 10 
}: PaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure current page is within bounds
  const validatedCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validatedCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const pageRange = useMemo(() => {
    const range = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      let start = Math.max(1, validatedCurrentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) range.push(i);
    }
    
    return range;
  }, [validatedCurrentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const handleNextPage = () => {
    handlePageChange(validatedCurrentPage + 1);
  };

  const handlePreviousPage = () => {
    handlePageChange(validatedCurrentPage - 1);
  };

  return {
    currentPage: validatedCurrentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    pageRange,
    setPageSize,
    handlePageChange,
    handleNextPage,
    handlePreviousPage,
    hasNextPage: validatedCurrentPage < totalPages,
    hasPreviousPage: validatedCurrentPage > 1,
  };
}
