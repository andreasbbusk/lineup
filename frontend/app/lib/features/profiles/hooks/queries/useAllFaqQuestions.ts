import { useQuery } from "@tanstack/react-query";
import { getAllFaqQuestions } from "../../api";

/**
 * Hook to fetch all available FAQ questions
 */
export function useAllFaqQuestions() {
  return useQuery({
    queryKey: ["faq-questions"],
    queryFn: () => getAllFaqQuestions(),
  });
}
