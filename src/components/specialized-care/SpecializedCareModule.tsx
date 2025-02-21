import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Database } from '../../types/supabase';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { CareProfile, CareResource, CareTip, CareTool, CareAssessment } from '../../types/care';

type SpecializedCareProps = {
  recipientType?: string;
  condition?: string;
  profileId?: string;
};

export const SpecializedCareModule: React.FC<SpecializedCareProps> = ({
  recipientType,
  condition,
  profileId
}) => {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<CareResource[]>([]);
  const [tips, setTips] = useState<CareTip[]>([]);
  const [tools, setTools] = useState<CareTool[]>([]);
  const [assessments, setAssessments] = useState<CareAssessment[]>([]);
  const [profile, setProfile] = useState<CareProfile | null>(null);

  useEffect(() => {
    const loadSpecializedCareData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load care profile if profileId is provided
        if (profileId) {
          const { data: profileData, error: profileError } = await supabase
            .from('care_profiles')
            .select('*')
            .eq('id', profileId)
            .single();

          if (profileError) throw profileError;
          setProfile(profileData);
        }

        // Load specialized resources
        const { data: resourceData, error: resourceError } = await supabase
          .from('specialized_care_resources')
          .select('*')
          .eq('condition', condition)
          .order('created_at', { ascending: false });

        if (resourceError) throw resourceError;
        setResources(resourceData);

        // Load care tips
        const { data: tipData, error: tipError } = await supabase
          .from('care_tips')
          .select('*')
          .eq('recipient_type', recipientType)
          .eq('condition', condition)
          .order('created_at', { ascending: false });

        if (tipError) throw tipError;
        setTips(tipData);

        // Load care tools
        const { data: toolData, error: toolError } = await supabase
          .from('care_tools')
          .select('*')
          .contains('recipient_types', [recipientType])
          .contains('conditions', [condition])
          .order('created_at', { ascending: false });

        if (toolError) throw toolError;
        setTools(toolData);

        // Load assessments
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('care_assessments')
          .select('*')
          .eq('recipient_type', recipientType)
          .eq('condition', condition)
          .order('created_at', { ascending: false });

        if (assessmentError) throw assessmentError;
        setAssessments(assessmentData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadSpecializedCareData();
  }, [supabase, recipientType, condition, profileId]);

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

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {profile && (
          <Typography variant="h4" component="h1" gutterBottom>
            Care Plan for {profile.name}
          </Typography>
        )}

        <Grid container spacing={3}>
          {/* Resources Section */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Specialized Resources
                  </Typography>
                  {resources.map((resource) => (
                    <Box key={resource.id} mb={2}>
                      <Typography variant="subtitle1">{resource.title}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {resource.description}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Care Tips Section */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Care Tips
                  </Typography>
                  {tips.map((tip) => (
                    <Box key={tip.id} mb={2}>
                      <Typography variant="subtitle1">{tip.title}</Typography>
                      <Typography variant="body2">{tip.content}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Tools Section */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Care Tools
                  </Typography>
                  {tools.map((tool) => (
                    <Box key={tool.id} mb={2}>
                      <Typography variant="subtitle1">{tool.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {tool.description}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Assessments Section */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Care Assessments
                  </Typography>
                  {assessments.map((assessment) => (
                    <Box key={assessment.id} mb={2}>
                      <Typography variant="subtitle1">{assessment.title}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {assessment.description}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
