import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { CheckboxField, SelectField, InputField } from '@/components/Common/FormFields';
import { pagesOptions, permissionOptions } from '@/config/pages';

type RoleFormValues = {
  name: string;
  permissions?: Record<string, string>;
  accessible_pages?: Record<string, boolean>;
  __global_permission?: string;
};

interface RoleFormProps {
  onSubmit: (values: { name: string; permissions: string; accessible_pages: string }) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  initialValues?: { name?: string; permissions?: any; accessible_pages?: string[] };
}

export function RoleForm({ onSubmit, isSubmitting, onCancel, initialValues }: RoleFormProps) {
  const defaultPermissions: Record<string, string> = {};
  const defaultAccessible: Record<string, boolean> = {};

  if (initialValues?.permissions) {
    const perms = typeof initialValues.permissions === 'string' ? JSON.parse(initialValues.permissions || '{}') : initialValues.permissions || {};
    pagesOptions.forEach(p => {
      defaultPermissions[p.key] = perms[p.key] || 'read';
    });
  } else {
    pagesOptions.forEach(p => (defaultPermissions[p.key] = 'read'));
  }

  if (initialValues?.accessible_pages) {
    pagesOptions.forEach(p => {
      defaultAccessible[p.key] = (initialValues.accessible_pages || []).includes(p.key);
    });
  } else {
    pagesOptions.forEach(p => (defaultAccessible[p.key] = false));
  }

  const form = useForm<RoleFormValues>({
    defaultValues: {
      name: initialValues?.name || '',
      permissions: defaultPermissions,
      accessible_pages: defaultAccessible,
      __global_permission: undefined,
    }
  });

  const { setValue, getValues, watch } = form;

  const handleSelectAllPages = (checked: boolean) => {
    pagesOptions.forEach(p => setValue(`accessible_pages.${p.key}`, checked));
  };

  const handleSetAllPermissions = (perm: string) => {
    pagesOptions.forEach(p => setValue(`permissions.${p.key}`, perm));
  };

  const handleSubmit = (vals: RoleFormValues) => {
    const permissionsObj: Record<string, string> = {};
    const pages: string[] = [];

    pagesOptions.forEach(p => {
      const include = vals.accessible_pages?.[p.key];
      if (include) {
        pages.push(p.key);
        const perm = vals.permissions?.[p.key] || 'read';
        permissionsObj[p.key] = perm;
      }
    });

    onSubmit({
      name: vals.name,
      permissions: JSON.stringify(permissionsObj),
      accessible_pages: pages.join(','),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <InputField form={form} name="name" label="Role Name" placeholder="Manager" />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Accessible Pages & Permissions</label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-sm">
                <input type="checkbox" onChange={(e) => handleSelectAllPages(e.target.checked)} />
                <span>Select all pages</span>
              </label>
              <div className="flex items-center space-x-2">
                <SelectField
                  form={form}
                  name={`__global_permission`}
                  label=""
                  options={permissionOptions}
                  placeholder="Set all permissions"
                />
                <button
                  type="button"
                  className="px-3 py-1 rounded border bg-gray-50 text-sm"
                  onClick={() => {
                    const val = getValues('__global_permission') as any;
                    if (val) handleSetAllPermissions(val as string);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pagesOptions.map((p) => {
              const checked = watch(`accessible_pages.${p.key}`);
              return (
                <div key={p.key} className="flex items-center space-x-2 p-2 border rounded">
                  <CheckboxField form={form} name={`accessible_pages.${p.key}`} label={p.label} />
                  <div className="flex-1">
                    <SelectField
                      form={form}
                      name={`permissions.${p.key}`}
                      label="Permission"
                      options={permissionOptions}
                      placeholder="Select permission"
                      // disable permission when page not checked
                      disabled={!checked}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Role'}</Button>
        </div>
      </form>
    </Form>
  );
}

export default RoleForm;
