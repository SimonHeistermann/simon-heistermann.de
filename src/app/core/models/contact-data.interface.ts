/**
 * Represents the data submitted through a contact form.
 */
export interface ContactData {
    /**
     * The full name of the user submitting the form.
     */
    name: string;
  
    /**
     * The user's email address.
     */
    email: string;
  
    /**
     * The message content provided by the user.
     */
    message: string;
  
    /**
     * Indicates whether the user has agreed to the terms and conditions.
     */
    agreedToTerms: boolean;
}  
