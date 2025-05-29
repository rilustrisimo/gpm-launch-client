import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Plus, Search } from "lucide-react";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { CreateCampaignModal } from "@/components/campaigns/CreateCampaignModal";
import { useCampaigns } from "@/hooks";
import { Campaign } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const Campaigns = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch campaigns from API
  const { data: campaigns, isLoading, isError } = useCampaigns();
  
  // Filter campaigns based on search term and active tab
  const filteredCampaigns = campaigns?.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = 
      activeTab === "all" || 
      activeTab === campaign.status.toLowerCase();
    
    return matchesSearch && matchesTab;
  }) || [];

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
      
      {isLoading ? (
        // Show skeleton loading UI while fetching data
        <div className="grid gap-6">
          {[1, 2, 3].map((index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                  <div className="p-6 md:col-span-2">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 md:col-span-1 lg:col-span-2">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="text-center">
                          <Skeleton className="h-4 w-16 mx-auto mb-1" />
                          <Skeleton className="h-6 w-12 mx-auto" />
                        </div>
                      ))}
                    </div>
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
              <Mail className="h-16 w-16 text-red-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Failed to load campaigns</h3>
            <p className="text-gray-500 mb-6">
              There was an error loading your campaigns. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : filteredCampaigns.length > 0 ? (
        // Show campaign list
        <div className="grid gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        // Show empty state
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
