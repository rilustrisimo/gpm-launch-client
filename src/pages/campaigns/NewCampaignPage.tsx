import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTemplate } from "@/hooks/use-templates";
import { useCreateCampaign } from "@/hooks/use-campaigns";
import { useContactLists } from "@/hooks/use-contact-lists";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const NewCampaignPage = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("templateId");
  const { data, isLoading: isTemplateLoading, isError: isTemplateError } = useTemplate(templateId!);
  const { data: contactLists = [], isLoading: isListsLoading } = useContactLists();
  const { mutate: createCampaign, isPending: isSubmitting } = useCreateCampaign();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    subject: "",
    contactListId: "",
    scheduledFor: ""
  });

  useEffect(() => {
    if (data?.template) {
      setForm((prev) => ({
        ...prev,
        subject: data.template.subject || "",
      }));
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleContactList = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, contactListId: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate and convert IDs
    const parsedContactListId = parseInt(form.contactListId, 10);
    const parsedTemplateId = templateId ? parseInt(templateId, 10) : undefined;
    
    if (isNaN(parsedContactListId) || parsedContactListId <= 0) {
      toast.error("Please select a valid contact list");
      return;
    }
    
    if (templateId && (isNaN(parsedTemplateId!) || parsedTemplateId! <= 0)) {
      toast.error("Please select a valid template");
      return;
    }
    
    const campaignData = {
      name: form.name,
      subject: form.subject,
      contactListId: parsedContactListId,
      scheduledFor: form.scheduledFor,
      templateId: parsedTemplateId,
    };
    
    // Debug log
    console.log('NewCampaignPage creating campaign with data:', {
      ...campaignData,
      contactListId: typeof campaignData.contactListId,
      templateId: typeof campaignData.templateId
    });
    
    createCampaign(campaignData, {
        onSuccess: () => {
          toast.success("Campaign created successfully");
          navigate("/campaigns");
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to create campaign");
        },
      }
    );
  };

  if (isTemplateLoading || isListsLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin w-8 h-8 text-gray-400" /></div>;
  if (isTemplateError) return <div className="text-red-500 text-center mt-10">Failed to load template.</div>;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-brand-accent">Create New Campaign</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded shadow">
        <div>
          <label className="block font-medium mb-1">Campaign Name</label>
          <Input name="name" value={form.name} onChange={handleChange} required disabled={isSubmitting} />
        </div>
        <div>
          <label className="block font-medium mb-1">Contact List</label>
          <select name="contactListId" value={form.contactListId} onChange={handleContactList} required disabled={isSubmitting} className="w-full border rounded px-3 py-2">
            <option value="">Select a list</option>
            {contactLists.map((list: any) => (
              <option key={list.id} value={list.id}>{list.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Subject</label>
          <Input name="subject" value={form.subject} onChange={handleChange} required disabled={isSubmitting} />
        </div>
        <div>
          <label className="block font-medium mb-1">Schedule For</label>
          <Input type="datetime-local" name="scheduledFor" value={form.scheduledFor} onChange={handleChange} disabled={isSubmitting} />
        </div>
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/campaigns")}>Cancel</Button>
          <Button type="submit" className="bg-brand-highlight text-white" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            Create Campaign
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewCampaignPage; 