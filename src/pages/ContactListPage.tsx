import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ContactList } from "@/components/contacts/ContactList";

const ContactListPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return null;
  }

  return (
    <MainLayout>
      <ContactList 
        listId={id} 
        onBack={() => navigate('/contacts')} 
      />
    </MainLayout>
  );
};

export default ContactListPage; 