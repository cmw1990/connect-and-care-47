import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().min(0, 'Stock must be non-negative'),
  sku: z.string().min(1, 'SKU is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  specifications: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  ),
  status: z.enum(['active', 'inactive', 'out_of_stock']),
  tags: z.array(z.string()),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      status: 'active',
      specifications: [],
      tags: [],
      images: [],
    },
  });

  const [specifications, setSpecifications] = React.useState(
    product?.specifications || [{ key: '', value: '' }]
  );

  const [tags, setTags] = React.useState<string[]>(product?.tags || []);

  const handleAddSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const handleRemoveSpecification = (index: number) => {
    const newSpecs = specifications.filter((_, i) => i !== index);
    setSpecifications(newSpecs);
    setValue('specifications', newSpecs);
  };

  const handleSpecificationChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const newSpecs = specifications.map((spec, i) =>
      i === index ? { ...spec, [field]: value } : spec
    );
    setSpecifications(newSpecs);
    setValue('specifications', newSpecs);
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
            <option value="health">Health</option>
            <option value="wellness">Wellness</option>
            <option value="medical">Medical</option>
            <option value="equipment">Equipment</option>
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

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stock
          </label>
          <Input
            type="number"
            {...register('stock', { valueAsNumber: true })}
            className="mt-1"
            error={errors.stock?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            SKU
          </label>
          <Input
            {...register('sku')}
            className="mt-1"
            error={errors.sku?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <Select {...register('status')} className="mt-1">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out of Stock</option>
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
          initialImages={product?.images || []}
          onUpload={handleImageUpload}
          maxImages={5}
        />
        {errors.images && (
          <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Specifications
        </label>
        <div className="space-y-2">
          {specifications.map((spec, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Key"
                value={spec.key}
                onChange={(e) =>
                  handleSpecificationChange(index, 'key', e.target.value)
                }
              />
              <Input
                placeholder="Value"
                value={spec.value}
                onChange={(e) =>
                  handleSpecificationChange(index, 'value', e.target.value)
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleRemoveSpecification(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddSpecification}
          >
            Add Specification
          </Button>
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
          {isSubmitting ? 'Saving...' : product ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
