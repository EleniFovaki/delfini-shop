import { useState } from 'react';
import { Card, Text, Page, ResourceList, Button, TextField, Modal } from '@shopify/polaris';
import { json } from '@remix-run/node';
import { useLoaderData, useFetcher } from '@remix-run/react';
import dotenv from 'dotenv';

// Loader function to fetch customer data from Shopify
export const loader = async ({ request }) => {
  dotenv.config();
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  const shopifyDomain = process.env.SHOPIFY_DOMAIN;

  // GraphQL query to fetch customers
  const query = `
    {
      customers(first: 10) {
        edges {
          node {
            id
            firstName
            lastName
            email
          }
        }
      }
    }
  `;

  // Fetch customer data from Shopify Admin API
  const response = await fetch(`https://${shopifyDomain}/admin/api/2024-07/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();
  // Return the customer data to the frontend
  return json(result.data.customers.edges.map((edge) => edge.node));
};

// Mutation function to create or update a customer via fetcher
export const action = async ({ request }) => {
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  const shopifyDomain = process.env.SHOPIFY_DOMAIN;

  const formData = await request.formData();
  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const email = formData.get('email');
  const customerId = formData.get('customerId'); // For updating an existing customer

  // Determine if it's an update or create operation
  const mutation = customerId
    ? `
      mutation {
        customerUpdate(input: {
          id: "${customerId}",
          firstName: "${firstName}",
          lastName: "${lastName}",
          email: "${email}"
        }) {
          customer {
            id
            firstName
            lastName
            email
          }
          userErrors {
            field
            message
          }
        }
      }
    `
    : `
      mutation {
        customerCreate(input: {
          firstName: "${firstName}",
          lastName: "${lastName}",
          email: "${email}",
          tags: ["42"]
        }) {
          customer {
            id
            firstName
            lastName
            email
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

  // Fetch mutation to create/update the customer
  const response = await fetch(`https://${shopifyDomain}/admin/api/2024-07/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query: mutation }),
  });

  const result = await response.json();
  if (result.data.customerUpdate?.userErrors.length > 0 || result.data.customerCreate?.userErrors.length > 0) {
    const error = result.data.customerUpdate?.userErrors[0]?.message || result.data.customerCreate?.userErrors[0]?.message;
    return json({ error });
  }

  const customer = result.data.customerUpdate?.customer || result.data.customerCreate?.customer;
  return json(customer);
};

export default function Customers() {
  const customers = useLoaderData();
  const fetcher = useFetcher(); // To handle the customer creation/mutation

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle the customer create logic
  const handleCreateCustomer = () => {
    const firstName = prompt("Enter the customer's first name");
    const lastName = prompt("Enter the customer's last name");
    const email = prompt("Enter the customer's email");

    if (firstName && lastName && email) {
      fetcher.submit(
        { firstName, lastName, email },
        { method: 'post' }
      );
    }
  };

  // Handle input changes in the modal for editing
  const handleInputChange = (field) => (value) => {
    setSelectedCustomer({
      ...selectedCustomer,
      [field]: value,
    });
  };

  // Handle the "Edit" button click
  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true); // Open the modal for editing
  };

  // Handle saving the changes
  const handleSaveChanges = () => {
    fetcher.submit(
      {
        firstName: selectedCustomer.firstName,
        lastName: selectedCustomer.lastName,
        email: selectedCustomer.email,
        customerId: selectedCustomer.id, // Include customerId for update
      },
      { method: 'post' }
    );
    setIsModalOpen(false); // Close the modal after saving
  };

  return (
    <Page title="Customers">
     <ui-title-bar title="Customers">
                <button variant="primary" onClick={handleCreateCustomer}>Create a new customer</button>
            </ui-title-bar>
      <Card>
        <ResourceList
          resourceName={{ singular: 'customer', plural: 'customers' }}
          items={customers}
          renderItem={(customer) => {
            const { id, firstName, lastName, email } = customer;
            const fullName = `${firstName} ${lastName}`;

            return (
              <ResourceList.Item
                id={id}
                accessibilityLabel={`View details for ${fullName}`}
              >
                <h3>
                  <Text variation="strong">{fullName}</Text>
                </h3>
                <div>{email}</div>
				<div>
                <Button variant="plain" fullWidth textAlign="right" onClick={() => handleEditClick(customer)}>Edit</Button>
                </div>

              </ResourceList.Item>
            );
          }}
        />
      </Card>

      {/* Modal for editing customer */}
      {selectedCustomer && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Edit Customer"
          primaryAction={{
            content: 'Save',
            onAction: handleSaveChanges,
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setIsModalOpen(false),
            },
          ]}
        >
          <Modal.Section>
            <TextField
              label="First Name"
              value={selectedCustomer.firstName}
              onChange={handleInputChange('firstName')}
            />
            <TextField
              label="Last Name"
              value={selectedCustomer.lastName}
              onChange={handleInputChange('lastName')}
            />
            <TextField
              label="Email"
              value={selectedCustomer.email}
              onChange={handleInputChange('email')}
            />
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}
