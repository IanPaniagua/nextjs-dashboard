'use server';
 
// in React, the action attribute is considered a special prop - meaning React builds on top of 
// it to allow actions to be invoked.
// Behind the scenes, Server Actions create a POST API endpoint. This is why you don't 
// need to create API endpoints
//  manually when using Server Actions.

//like this is working the create invoice. It is really interesant how it works.

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

//  type validation
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(), //The amount field is specifically set to coerce (change) from a string to a number while also validating its type.
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  //It's usually good practice to store monetary values in cents in your database to eliminate 
  // JavaScript floating-point errors and ensure greater accuracy.
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
 
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // We'll log the error to the console for now
    console.error(error);
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// UPDATE INVOICE
// Use Zod to update the expected types for the form data

const UpdateInvoice = FormSchema.omit({ id: true, date: true });
export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
    const amountInCents = amount * 100;
 
    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
          `;
      } catch (error) {
        // We'll log the error to the console for now
        console.error(error);
      }
     
      revalidatePath('/dashboard/invoices');
      redirect('/dashboard/invoices');
    }

// DELETE INVOICE
// The deleteInvoice function deletes an invoice from the database by its ID.

  export async function deleteInvoice(id: string) {
    throw new Error('Failed to Delete Invoice'); // This is where Next.js error.tsx file comes in. Ensure that you remove this manually added error after testing and before moving onto the next section.
    
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
  }