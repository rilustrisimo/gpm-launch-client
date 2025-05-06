
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Search } from "lucide-react";
import { TemplateCard } from "@/components/templates/TemplateCard";

// Placeholder templates data
const templatesData = [
  {
    id: "1",
    name: "Welcome Email",
    description: "Send to new subscribers to welcome them to your list",
    createdAt: "2025-04-15",
    lastUsed: "2025-05-01",
    usageCount: 8,
    thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
  },
  {
    id: "2",
    name: "Monthly Newsletter",
    description: "Standard template for monthly updates and news",
    createdAt: "2025-03-22",
    lastUsed: "2025-05-02",
    usageCount: 12,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f"
  },
  {
    id: "3",
    name: "Product Announcement",
    description: "Template for new product or feature announcements",
    createdAt: "2025-04-28",
    lastUsed: "2025-04-28",
    usageCount: 2,
    thumbnail: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
  },
  {
    id: "4",
    name: "Special Promotion",
    description: "For limited-time offers or special promotions",
    createdAt: "2025-03-10",
    lastUsed: "2025-04-10",
    usageCount: 5,
    thumbnail: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
  },
  {
    id: "5",
    name: "Customer Feedback",
    description: "Request feedback or reviews from your customers",
    createdAt: "2025-04-05",
    lastUsed: "2025-04-20",
    usageCount: 3,
    thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
  }
];

const Templates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter templates based on search term
  const filteredTemplates = templatesData.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-accent mb-4 md:mb-0">Email Templates</h1>
        <Button className="bg-brand-highlight text-white hover:bg-brand-highlight/90">
          <Plus className="h-4 w-4 mr-2" /> Create Template
        </Button>
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
      
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 
                `No templates match "${searchTerm}"` : 
                "You don't have any templates yet"}
            </p>
            <Button className="bg-brand-highlight text-white hover:bg-brand-highlight/90">
              <Plus className="h-4 w-4 mr-2" /> Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
};

export default Templates;
