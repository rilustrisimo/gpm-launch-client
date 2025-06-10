import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useContactLists = () => {
  return useQuery({
    queryKey: ["contactLists"],
    queryFn: async () => {
      try {
        // Get all contact lists without pagination by setting a high limit
        const { data } = await api.get("/contact-lists", {
          params: {
            limit: 1000 // Get all contact lists
          }
        });
        
        console.log("Contact lists API response:", data);
        
        // Handle different possible response structures
        const contactLists = data.contactLists || data.data?.contactLists || data;
        
        if (Array.isArray(contactLists)) {
          return contactLists;
        } else if (Array.isArray(data)) {
          return data;
        } else {
          console.warn("Unexpected contact lists response structure:", data);
          return [];
        }
      } catch (error) {
        console.error("Error fetching contact lists:", error);
        throw error;
      }
    },
  });
}; 