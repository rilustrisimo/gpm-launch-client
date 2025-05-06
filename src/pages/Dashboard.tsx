
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { Mail, Users, FileText, Check } from "lucide-react";

const Dashboard = () => {
  // Placeholder stats - would be fetched from an API in a real application
  const stats = [
    { title: "Total Campaigns", value: 24, icon: Mail, iconColor: "text-brand-highlight" },
    { title: "Active Subscribers", value: 5842, icon: Users, iconColor: "text-green-500" },
    { title: "Email Templates", value: 16, icon: FileText, iconColor: "text-blue-500" },
    { title: "Delivered Emails", value: 142567, icon: Check, iconColor: "text-purple-500" },
  ];

  // Placeholder data for recent campaigns
  const recentCampaigns = [
    { name: "Monthly Newsletter", status: "Completed", sentDate: "2025-05-01", openRate: "24.8%" },
    { name: "Product Launch", status: "Sending", sentDate: "2025-05-04", openRate: "32.1%" },
    { name: "Customer Survey", status: "Scheduled", sentDate: "2025-05-10", openRate: "-" },
    { name: "Weekly Update", status: "Draft", sentDate: "-", openRate: "-" },
  ];

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-brand-accent mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Card key={stat.title} className="animate-fade-in">
            <CardContent className="p-6 flex flex-col items-center">
              <div className={`rounded-full p-3 mb-3 ${stat.iconColor} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <h3 className="text-2xl font-bold text-brand-accent">{stat.value.toLocaleString()}</h3>
              <p className="text-gray-500">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-brand-accent">Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 text-sm font-medium text-gray-500 border-b pb-2">
                <div>Campaign</div>
                <div>Status</div>
                <div>Sent Date</div>
                <div>Open Rate</div>
              </div>
              {recentCampaigns.map((campaign) => (
                <div key={campaign.name} className="grid grid-cols-4 text-sm py-2 border-b border-gray-100">
                  <div className="font-medium text-brand-accent">{campaign.name}</div>
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium
                      ${campaign.status === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                      ${campaign.status === 'Sending' ? 'bg-blue-100 text-blue-800' : ''}
                      ${campaign.status === 'Scheduled' ? 'bg-purple-100 text-purple-800' : ''}
                      ${campaign.status === 'Draft' ? 'bg-gray-100 text-gray-800' : ''}
                    `}>
                      {campaign.status}
                    </span>
                  </div>
                  <div>{campaign.sentDate}</div>
                  <div>{campaign.openRate}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-brand-accent">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="card-hover cursor-pointer border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Mail className="h-10 w-10 text-brand-highlight mb-2" />
                  <h3 className="font-medium text-brand-accent">Create Campaign</h3>
                </CardContent>
              </Card>
              
              <Card className="card-hover cursor-pointer border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <FileText className="h-10 w-10 text-brand-highlight mb-2" />
                  <h3 className="font-medium text-brand-accent">New Template</h3>
                </CardContent>
              </Card>
              
              <Card className="card-hover cursor-pointer border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Users className="h-10 w-10 text-brand-highlight mb-2" />
                  <h3 className="font-medium text-brand-accent">Import Contacts</h3>
                </CardContent>
              </Card>
              
              <Card className="card-hover cursor-pointer border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Check className="h-10 w-10 text-brand-highlight mb-2" />
                  <h3 className="font-medium text-brand-accent">View Reports</h3>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
