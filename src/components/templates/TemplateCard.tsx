
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Mail, Trash } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Template {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastUsed: string;
  usageCount: number;
  thumbnail: string;
}

interface TemplateCardProps {
  template: Template;
}

export const TemplateCard = ({ template }: TemplateCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <AspectRatio ratio={16 / 9}>
        <img 
          src={template.thumbnail} 
          alt={template.name}
          className="object-cover w-full h-full"
        />
      </AspectRatio>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-brand-accent mb-2">{template.name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description}</p>
        
        <div className="grid grid-cols-2 text-xs text-gray-500 mb-4">
          <div>
            <p className="mb-1">Created: {template.createdAt}</p>
            <p>Last used: {template.lastUsed}</p>
          </div>
          <div className="text-right">
            <p className="mb-1">Used {template.usageCount} times</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="text-xs flex-1">
            <Edit className="h-3 w-3 mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="text-xs flex-1">
            <Mail className="h-3 w-3 mr-1" /> Use
          </Button>
          <Button variant="outline" size="sm" className="text-xs flex-1">
            <Copy className="h-3 w-3 mr-1" /> Copy
          </Button>
          <Button variant="outline" size="sm" className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 flex-1">
            <Trash className="h-3 w-3 mr-1" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
