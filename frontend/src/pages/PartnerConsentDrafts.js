import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { AddIcon, ViewIcon } from '@chakra-ui/icons';
import ConsentDraftForm from '../components/ConsentDraftForm';
import ConsentDraftList from '../components/ConsentDraftList';

const PartnerConsentDrafts = () => {
  const [virtualUserId, setVirtualUserId] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const toast = useToast();

  // In a real application, you would fetch the virtual user ID from a dropdown or search
  // For this example, we'll use a hardcoded value
  const handleSetVirtualUserId = () => {
    // This would typically come from a form or selection
    setVirtualUserId('60f1a5c5e6b3f32d8c9e4b7a'); // Example ID
    toast({
      title: 'Virtual User Selected',
      description: 'You can now create consent drafts for this user.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleConsentCreated = () => {
    // Switch to the list tab after creating a consent
    setTabIndex(1);
    toast({
      title: 'Success',
      description: 'Consent has been created successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={5}>
      <Heading as="h1" size="xl" mb={2}>Consent Draft Management</Heading>
      <Text color="gray.600" mb={5}>
        Create, validate, and manage consent drafts for your users
      </Text>

      {!virtualUserId ? (
        <Alert status="info" mb={5}>
          <AlertIcon />
          <Box>
            <AlertTitle>Select a Virtual User</AlertTitle>
            <AlertDescription>
              You need to select a virtual user before creating consent drafts.
            </AlertDescription>
          </Box>
          <Spacer />
          <Button colorScheme="blue" onClick={handleSetVirtualUserId}>
            Select User
          </Button>
        </Alert>
      ) : (
        <Tabs isFitted variant="enclosed" index={tabIndex} onChange={(index) => setTabIndex(index)} mb={5}>
          <TabList mb="1em">
            <Tab><AddIcon mr={2} /> Create Draft</Tab>
            <Tab><ViewIcon mr={2} /> View Drafts</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <ConsentDraftForm 
                virtualUserId={virtualUserId} 
                onSuccess={handleConsentCreated} 
              />
            </TabPanel>
            <TabPanel>
              <ConsentDraftList virtualUserId={virtualUserId} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}

      <Divider my={5} />

      <Box bg="blue.50" p={4} borderRadius="md" mt={5}>
        <Heading as="h3" size="md" mb={2}>About Consent Drafts</Heading>
        <Text>
          Consent drafts allow partners to create and validate consent requests before sending them to users.
          The validation process ensures compliance with India's DPDP Act and other privacy regulations.
        </Text>
        <Text mt={2}>
          The workflow includes purpose classification, field normalization, rule validation, and LLM-based justification validation.
          Only validated drafts can be finalized and sent to users for approval.
        </Text>
      </Box>
    </Container>
  );
};

export default PartnerConsentDrafts;