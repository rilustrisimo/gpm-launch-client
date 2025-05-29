import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, AlertCircle, Mail, User, Phone, List } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useCreateContact } from "@/hooks/useContacts";
import { useContactLists } from "@/hooks/useContactLists";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmailValidator } from "@/services/emailValidator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Custom type for form errors
type FormErrors = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  listId?: string;
}

// Validation helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;

const validateEmailField = async (emailValue: string): Promise<string | undefined> => {
  if (!emailValue) {
    return 'Email is required';
  }
  
  if (!EMAIL_REGEX.test(emailValue)) {
    return 'Please enter a valid email address';
  }

  try {
    const result = await EmailValidator.validateEmail(emailValue);
    if (!result.isValid) {
      return result.reason || 'Invalid email address';
    }
  } catch (error) {
    console.error('Email validation error:', error);
    return 'Error validating email';
  }
};

const validateForm = async (values: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  listId: string;
}): Promise<FormErrors> => {
  const errors: FormErrors = {};

  // Email validation
  const emailError = await validateEmailField(values.email);
  if (emailError) {
    errors.email = emailError;
  }

  // Required fields
  if (!values.firstName.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!values.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }

  if (!values.listId) {
    errors.listId = 'Please select a contact list';
  }

  // Phone validation (if provided)
  if (values.phone && !PHONE_REGEX.test(values.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  return errors;
};

interface CreateContactModalProps {
  listId?: string;
}

type ContactStatus = 'active' | 'unsubscribed' | 'bounced';

export function CreateContactModal({ listId }: CreateContactModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<ContactStatus>("active");
  const [selectedListId, setSelectedListId] = useState<string>(listId || "");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isTyping, setIsTyping] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  
  const { mutate: createContact, isPending } = useCreateContact();
  const { data: contactLists, isLoading: listsLoading } = useContactLists();
  const { toast } = useToast();

  // Debounced email validation
  useEffect(() => {
    if (!email || !touchedFields.has('email')) return;
    
    const timerId = setTimeout(() => {
      if (email && touchedFields.has('email')) {
        validateEmailField(email);
      }
    }, 800);
    
    return () => clearTimeout(timerId);
  }, [email]);

  // Phone number formatting
  useEffect(() => {
    if (!phone || isTyping) return;
    
    // Simple phone formatting (can be enhanced with a proper library)
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length > 0) {
      let formatted = '';
      
      if (cleaned.startsWith('1') && cleaned.length > 1) {
        formatted = '+1 ';
        const rest = cleaned.slice(1);
        
        if (rest.length > 3) {
          formatted += `(${rest.slice(0, 3)}) `;
          if (rest.length > 6) {
            formatted += `${rest.slice(3, 6)}-${rest.slice(6, 10)}`;
          } else {
            formatted += rest.slice(3);
          }
        } else {
          formatted += rest;
        }
      } else if (cleaned.length > 3) {
        formatted = `(${cleaned.slice(0, 3)}) `;
        if (cleaned.length > 6) {
          formatted += `${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
        } else {
          formatted += cleaned.slice(3);
        }
      } else {
        formatted = cleaned;
      }
      
      setPhone(formatted);
    }
  }, [phone, isTyping]);

  const resetForm = () => {
    setEmail("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setStatus("active");
    setSelectedListId(listId || "");
    setValidationError(null);
    setFormErrors({});
    setTouchedFields(new Set());
    setFocusedField(null);
    setIsTyping(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    // Mark all fields as touched
    const allFields = ['email', 'firstName', 'lastName', 'phone', 'listId'];
    setTouchedFields(new Set(allFields));

    // Validate all fields
    const formValues = { email, firstName, lastName, phone, listId: selectedListId };
    const errors = await validateForm(formValues);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      createContact(
        {
          email,
          firstName,
          lastName,
          phone,
          status,
          listId: selectedListId
        },
        {
          onSuccess: () => {
            toast({
              title: "Contact Created",
              description: "The contact has been successfully added to the list.",
            });
            setOpen(false);
            resetForm();
          },
          onError: (error) => {
            console.error('Create contact error:', error);
            toast({
              title: "Error",
              description: error.message || "Failed to create contact. Please try again.",
              variant: "destructive"
            });
          }
        }
      );
    } catch (error) {
      console.error('Create contact error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle field blur
  const handleBlur = (fieldName: string) => {
    setFocusedField(null);
    markAsTouched(fieldName);
    
    // Validate the field on blur
    if (fieldName === 'email' && email) {
      validateEmailField(email).then(error => {
        if (error) {
          setFormErrors(prev => ({ ...prev, email: error }));
        }
      });
    }
  };

  // Handle field focus
  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
    // Clear validation error when field is focused
    if (formErrors[fieldName as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const markAsTouched = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand-highlight text-white hover:bg-brand-highlight/90">
          <Plus className="h-4 w-4 mr-2" /> Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Add a new contact to your list. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="list" className="md:text-right font-medium text-brand-accent">
                Add to List
              </Label>
              <div className="md:col-span-3">
                <Select
                  value={selectedListId}
                  onValueChange={setSelectedListId}
                  required
                >
                  <SelectTrigger id="list" className="col-span-3">
                    <SelectValue placeholder="Select a list (required)" />
                  </SelectTrigger>
                  <SelectContent>
                    {listsLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading lists...</span>
                      </div>
                    ) : contactLists?.contactLists?.length ? (
                      contactLists.contactLists.map(list => (
                        <SelectItem key={list.id} value={list.id.toString()}>
                          {list.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-gray-500">No lists available</div>
                    )}
                  </SelectContent>
                </Select>
                {formErrors.listId && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.listId}</p>
                )}
              </div>
            </div>
            
            <div className="px-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Contact Information</h3>
                
                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formErrors.email) {
                          setFormErrors(prev => ({ ...prev, email: undefined }));
                        }
                        setIsTyping(true);
                        setTimeout(() => setIsTyping(false), 500);
                      }}
                      placeholder="contact@example.com"
                      className={cn(
                        "h-10 pl-10",
                        formErrors.email && touchedFields.has('email') && "border-destructive focus:ring-destructive"
                      )}
                      required
                      aria-invalid={formErrors.email && touchedFields.has('email') ? "true" : "false"}
                      onFocus={() => handleFocus('email')}
                      onBlur={() => handleBlur('email')}
                    />
                    <Mail className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>
                  {formErrors.email && touchedFields.has('email') && (
                    <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                  )}
                  <Label htmlFor="email" className="text-xs text-foreground font-medium">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div className="relative">
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          setIsTyping(true);
                          setTimeout(() => setIsTyping(false), 500);
                        }}
                        placeholder="John"
                        className={cn(
                          "h-10 pl-10",
                          formErrors.firstName && touchedFields.has('firstName') && "border-destructive focus:ring-destructive"
                        )}
                        required
                        aria-invalid={formErrors.firstName && touchedFields.has('firstName') ? "true" : "false"}
                        onFocus={() => handleFocus('firstName')}
                        onBlur={() => handleBlur('firstName')}
                      />
                      <User className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    </div>
                    {formErrors.firstName && touchedFields.has('firstName') && (
                      <p className="text-xs text-destructive mt-1">{formErrors.firstName}</p>
                    )}
                    <Label htmlFor="firstName" className="text-xs text-foreground font-medium">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                  </div>

                  <div className="space-y-1">
                    <div className="relative">
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          setIsTyping(true);
                          setTimeout(() => setIsTyping(false), 500);
                        }}
                        placeholder="Doe"
                        className={cn(
                          "h-10 pl-10",
                          formErrors.lastName && touchedFields.has('lastName') && "border-destructive focus:ring-destructive"
                        )}
                        required
                        aria-invalid={formErrors.lastName && touchedFields.has('lastName') ? "true" : "false"}
                        onFocus={() => handleFocus('lastName')}
                        onBlur={() => handleBlur('lastName')}
                      />
                      <User className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    </div>
                    {formErrors.lastName && touchedFields.has('lastName') && (
                      <p className="text-xs text-destructive mt-1">{formErrors.lastName}</p>
                    )}
                    <Label htmlFor="lastName" className="text-xs text-foreground font-medium">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      id="phone"
                      type="text"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setIsTyping(true);
                        setTimeout(() => setIsTyping(false), 500);
                      }}
                      placeholder="+1 (555) 123-4567"
                      className={cn(
                        "h-10 pl-10",
                        formErrors.phone && touchedFields.has('phone') && "border-destructive focus:ring-destructive"
                      )}
                      aria-invalid={formErrors.phone && touchedFields.has('phone') ? "true" : "false"}
                      onFocus={() => handleFocus('phone')}
                      onBlur={() => handleBlur('phone')}
                    />
                    <Phone className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>
                  {formErrors.phone && touchedFields.has('phone') && (
                    <p className="text-xs text-destructive mt-1">{formErrors.phone}</p>
                  )}
                  <Label htmlFor="phone" className="text-xs text-foreground font-medium">
                    Phone Number
                  </Label>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-sm font-medium text-foreground mb-4">Settings</h3>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="relative">
                      <Select 
                        value={status}
                        onValueChange={(val: ContactStatus) => {
                          setStatus(val);
                        }}
                      >
                        <SelectTrigger 
                          id="status"
                          className="h-10 pl-10"
                        >
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                          <SelectItem value="bounced">Bounced</SelectItem>
                        </SelectContent>
                      </Select>
                      <AlertCircle className="h-4 w-4 absolute left-3 top-3 text-muted-foreground z-10" />
                    </div>
                    <Label htmlFor="status" className="text-xs text-foreground font-medium">
                      Contact Status
                    </Label>
                  </div>
                </div>
              </div>

              {validationError && (
                <Alert variant="destructive" className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="px-6 py-4 bg-muted/30 border-t flex justify-end gap-3 sm:gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isPending || isValidating}
                className="h-10"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isPending || isValidating}
                className="bg-brand-highlight text-white hover:bg-brand-highlight/90 h-10"
              >
                {isPending || isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isValidating ? "Validating..." : "Creating..."}
                  </>
                ) : (
                  "Create Contact"
                )}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}