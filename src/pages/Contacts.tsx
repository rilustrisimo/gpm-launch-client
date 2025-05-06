
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactList } from "@/components/contacts/ContactList";
import { CloudUpload, Plus, Search, Users } from "lucide-react";
import { CreateContactListModal } from "@/components/contacts/CreateContactListModal";
import { ImportContactsModal } from "@/components/contacts/ImportContactsModal";

// Placeholder contact lists data
const contactListsData = [
  {
    id: "1",
    name: "Main Subscribers",
    description: "Primary contact list for regular newsletters",
    count: 3456,
    lastUpdated: "2025-05-01",
  },
  {
    id: "2",
    name: "Product Interest - Electronics",
    description: "Contacts interested in electronic products",
    count: 1234,
    lastUpdated: "2025-04-28",
  },
  {
    id: "3",
    name: "VIP Customers",
    description: "High-value customers and frequent buyers",
    count: 567,
    lastUpdated: "2025-04-20",
  },
  {
    id: "4",
    name: "Event Attendees - Spring Conference",
    description: "Contacts who registered for the spring conference",
    count: 890,
    lastUpdated: "2025-03-15",
  },
];

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedList, setSelectedList] = useState<string | null>(null);
  
  // Filter contact lists based on search term
  const filteredLists = contactListsData.filter(list => 
    list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-accent mb-4 md:mb-0">Contact Lists</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <ImportContactsModal />
          <CreateContactListModal />
        </div>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contact lists..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      {selectedList ? (
        <ContactList listId={selectedList} onBack={() => setSelectedList(null)} />
      ) : (
        <>
          {filteredLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLists.map((list) => (
                <Card 
                  key={list.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedList(list.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-brand-accent">{list.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{list.description}</p>
                      </div>
                      <div className="bg-brand-accent rounded-full p-2">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-500">Contacts</p>
                        <p className="text-xl font-semibold text-brand-accent">{list.count.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="text-sm font-medium text-brand-accent">{list.lastUpdated}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <Users className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No contact lists found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? 
                    `No contact lists match "${searchTerm}"` : 
                    "You don't have any contact lists yet"}
                </p>
                <CreateContactListModal />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default Contacts;
