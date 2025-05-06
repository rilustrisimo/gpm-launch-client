
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Plus, Search } from "lucide-react";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { CreateCampaignModal } from "@/components/campaigns/CreateCampaignModal";

// Placeholder campaign data
const campaignData = [
  {
    id: "1",
    name: "Monthly Newsletter - May 2025",
    status: "Completed",
    sentDate: "2025-05-01",
    totalRecipients: 3240,
    openRate: "24.8%",
    clickRate: "6.7%",
  },
  {
    id: "2",
    name: "Product Launch - New Summer Collection",
    status: "Sending",
    sentDate: "2025-05-04",
    totalRecipients: 5120,
    openRate: "32.1%",
    clickRate: "12.3%",
  },
  {
    id: "3",
    name: "Customer Survey - Feedback Request",
    status: "Scheduled",
    sentDate: "2025-05-10",
    totalRecipients: 2910,
    openRate: "-",
    clickRate: "-",
  },
  {
    id: "4",
    name: "Weekly Update - Company News",
    status: "Draft",
    sentDate: "-",
    totalRecipients: 2440,
    openRate: "-",
    clickRate: "-",
  },
  {
    id: "5",
    name: "Special Promotion - Limited Time Offer",
    status: "Draft",
    sentDate: "-",
    totalRecipients: 4200,
    openRate: "-",
    clickRate: "-",
  },
];

const Campaigns = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Filter campaigns based on search term and active tab
  const filteredCampaigns = campaignData.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = 
      activeTab === "all" || 
      activeTab === campaign.status.toLowerCase();
    
    return matchesSearch && matchesTab;
  });

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-accent mb-4 md:mb-0">Campaigns</h1>
        <CreateCampaignModal />
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search campaigns..."
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="sending">Sending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      {filteredCampaigns.length > 0 ? (
        <div className="grid gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Mail className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No campaigns found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 
                `No campaigns match "${searchTerm}" in the ${activeTab === 'all' ? 'selected filters' : activeTab + ' category'}` : 
                `You don't have any ${activeTab === 'all' ? '' : activeTab + ' '}campaigns yet`}
            </p>
            <CreateCampaignModal />
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
};

export default Campaigns;
