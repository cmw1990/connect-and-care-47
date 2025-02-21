import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';

const providerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  businessName: z.string().min(1, 'Business name is required'),
  taxId: z.string().min(1, 'Tax ID is required'),
  businessType: z.string().min(1, 'Business type is required'),
  description: z.string().min(1, 'Description is required'),
  profileImage: z.string().optional(),
  qualifications: z.array(
    z.object({
      name: z.string(),
      issuedBy: z.string(),
      issueDate: z.string(),
      expiryDate: z.string(),
      documentUrl: z.string(),
    })
  ),
  bankInfo: z.object({
    accountName: z.string(),
    accountNumber: z.string(),
    bankName: z.string(),
    routingNumber: z.string(),
  }),
  serviceAreas: z.array(z.string()),
  specialties: z.array(z.string()),
  languages: z.array(z.string()),
  availability: z.array(
    z.object({
      day: z.string(),
      startTime: z.string(),
      endTime: z.string(),
    })
  ),
  status: z.enum(['active', 'pending', 'suspended', 'inactive']),
});

type ProviderFormData = z.infer<typeof providerSchema>;

interface ProviderFormProps {
  provider?: ProviderFormData;
  onSubmit: (data: ProviderFormData) => void;
  onCancel: () => void;
}

export const ProviderForm: React.FC<ProviderFormProps> = ({
  provider,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: provider || {
      status: 'pending',
      qualifications: [],
      serviceAreas: [],
      specialties: [],
      languages: [],
      availability: [],
    },
  });

  const [qualifications, setQualifications] = React.useState(
    provider?.qualifications || []
  );
  const [serviceAreas, setServiceAreas] = React.useState<string[]>(
    provider?.serviceAreas || []
  );
  const [specialties, setSpecialties] = React.useState<string[]>(
    provider?.specialties || []
  );
  const [languages, setLanguages] = React.useState<string[]>(
    provider?.languages || []
  );
  const [availability, setAvailability] = React.useState(
    provider?.availability || []
  );

  const handleAddQualification = () => {
    const newQualification = {
      name: '',
      issuedBy: '',
      issueDate: '',
      expiryDate: '',
      documentUrl: '',
    };
    setQualifications([...qualifications, newQualification]);
    setValue('qualifications', [...qualifications, newQualification]);
  };

  const handleRemoveQualification = (index: number) => {
    const newQualifications = qualifications.filter((_, i) => i !== index);
    setQualifications(newQualifications);
    setValue('qualifications', newQualifications);
  };

  const handleQualificationChange = (
    index: number,
    field: keyof (typeof qualifications)[0],
    value: string
  ) => {
    const newQualifications = qualifications.map((qual, i) =>
      i === index ? { ...qual, [field]: value } : qual
    );
    setQualifications(newQualifications);
    setValue('qualifications', newQualifications);
  };

  const handleAddAvailability = () => {
    const newAvailability = {
      day: 'monday',
      startTime: '09:00',
      endTime: '17:00',
    };
    setAvailability([...availability, newAvailability]);
    setValue('availability', [...availability, newAvailability]);
  };

  const handleRemoveAvailability = (index: number) => {
    const newAvailability = availability.filter((_, i) => i !== index);
    setAvailability(newAvailability);
    setValue('availability', newAvailability);
  };

  const handleAvailabilityChange = (
    index: number,
    field: keyof (typeof availability)[0],
    value: string
  ) => {
    const newAvailability = availability.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    );
    setAvailability(newAvailability);
    setValue('availability', newAvailability);
  };

  const handleImageUpload = (url: string) => {
    setValue('profileImage', url);
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
            Email
          </label>
          <Input
            type="email"
            {...register('email')}
            className="mt-1"
            error={errors.email?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <Input
            {...register('phone')}
            className="mt-1"
            error={errors.phone?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business Name
          </label>
          <Input
            {...register('businessName')}
            className="mt-1"
            error={errors.businessName?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tax ID
          </label>
          <Input
            {...register('taxId')}
            className="mt-1"
            error={errors.taxId?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business Type
          </label>
          <Select {...register('businessType')} className="mt-1">
            <option value="individual">Individual</option>
            <option value="llc">LLC</option>
            <option value="corporation">Corporation</option>
            <option value="partnership">Partnership</option>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <Input
          {...register('address')}
          className="mt-1"
          error={errors.address?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Profile Image
        </label>
        <ImageUpload
          initialImage={provider?.profileImage}
          onUpload={handleImageUpload}
          maxImages={1}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Qualifications
        </label>
        <div className="space-y-2">
          {qualifications.map((qual, index) => (
            <div key={index} className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Qualification Name"
                value={qual.name}
                onChange={(e) =>
                  handleQualificationChange(index, 'name', e.target.value)
                }
              />
              <Input
                placeholder="Issued By"
                value={qual.issuedBy}
                onChange={(e) =>
                  handleQualificationChange(index, 'issuedBy', e.target.value)
                }
              />
              <Input
                type="date"
                value={qual.issueDate}
                onChange={(e) =>
                  handleQualificationChange(index, 'issueDate', e.target.value)
                }
              />
              <Input
                type="date"
                value={qual.expiryDate}
                onChange={(e) =>
                  handleQualificationChange(index, 'expiryDate', e.target.value)
                }
              />
              <div className="col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleRemoveQualification(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddQualification}
          >
            Add Qualification
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Bank Information
        </label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register('bankInfo.accountName')}
            placeholder="Account Name"
          />
          <Input
            {...register('bankInfo.accountNumber')}
            placeholder="Account Number"
          />
          <Input
            {...register('bankInfo.bankName')}
            placeholder="Bank Name"
          />
          <Input
            {...register('bankInfo.routingNumber')}
            placeholder="Routing Number"
          />
        </div>
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
          Status
        </label>
        <Select {...register('status')} className="mt-1">
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : provider ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
