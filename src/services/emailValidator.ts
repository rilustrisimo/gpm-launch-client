import disposableEmailDomains from 'disposable-email-domains';
import { validate } from 'deep-email-validator';
import api from '@/lib/api';

export interface EmailValidationResult {
  isValid: boolean;
  status: 'Valid' | 'Invalid' | 'Duplicate';
  reason?: string;
}

export interface ContactValidationResult extends EmailValidationResult {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  customFields?: Record<string, any>;
}

export class EmailValidator {
  /**
   * Clean email address by removing quotes, trimming whitespace, and normalizing
   */
  private static cleanEmail(email: string): string {
    if (!email) return '';
    
    // Trim whitespace
    let cleaned = email.trim();
    
    // Remove surrounding quotes (single or double)
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1);
    }
    
    // Remove any remaining quotes at the beginning or end
    cleaned = cleaned.replace(/^["']+|["']+$/g, '');
    
    // Final trim and lowercase
    return cleaned.trim().toLowerCase();
  }

  /**
   * Validate email syntax using regex
   */
  private static validateEmailSyntax(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Check MX record for email domain through API
   */
  private static async checkMxRecord(domain: string): Promise<string> {
    try {
      const response = await api.post('/validate/mx', { domain });
      return response.data.mxRecord;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'MX record check failed');
    }
  }

  /**
   * Check if domain is from a disposable email provider
   */
  private static isDisposableEmail(domain: string): boolean {
    return disposableEmailDomains.includes(domain.toLowerCase());
  }

  /**
   * Check if email appears to be a test email
   */
  private static isTestEmail(email: string): boolean {
    const lowerCaseEmail = email.toLowerCase();
    const testPatterns = [
      'test',
      'sample',
      'example',
      'demo',
      'dummy',
      'temp',
      'fake'
    ];
    return testPatterns.some(pattern => lowerCaseEmail.includes(pattern));
  }

  /**
   * Check for common typos in email domains
   */
  private static checkCommonTypos(email: string): { hasTypo: boolean; suggestion?: string } {
    const commonDomains = {
      'gmail.com': ['gmai.com', 'gmial.com', 'gmal.com', 'gmil.com', 'gamil.com'],
      'yahoo.com': ['yaho.com', 'yahooo.com', 'yhoo.com', 'yaoo.com'],
      'hotmail.com': ['hotmai.com', 'hotmal.com', 'hotmial.com', 'hotamail.com'],
      'outlook.com': ['outlok.com', 'outloo.com', 'outlookk.com']
    };

    const [localPart, domain] = email.toLowerCase().split('@');
    
    for (const [correctDomain, typos] of Object.entries(commonDomains)) {
      if (typos.includes(domain)) {
        return {
          hasTypo: true,
          suggestion: `${localPart}@${correctDomain}`
        };
      }
    }

    return { hasTypo: false };
  }

  /**
   * Check if email already exists in the system
   */
  private static async checkDuplicate(email: string): Promise<boolean> {
    try {
      const response = await api.post('/validate/duplicate', { email });
      return response.data.isDuplicate;
    } catch (error) {
      return false; // Assume not duplicate if check fails
    }
  }

  /**
   * Validate a single email address
   */
  public static async validateEmail(email: string): Promise<EmailValidationResult> {
    try {
      // Clean the email first
      const cleanedEmail = this.cleanEmail(email);
      
      // Step 1: Basic syntax validation
      if (!this.validateEmailSyntax(cleanedEmail)) {
        return {
          isValid: false,
          status: 'Invalid',
          reason: 'Invalid email format'
        };
      }

      const [, domain] = cleanedEmail.split('@');

      // Step 2: Check for test emails
      if (this.isTestEmail(cleanedEmail)) {
        return {
          isValid: false,
          status: 'Invalid',
          reason: 'Test emails are not allowed'
        };
      }

      // Step 3: Check for disposable email providers
      if (this.isDisposableEmail(domain)) {
        return {
          isValid: false,
          status: 'Invalid',
          reason: 'Disposable email providers are not allowed'
        };
      }

      // Step 4: Check for common typos
      const typoCheck = this.checkCommonTypos(cleanedEmail);
      if (typoCheck.hasTypo) {
        return {
          isValid: false,
          status: 'Invalid',
          reason: `Possible typo in email domain. Did you mean ${typoCheck.suggestion}?`
        };
      }

      // Step 5: Check for duplicates
      const isDuplicate = await this.checkDuplicate(cleanedEmail);
      if (isDuplicate) {
        return {
          isValid: false,
          status: 'Duplicate',
          reason: 'Email already exists in the system'
        };
      }

      // Step 6: Check MX record
      try {
        const mxRecord = await this.checkMxRecord(domain);
        return {
          isValid: true,
          status: 'Valid',
          reason: `MX record found: ${mxRecord}`
        };
      } catch (mxErr) {
        return {
          isValid: false,
          status: 'Invalid',
          reason: `MX check failed: ${mxErr}`
        };
      }
    } catch (error: any) {
      return {
        isValid: false,
        status: 'Invalid',
        reason: `Validation error: ${error.message}`
      };
    }
  }

  /**
   * Validate a single email address for import
   */
  public static async validateEmailImport(email: string): Promise<EmailValidationResult> {
    try {
      // Clean the email first
      const cleanedEmail = this.cleanEmail(email);
      
      // Step 1: Basic syntax validation
      if (!this.validateEmailSyntax(cleanedEmail)) {
        return {
          isValid: false,
          status: 'Invalid',
          reason: 'Invalid email format'
        };
      }

      const [, domain] = cleanedEmail.split('@');

      // Step 2: Check for test emails
      if (this.isTestEmail(cleanedEmail)) {
        return {
          isValid: false,
          status: 'Invalid',
          reason: 'Test emails are not allowed'
        };
      }

      // Step 3: Check for disposable email providers
      if (this.isDisposableEmail(domain)) {
        return {
          isValid: false,
          status: 'Invalid',
          reason: 'Disposable email providers are not allowed'
        };
      }

      // Step 4: Check for common typos
      const typoCheck = this.checkCommonTypos(cleanedEmail);
      if (typoCheck.hasTypo) {
        return {
          isValid: false,
          status: 'Invalid',
          reason: `Possible typo in email domain. Did you mean ${typoCheck.suggestion}?`
        };
      }

      // Return a successful validation result
      // This was missing in the original implementation
      return {
        isValid: true,
        status: 'Valid'
      };
    } catch (error: any) {
      return {
        isValid: false,
        status: 'Invalid',
        reason: `Validation error: ${error.message}`
      };
    }
  }

  /**
   * Validate a contact including email and other fields
   */
  public static async validateContact(contact: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    customFields?: Record<string, any>;
  }): Promise<ContactValidationResult> {
    // Clean the email first
    const cleanedEmail = this.cleanEmail(contact.email);
    const cleanedContact = { ...contact, email: cleanedEmail };
    
    // First validate the email
    const emailValidation = await this.validateEmail(cleanedEmail);

    // If email is invalid, return early
    if (!emailValidation.isValid) {
      return {
        ...emailValidation,
        ...cleanedContact
      };
    }

    // Additional contact validation rules could be added here
    // For example, phone number validation, name validation, etc.

    return {
      ...emailValidation,
      ...cleanedContact
    };
  }

    /**
   * Validate a contact including email and other fields for import
   */
    public static async validateContactImport(contact: {
      email: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      customFields?: Record<string, any>;
    }): Promise<ContactValidationResult> {
      // Clean the email first
      const cleanedEmail = this.cleanEmail(contact.email);
      const cleanedContact = { ...contact, email: cleanedEmail };
      
      // First validate the email
      const emailValidation = await this.validateEmailImport(cleanedEmail);
  
      // If email is invalid, return early
      if (!emailValidation.isValid) {
        return {
          ...emailValidation,
          ...cleanedContact
        };
      }
  
      // Additional contact validation rules could be added here
      // For example, phone number validation, name validation, etc.
  
      return {
        ...emailValidation,
        ...cleanedContact
      };
    }

  /**
   * Validate multiple contacts in batch with progress tracking
   */
  public static async validateContacts(
    contacts: Array<{
      email: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      customFields?: Record<string, any>;
    }>,
    onProgress?: (progress: number) => void
  ): Promise<ContactValidationResult[]> {
    const batchSize = 50;
    const results: ContactValidationResult[] = [];
    let processedCount = 0;
    
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, Math.min(i + batchSize, contacts.length));
      const batchResults = await Promise.all(
        batch.map(contact => this.validateContactImport(contact))
      );
      
      results.push(...batchResults);
      processedCount += batch.length;
      
      // Report progress
      if (onProgress) {
        const progress = Math.round((processedCount / contacts.length) * 100);
        onProgress(progress);
      }
      
      // Add a small delay between batches
      if (i + batchSize < contacts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}