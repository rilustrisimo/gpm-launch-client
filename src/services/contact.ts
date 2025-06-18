import api from '@/lib/api';
import { Contact } from '@/lib/types';
import { EmailValidator } from './emailValidator';

interface ContactsResponse {
  success: boolean;
  contacts: Contact[];
  total: number;
  message?: string;
}

interface ContactResponse {
  success: boolean;
  contact: Contact;
  message?: string;
}

export interface CreateContactDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status?: 'active' | 'unsubscribed' | 'bounced';
  customFields?: Record<string, any>;
  listId?: string;
}

export interface UpdateContactDto extends Partial<CreateContactDto> {}

export interface ImportContactsDto {
  contacts: CreateContactDto[];
  listId?: string;
  onProgress?: (progress: number) => void;
}

export interface ValidationResult {
  validContacts: CreateContactDto[];
  invalidContacts: Array<{
    contact: CreateContactDto;
    reason: string;
  }>;
}

export const contactService = {
  // Get all contacts with pagination
  getContacts: async (search?: string, page = 1, limit = 50): Promise<{ contacts: Contact[], total: number }> => {
    const params = { search, page, limit };
    const response = await api.get<ContactsResponse>('/contacts', { params });
    return {
      contacts: response.data.contacts,
      total: response.data.total
    };
  },
  
  // Get a single contact by ID
  getContact: async (id: number): Promise<Contact> => {
    const response = await api.get<ContactResponse>(`/contacts/${id}`);
    return response.data.contact;
  },
  
  // Create a new contact with validation
  createContact: async (contactData: CreateContactDto): Promise<Contact> => {
    // Validate email before creating contact
    const validationResult = await EmailValidator.validateContact(contactData);
    
    if (!validationResult.isValid) {
      throw new Error(validationResult.reason || 'Invalid email address');
    }
    
    const response = await api.post<ContactResponse>('/contacts', contactData);
    return response.data.contact;
  },
  
  // Update a contact
  updateContact: async (id: number, contactData: UpdateContactDto): Promise<Contact> => {
    // If email is being updated, validate it first
    if (contactData.email) {
      const validationResult = await EmailValidator.validateContact({
        email: contactData.email,
        ...contactData
      });
      
      if (!validationResult.isValid) {
        throw new Error(validationResult.reason || 'Invalid email address');
      }
    }
    
    const response = await api.put<ContactResponse>(`/contacts/${id}`, contactData);
    return response.data.contact;
  },
  
  // Delete a contact
  deleteContact: async (id: number): Promise<void> => {
    await api.delete(`/contacts/${id}`);
  },
  
  // Validate contacts before import
  validateContacts: async (contacts: CreateContactDto[], onProgress?: (progress: number) => void): Promise<ValidationResult> => {
    const validationResults = await EmailValidator.validateContacts(contacts);
    
    const validContacts: CreateContactDto[] = [];
    const invalidContacts: Array<{ contact: CreateContactDto; reason: string }> = [];
    
    validationResults.forEach((result, index) => {
      if (result.isValid) {
        validContacts.push(contacts[index]);
      } else {
        invalidContacts.push({
          contact: contacts[index],
          reason: result.reason || 'Invalid email address'
        });
      }
    });
    
    onProgress?.(validContacts.length / contacts.length);
    
    return { validContacts, invalidContacts };
  },
  
  // Import multiple contacts in batches
  importContacts: async (data: ImportContactsDto): Promise<{ 
    success: boolean; 
    count: number;
    failed: Array<{ contact: CreateContactDto; reason: string }>;
    importSummary: {
      total: number;
      successful: number;
      failed: number;
      failureReasons: Record<string, number>;
    };
  }> => {
    const batchSize = 50; // Increase batch size to 50
    const contacts = data.contacts;
    const totalContacts = contacts.length;
    let importedCount = 0;
    let failedContacts: Array<{ contact: CreateContactDto; reason: string }> = [];
    const failureReasons: Record<string, number> = {};
    
    // Process contacts in batches
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batchContacts = contacts.slice(i, Math.min(i + batchSize, contacts.length));
      
      try {
        // Send batch directly to API
        const response = await api.post('/contacts/import', {
          contacts: batchContacts,
          listId: data.listId
        });
        
        // Update counts
        importedCount += response.data.count || 0;
        
        // Add failed contacts from this batch
        if (response.data.failed && Array.isArray(response.data.failed)) {
          failedContacts = [...failedContacts, ...response.data.failed];
          
          // Track failure reasons
          response.data.failed.forEach(failure => {
            const reason = failure.reason || 'Unknown error';
            failureReasons[reason] = (failureReasons[reason] || 0) + 1;
          });
        }
        
        // Update progress after each batch
        if (data.onProgress) {
          const progress = Math.round(Math.min((i + batchContacts.length) / totalContacts * 100, 100));
          data.onProgress(progress);
        }
        
      } catch (error: any) {
        // Mark all contacts in failed batch as failed
        const errorMessage = error?.response?.data?.message || 'Server error during import';
        const batchFailed = batchContacts.map(contact => ({
          contact,
          reason: errorMessage
        }));
        
        failedContacts = [...failedContacts, ...batchFailed];
        
        // Track the batch error
        failureReasons[errorMessage] = (failureReasons[errorMessage] || 0) + batchContacts.length;
        
        // Still update progress even for failed batches
        if (data.onProgress) {
          const progress = Math.round(Math.min((i + batchContacts.length) / totalContacts * 100, 100));
          data.onProgress(progress);
        }
      }
    }
    
    // Create import summary
    const importSummary = {
      total: totalContacts,
      successful: importedCount,
      failed: failedContacts.length,
      failureReasons
    };
    
    // Final result
    return {
      success: importedCount > 0,
      count: importedCount,
      failed: failedContacts,
      importSummary
    };
  }
};