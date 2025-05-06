
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronRight, 
  Download, 
  Plus, 
  Search, 
  Trash, 
  Upload 
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

// Placeholder contacts data
const contactsData = {
  "1": {
    listName: "Main Subscribers",
    contacts: [
      { id: "1", email: "john.doe@example.com", firstName: "John", lastName: "Doe", status: "Active" },
      { id: "2", email: "jane.smith@example.com", firstName: "Jane", lastName: "Smith", status: "Active" },
      { id: "3", email: "michael.johnson@example.com", firstName: "Michael", lastName: "Johnson", status: "Active" },
      { id: "4", email: "emily.wilson@example.com", firstName: "Emily", lastName: "Wilson", status: "Unsubscribed" },
      { id: "5", email: "robert.brown@example.com", firstName: "Robert", lastName: "Brown", status: "Active" },
      { id: "6", email: "sarah.davis@example.com", firstName: "Sarah", lastName: "Davis", status: "Bounced" },
      { id: "7", email: "david.miller@example.com", firstName: "David", lastName: "Miller", status: "Active" },
      { id: "8", email: "jennifer.taylor@example.com", firstName: "Jennifer", lastName: "Taylor", status: "Active" },
      { id: "9", email: "james.anderson@example.com", firstName: "James", lastName: "Anderson", status: "Active" },
      { id: "10", email: "lisa.thomas@example.com", firstName: "Lisa", lastName: "Thomas", status: "Unsubscribed" },
    ],
  },
  "2": {
    listName: "Product Interest - Electronics",
    contacts: [
      { id: "1", email: "tech.enthusiast@example.com", firstName: "Tech", lastName: "Enthusiast", status: "Active" },
      { id: "2", email: "gadget.lover@example.com", firstName: "Gadget", lastName: "Lover", status: "Active" },
      { id: "3", email: "electronics.fan@example.com", firstName: "Electronics", lastName: "Fan", status: "Active" },
    ],
  },
  "3": {
    listName: "VIP Customers",
    contacts: [
      { id: "1", email: "vip.customer1@example.com", firstName: "VIP", lastName: "Customer1", status: "Active" },
      { id: "2", email: "vip.customer2@example.com", firstName: "VIP", lastName: "Customer2", status: "Active" },
    ],
  },
  "4": {
    listName: "Event Attendees - Spring Conference",
    contacts: [
      { id: "1", email: "attendee1@example.com", firstName: "Attendee", lastName: "One", status: "Active" },
      { id: "2", email: "attendee2@example.com", firstName: "Attendee", lastName: "Two", status: "Active" },
      { id: "3", email: "attendee3@example.com", firstName: "Attendee", lastName: "Three", status: "Bounced" },
    ],
  },
};

interface ContactListProps {
  listId: string;
  onBack: () => void;
}

export const ContactList = ({ listId, onBack }: ContactListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get list data
  const listData = contactsData[listId as keyof typeof contactsData];
  
  if (!listData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Contact list not found.</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Lists
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Filter contacts based on search term
  const filteredContacts = listData.contacts.filter(contact => 
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Lists
      </Button>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-brand-accent mb-4 md:mb-0">
          {listData.listName}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({listData.contacts.length} contacts)
          </span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="justify-start">
            <Upload className="h-4 w-4 mr-2" /> Import
          </Button>
          <Button variant="outline" className="justify-start">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button className="bg-brand-highlight text-white hover:bg-brand-highlight/90">
            <Plus className="h-4 w-4 mr-2" /> Add Contact
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contacts by name or email..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.email}</TableCell>
                    <TableCell>{contact.firstName}</TableCell>
                    <TableCell>{contact.lastName}</TableCell>
                    <TableCell>
                      <span 
                        className={`
                          inline-block px-2 py-1 rounded text-xs font-medium
                          ${contact.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                          ${contact.status === 'Unsubscribed' ? 'bg-gray-100 text-gray-800' : ''}
                          ${contact.status === 'Bounced' ? 'bg-red-100 text-red-800' : ''}
                        `}
                      >
                        {contact.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash className="h-4 w-4 text-gray-500 hover:text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredContacts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center">
                      <p className="text-gray-500">No contacts found matching your search.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
