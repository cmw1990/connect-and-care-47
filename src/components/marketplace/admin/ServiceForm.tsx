import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';

const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  duration: z.number().min(1, 'Duration must be positive'),
  durationUnit: z.enum(['minutes', 'hours', 'days']),
  availability: z.array(
    z.object({
      day: z.string(),
      startTime: z.string(),
      endTime: z.string(),
    })
  ),
  images: z.array(z.string()),
  requirements: z.array(z.string()),
  status: z.enum(['active', 'inactive', 'unavailable']),
  tags: z.array(z.string()),
  providerRequirements: z.array(z.string()),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  service?: ServiceFormData;
  onSubmit: (data: ServiceFormData) => void;
  onCancel: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service || {
      status: 'active',
      durationUnit: 'minutes',
      availability: [],
      requirements: [],
      tags: [],
      images: [],
      providerRequirements: [],
    },
  });

  const [availability, setAvailability] = React.useState(
    service?.availability || []
  );
  const [requirements, setRequirements] = React.useState<string[]>(
    service?.requirements || []
  );
  const [tags, setTags] = React.useState<string[]>(service?.tags || []);
  const [providerRequirements, setProviderRequirements] = React.useState<
    string[]
  >(service?.providerRequirements || []);

  const handleAddAvailability = () => {
    const newAvailability = [
      ...availability,
      { day: 'monday', startTime: '09:00', endTime: '17:00' },
    ];
    setAvailability(newAvailability);
    setValue('availability', newAvailability);
  };

  const handleRemoveAvailability = (index: number) => {
    const newAvailability = availability.filter((_, i) => i !== index);
    setAvailability(newAvailability);
    setValue('availability', newAvailability);
  };

  const handleAvailabilityChange = (
    index: number,
    field: 'day' | 'startTime' | 'endTime',
    value: string
  ) => {
    const newAvailability = availability.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    );
    setAvailability(newAvailability);
    setValue('availability', newAvailability);
  };

  const handleAddRequirement = (requirement: string) => {
    const newRequirements = [...requirements, requirement];
    setRequirements(newRequirements);
    setValue('requirements', newRequirements);
  };

  const handleRemoveRequirement = (requirement: string) => {
    const newRequirements = requirements.filter((r) => r !== requirement);
    setRequirements(newRequirements);
    setValue('requirements', newRequirements);
  };

  const handleAddTag = (tag: string) => {
    const newTags = [...tags, tag];
    setTags(newTags);
    setValue('tags', newTags);
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const handleAddProviderRequirement = (requirement: string) => {
    const newRequirements = [...providerRequirements, requirement];
    setProviderRequirements(newRequirements);
    setValue('providerRequirements', newRequirements);
  };

  const handleRemoveProviderRequirement = (requirement: string) => {
    const newRequirements = providerRequirements.filter((r) => r !== requirement);
    setProviderRequirements(newRequirements);
    setValue('providerRequirements', newRequirements);
  };

  const handleImageUpload = (urls: string[]) => {
    setValue('images', urls);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            {...register('name')}
            className="mt-1"
            error={errors.name?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <Select {...register('category')} className="mt-1">
            <option value="healthcare">Healthcare</option>
            <option value="therapy">Therapy</option>
            <option value="wellness">Wellness</option>
            <option value="consultation">Consultation</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <Input
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            className="mt-1"
            error={errors.price?.message}
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Duration
            </label>
            <Input
              type="number"
              {...register('duration', { valueAsNumber: true })}
              className="mt-1"
              error={errors.duration?.message}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Unit
            </label>
            <Select {...register('durationUnit')} className="mt-1">
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <Select {...register('status')} className="mt-1">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="unavailable">Unavailable</option>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          {...register('description')}
          rows={4}
          className="mt-1"
          error={errors.description?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Images
        </label>
        <ImageUpload
          initialImages={service?.images || []}
          onUpload={handleImageUpload}
          maxImages={5}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Availability
        </label>
        <div className="space-y-2">
          {availability.map((slot, index) => (
            <div key={index} className="flex gap-2">
              <Select
                value={slot.day}
                onChange={(e) =>
                  handleAvailabilityChange(index, 'day', e.target.value)
                }
              >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </Select>
              <Input
                type="time"
                value={slot.startTime}
                onChange={(e) =>
                  handleAvailabilityChange(index, 'startTime', e.target.value)
                }
              />
              <Input
                type="time"
                value={slot.endTime}
                onChange={(e) =>
                  handleAvailabilityChange(index, 'endTime', e.target.value)
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleRemoveAvailability(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddAvailability}
          >
            Add Availability
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Requirements
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {requirements.map((requirement) => (
            <div
              key={requirement}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center gap-1"
            >
              <span>{requirement}</span>
              <button
                type="button"
                onClick={() => handleRemoveRequirement(requirement)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Input
            placeholder="Add requirement and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (value && !requirements.includes(value)) {
                  handleAddRequirement(value);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Provider Requirements
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {providerRequirements.map((requirement) => (
            <div
              key={requirement}
              className="bg-green-100 text-green-800 px-2 py-1 rounded-md flex items-center gap-1"
            >
              <span>{requirement}</span>
              <button
                type="button"
                onClick={() => handleRemoveProviderRequirement(requirement)}
                className="text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Input
            placeholder="Add provider requirement and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (value && !providerRequirements.includes(value)) {
                  handleAddProviderRequirement(value);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center gap-1"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Input
            placeholder="Add tag and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (value && !tags.includes(value)) {
                  handleAddTag(value);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : service ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
