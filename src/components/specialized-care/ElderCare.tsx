import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Box, Container, Typography, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { Database } from '../../types/supabase';
import { CareProfile, ConditionCarePlan } from '../../types/care';

export const ElderCare: React.FC = () => {
  const { profileId } = useParams();
  const supabase = useSupabaseClient<Database>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CareProfile | null>(null);
  const [carePlan, setCarePlan] = useState<ConditionCarePlan | null>(null);

  useEffect(() => {
    const loadElderCareData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load care profile
        const { data: profileData, error: profileError } = await supabase
          .from('care_profiles')
          .select('*')
          .eq('id', profileId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Load care plan
        const { data: planData, error: planError } = await supabase
          .from('condition_care_plans')
          .select('*')
          .eq('profile_id', profileId)
          .single();

        if (planError) throw planError;
        setCarePlan(planData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      loadElderCareData();
    }
  }, [supabase, profileId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!profile) {
    return (
      <Alert severity="warning">
        Care profile not found
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Elder Care Plan: {profile.name}
        </Typography>

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box>
                    <Typography variant="subtitle1">Age Group</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {profile.age_group}
                    </Typography>
                  </Box>
                  <Box mt={2}>
                    <Typography variant="subtitle1">Mobility Status</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {profile.mobility_status}
                    </Typography>
                  </Box>
                  <Box mt={2}>
                    <Typography variant="subtitle1">Medical Conditions</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {profile.specialized_conditions.join(', ')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Care Plan */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Care Plan
                  </Typography>
                  {carePlan && (
                    <>
                      <Box>
                        <Typography variant="subtitle1">Goals</Typography>
                        <ul>
                          {carePlan.care_plan.goals.map((goal, index) => (
                            <li key={index}>
                              <Typography variant="body2">{goal}</Typography>
                            </li>
                          ))}
                        </ul>
                      </Box>
                      <Box mt={2}>
                        <Typography variant="subtitle1">Medications</Typography>
                        {carePlan.medications.map((med, index) => (
                          <Box key={index} mt={1}>
                            <Typography variant="body2">
                              {med.name} - {med.dosage} ({med.frequency})
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Emergency Contacts */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Emergency Contacts
                  </Typography>
                  {profile.emergency_contacts.map((contact, index) => (
                    <Box key={index} mt={index > 0 ? 2 : 0}>
                      <Typography variant="subtitle1">{contact.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {contact.relationship}
                      </Typography>
                      <Typography variant="body2">
                        {contact.phone}
                      </Typography>
                      {contact.email && (
                        <Typography variant="body2">
                          {contact.email}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Care Preferences */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Care Preferences
                  </Typography>
                  <Box>
                    <Typography variant="subtitle1">Communication</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {profile.care_preferences.communication.join(', ')}
                    </Typography>
                  </Box>
                  <Box mt={2}>
                    <Typography variant="subtitle1">Dietary Preferences</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {profile.care_preferences.dietary.join(', ')}
                    </Typography>
                  </Box>
                  <Box mt={2}>
                    <Typography variant="subtitle1">Activities</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {profile.care_preferences.activities.join(', ')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
