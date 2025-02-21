import React from 'react';
import { Route } from 'react-router-dom';
import { SpecializedCareModule } from '../components/specialized-care/SpecializedCareModule';
import { ElderCare } from '../components/specialized-care/ElderCare';
import { PediatricCare } from '../components/specialized-care/PediatricCare';
import { PetCare } from '../components/specialized-care/PetCare';
import { PartnerCare } from '../components/specialized-care/PartnerCare';

export const specializedCareRoutes = (
  <Route path="/care" key="specialized-care">
    <Route
      path=""
      element={<SpecializedCareModule />}
    />
    <Route
      path="elderly/:profileId"
      element={<ElderCare />}
    />
    <Route
      path="pediatric/:profileId"
      element={<PediatricCare />}
    />
    <Route
      path="pet/:profileId"
      element={<PetCare />}
    />
    <Route
      path="partner/:profileId"
      element={<PartnerCare />}
    />
  </Route>
);
