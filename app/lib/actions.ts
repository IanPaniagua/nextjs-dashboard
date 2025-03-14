'use server';
 
// in React, the action attribute is considered a special prop - meaning React builds on top of 
// it to allow actions to be invoked.
// Behind the scenes, Server Actions create a POST API endpoint. This is why you don't 
// need to create API endpoints
//  manually when using Server Actions.

export async function createInvoice(formData: FormData) {
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  };
  // Test it out:
  console.log(rawFormData);
}