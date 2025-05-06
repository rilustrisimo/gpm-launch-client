
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Textarea
} from "@/components/ui/textarea";
import {
  Switch
} from "@/components/ui/switch";

const Settings = () => {
  const [emailName, setEmailName] = useState("BlastMaster");
  const [emailAddress, setEmailAddress] = useState("campaigns@example.com");
  const [replyToAddress, setReplyToAddress] = useState("replies@example.com");
  const [companyName, setCompanyName] = useState("Your Company Name");
  const [companyAddress, setCompanyAddress] = useState("123 Main Street, City, Country");
  const [footerText, setFooterText] = useState("© 2025 Your Company. All rights reserved.");
  const [trackOpens, setTrackOpens] = useState(true);
  const [trackClicks, setTrackClicks] = useState(true);
  const [doubleOptIn, setDoubleOptIn] = useState(false);
  const [unsubscribeLink, setUnsubscribeLink] = useState(true);

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-brand-accent mb-8">Settings</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sender">Sender Information</TabsTrigger>
          <TabsTrigger value="tracking">Tracking & Privacy</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your account settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Textarea 
                  id="companyAddress" 
                  value={companyAddress} 
                  onChange={(e) => setCompanyAddress(e.target.value)} 
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="footerText">Default Email Footer</Label>
                <Textarea 
                  id="footerText" 
                  value={footerText} 
                  onChange={(e) => setFooterText(e.target.value)} 
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  This text will be added to the footer of all your emails by default.
                </p>
              </div>
              
              <Button className="bg-brand-highlight text-white hover:bg-brand-highlight/90">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sender">
          <Card>
            <CardHeader>
              <CardTitle>Sender Information</CardTitle>
              <CardDescription>Configure default sender details for your email campaigns.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="emailName">Default "From" Name</Label>
                <Input 
                  id="emailName" 
                  value={emailName} 
                  onChange={(e) => setEmailName(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailAddress">Default "From" Email Address</Label>
                <Input 
                  id="emailAddress" 
                  type="email" 
                  value={emailAddress} 
                  onChange={(e) => setEmailAddress(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="replyToAddress">Default "Reply-To" Email Address</Label>
                <Input 
                  id="replyToAddress" 
                  type="email" 
                  value={replyToAddress} 
                  onChange={(e) => setReplyToAddress(e.target.value)} 
                />
              </div>
              
              <Button className="bg-brand-highlight text-white hover:bg-brand-highlight/90">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Tracking & Privacy Settings</CardTitle>
              <CardDescription>Configure tracking and privacy options for your campaigns.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="trackOpens">Track Email Opens</Label>
                  <p className="text-sm text-gray-500">
                    Track when recipients open your emails
                  </p>
                </div>
                <Switch 
                  id="trackOpens" 
                  checked={trackOpens}
                  onCheckedChange={setTrackOpens}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="trackClicks">Track Link Clicks</Label>
                  <p className="text-sm text-gray-500">
                    Track when recipients click links in your emails
                  </p>
                </div>
                <Switch 
                  id="trackClicks" 
                  checked={trackClicks}
                  onCheckedChange={setTrackClicks}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="doubleOptIn">Double Opt-in Subscription</Label>
                  <p className="text-sm text-gray-500">
                    Require new subscribers to confirm their subscription via email
                  </p>
                </div>
                <Switch 
                  id="doubleOptIn" 
                  checked={doubleOptIn}
                  onCheckedChange={setDoubleOptIn}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="unsubscribeLink">Include Unsubscribe Link</Label>
                  <p className="text-sm text-gray-500">
                    Automatically add an unsubscribe link to all emails
                  </p>
                </div>
                <Switch 
                  id="unsubscribeLink" 
                  checked={unsubscribeLink}
                  onCheckedChange={setUnsubscribeLink}
                />
              </div>
              
              <Button className="bg-brand-highlight text-white hover:bg-brand-highlight/90">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for programmatic access to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Your API Key</Label>
                <div className="flex">
                  <Input 
                    id="apiKey" 
                    value="api_keybd8f6abd92e957dcf9376z8nf92" 
                    readOnly
                    type="password"
                    className="rounded-r-none"
                  />
                  <Button variant="outline" className="rounded-l-none border-l-0">
                    Show
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Use this key to access the BlastMaster API programmatically.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <Button variant="outline">
                  Regenerate Key
                </Button>
                <Button className="bg-brand-highlight text-white hover:bg-brand-highlight/90">
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Settings;
