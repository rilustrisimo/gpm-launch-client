import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTemplate, useUpdateTemplate } from "@/hooks/use-templates";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const EditTemplatePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useTemplate(id!);
  const { mutate: updateTemplate, isPending } = useUpdateTemplate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    subject: "",
    content: "",
    thumbnail: ""
  });

  useEffect(() => {
    if (data?.template) {
      setForm({
        name: data.template.name || "",
        description: data.template.description || "",
        category: data.template.category || "",
        subject: data.template.subject || "",
        content: data.template.content || "",
        thumbnail: data.template.thumbnail || ""
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategory = (value: string) => {
    setForm({ ...form, category: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTemplate(
      { id: id!, template: form },
      {
        onSuccess: () => {
          toast.success("Template updated successfully");
          navigate("/templates");
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to update template");
        }
      }
    );
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin w-8 h-8 text-gray-400" /></div>;
  if (isError) return <div className="text-red-500 text-center mt-10">Failed to load template.</div>;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-brand-accent">Edit Template</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded shadow">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <Input name="name" value={form.name} onChange={handleChange} required disabled={isPending} />
        </div>
        <div>
          <label className="block font-medium mb-1">Category</label>
          <Select value={form.category} onValueChange={handleCategory} disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newsletter">Newsletter</SelectItem>
              <SelectItem value="promotion">Promotion</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <Input name="description" value={form.description} onChange={handleChange} disabled={isPending} />
        </div>
        <div>
          <label className="block font-medium mb-1">Subject</label>
          <Input name="subject" value={form.subject} onChange={handleChange} required disabled={isPending} />
        </div>
        <div>
          <label className="block font-medium mb-1">Content</label>
          <Textarea name="content" value={form.content} onChange={handleChange} rows={8} required disabled={isPending} />
        </div>
        <div>
          <label className="block font-medium mb-1">Thumbnail URL</label>
          <Input name="thumbnail" value={form.thumbnail} onChange={handleChange} disabled={isPending} />
        </div>
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/templates")}>Cancel</Button>
          <Button type="submit" className="bg-brand-highlight text-white" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditTemplatePage; 