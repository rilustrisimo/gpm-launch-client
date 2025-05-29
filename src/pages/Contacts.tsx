import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ContactListTable } from "@/components/contacts/ContactListTable";
import { CreateContactListModal } from "@/components/contacts/CreateContactListModal";

const Contacts = () => {
  const [listSearch, setListSearch] = useState<string>("");
  
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-accent mb-4 md:mb-0">Contact Lists</h1>
        <div className="flex space-x-2">
          <CreateContactListModal />
        </div>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="relative flex w-full items-center mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contact lists..."
              className="pl-10"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
            />
          </div>
          
          <ContactListTable searchTerm={listSearch} />
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Contacts;
