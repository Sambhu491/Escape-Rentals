import React from 'react';
import SectionCard from '../SectionCard';
import PlaceholderCard from '../PlaceholderCard';
import { FiHome } from 'react-icons/fi';

const UserPropertiesView = () => {
  return (
    <SectionCard
      title="Host Overview"
      subtitle="Start hosting travelers on EscapeRentals"
    >
      <PlaceholderCard
        title="Become a Host"
        description="You currently don't have host privileges. Switch to a Host account to list, manage, and earn from your properties."
        icon={FiHome}
      />
    </SectionCard>
  );
};

export default UserPropertiesView;
