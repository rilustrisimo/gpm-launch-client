import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Search, Loader2 } from "lucide-react";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { CreateTemplateModal } from "@/components/templates/CreateTemplateModal";
import { useTemplates } from "@/hooks/use-templates";
import { Skeleton } from "@/components/ui/skeleton";

const Templates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch templates from API
  const { data, isLoading, isError } = useTemplates({ search: searchTerm });
  const templates = data?.templates || [];
  
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-accent mb-4 md:mb-0">Email Templates</h1>
        <CreateTemplateModal />
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        // Show skeleton loading UI
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video w-full bg-gray-100">
                  <Skeleton className="h-full w-full" />
                </div>
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        // Show error state
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <FileText className="h-16 w-16 text-red-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Failed to load templates</h3>
            <p className="text-gray-500 mb-6">
              There was an error loading your templates. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : templates && templates.length > 0 ? (
        // Show templates grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        // Show empty state
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 
                `No templates match "${searchTerm}"` : 
                "You don't have any templates yet"}
            </p>
            <CreateTemplateModal />
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
};

export default Templates;
