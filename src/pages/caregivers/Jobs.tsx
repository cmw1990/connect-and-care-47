import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';

interface CareJob {
  id: string;
  title: string;
  location: string;
  type: 'full-time' | 'part-time' | 'temporary';
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
}

const sampleJobs: CareJob[] = [
  {
    id: '1',
    title: 'Senior Care Companion',
    location: 'San Francisco, CA',
    type: 'full-time',
    salary: '$25-30/hr',
    description: 'Looking for a compassionate caregiver to provide companionship and assistance to elderly clients.',
    requirements: ['2+ years experience', 'Valid driver\'s license', 'CPR certified'],
    postedDate: '2025-02-20',
  },
  {
    id: '2',
    title: 'Dementia Care Specialist',
    location: 'San Jose, CA',
    type: 'part-time',
    salary: '$28-35/hr',
    description: 'Specialized care provider needed for clients with dementia and Alzheimer\'s.',
    requirements: ['3+ years dementia care', 'CNA certification', 'Available weekends'],
    postedDate: '2025-02-19',
  },
];

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredJobs = sampleJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || job.type === selectedType;
    return matchesSearch && matchesType;
  });

  const typeColors = {
    'full-time': 'bg-green-100 text-green-800',
    'part-time': 'bg-blue-100 text-blue-800',
    'temporary': 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Caregiver Job Opportunities
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Find rewarding opportunities to make a difference in people's lives
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="search"
          placeholder="Search jobs by title or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
          icon="search"
        />
        <div className="flex gap-2">
          <Button
            variant={selectedType === 'all' ? 'primary' : 'ghost'}
            onClick={() => setSelectedType('all')}
          >
            All
          </Button>
          <Button
            variant={selectedType === 'full-time' ? 'primary' : 'ghost'}
            onClick={() => setSelectedType('full-time')}
          >
            Full-time
          </Button>
          <Button
            variant={selectedType === 'part-time' ? 'primary' : 'ghost'}
            onClick={() => setSelectedType('part-time')}
          >
            Part-time
          </Button>
        </div>
      </div>

      <motion.div
        className="grid gap-4"
        layout
      >
        {filteredJobs.map(job => (
          <motion.div
            key={job.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
                    <Icon name="location" className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                </div>
                <Badge className={typeColors[job.type]}>
                  {job.type}
                </Badge>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {job.requirements.map((req, index) => (
                  <Badge key={index} variant="outline">
                    {req}
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-lg font-semibold text-primary-600">
                  {job.salary}
                </div>
                <Button>
                  Apply Now
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Jobs;
