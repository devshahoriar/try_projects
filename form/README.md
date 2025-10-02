# Comprehensive React Form Library

A production-ready, type-safe form library built on top of React Hook Form, Zod validation, and Radix UI components. This library provides a complete set of form components with built-in validation, error handling, and accessibility features.

## ✨ Features

- **🔒 Type Safety**: Full TypeScript support with Zod schema validation
- **📋 Complete Form Components**: 10+ pre-built form field components
- **🎯 Smart Validation**: Real-time validation with custom error messages
- **♿ Accessible**: Built on Radix UI primitives for full accessibility
- **🎨 Customizable**: Tailwind CSS styling with shadcn/ui components
- **📱 Responsive**: Mobile-first design with responsive layouts
- **🔄 Advanced Features**: Multi-step forms, array fields, and conditional validation
- **⚡ Performance**: Optimized renders with React Hook Form
- **🌙 Theme Support**: Dark/light mode compatible

## 🚀 Quick Start

### Installation

```bash
pnpm install
# or
npm install
# or
yarn install
```

### Basic Usage

```tsx
import Form from '@/components/form/Form';
import { z } from 'zod';

// Define your schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormType = z.infer<typeof loginSchema>;

// Create your form
function LoginForm() {
  const handleSubmit = (data: LoginFormType) => {
    console.log('Form data:', data);
  };

  return (
    <Form
      schema={loginSchema}
      initialValues={{ email: '', password: '' }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <Form.Input name="email" label="Email" placeholder="Enter your email" />
      <Form.Password name="password" label="Password" placeholder="Enter your password" />
      
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        Login
      </button>
    </Form>
  );
}
```

## 📚 Available Components

### Core Form Component

The `<Form>` component is the foundation that provides context and validation:

```tsx
<Form
  schema={yourZodSchema}
  initialValues={defaultValues}
  onSubmit={handleSubmit}
  mode="onChange" // or "onSubmit", "onBlur"
  resetOnSubmit={false}
  className="space-y-4"
>
  {/* Your form fields */}
</Form>
```

### Form Fields

#### 1. Text Input
```tsx
<Form.Input 
  name="firstName" 
  label="First Name" 
  placeholder="Enter first name"
  type="text" // or "email", "url", etc.
/>
```

#### 2. Password Field
Advanced password input with strength indicator and visibility toggle:
```tsx
<Form.Password 
  name="password" 
  label="Password" 
  placeholder="Enter password"
/>
```

#### 3. Text Area
```tsx
<Form.TextArea 
  name="description" 
  label="Description" 
  placeholder="Enter description"
  rows={4}
/>
```

#### 4. Select Dropdown
```tsx
<Form.Select 
  name="country" 
  label="Country" 
  placeholder="Select country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
/>
```

#### 5. Date Picker
```tsx
<Form.DatePicker 
  name="birthDate" 
  label="Birth Date" 
  placeholder="Pick a date"
  dateDisabled={[
    { before: new Date() } // Disable past dates
  ]}
/>
```

#### 6. Checkbox
```tsx
<Form.Checkbox 
  name="agreeToTerms" 
  label="I agree to the terms and conditions"
/>
```

#### 7. Radio Group
```tsx
<Form.RadioGroup 
  name="gender" 
  label="Gender"
  options={[
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ]}
/>
```

#### 8. Switch/Toggle
```tsx
<Form.Switch 
  name="notifications" 
  label="Enable notifications"
  description="Receive email notifications"
/>
```

#### 9. Slider
```tsx
<Form.Slider 
  name="experience" 
  label="Years of Experience"
  min={0}
  max={20}
  step={1}
/>
```

#### 10. Array Fields
Dynamic array fields with add/remove functionality:
```tsx
<Form.Array name="skills">
  {({ fields, append, remove }) => (
    <>
      <Label>Skills</Label>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <Form.Input 
            name={`skills.${index}`} 
            placeholder="Enter skill"
          />
          <Button type="button" onClick={() => remove(index)}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" onClick={() => append("")}>
        Add Skill
      </Button>
    </>
  )}
</Form.Array>
```

## 🔧 Advanced Features

### Multi-Step Forms

Use the built-in Stepper component for multi-step forms:

```tsx
import { Stapper } from '@/components/Stepper';

<Form schema={schema} initialValues={initialValues} onSubmit={handleSubmit}>
  <Stapper onComplete={() => submitForm()}>
    <Stapper.Step title="Personal Information">
      <Form.Input name="firstName" label="First Name" />
      <Form.Input name="lastName" label="Last Name" />
    </Stapper.Step>
    
    <Stapper.Step title="Contact Information">
      <Form.Input name="email" label="Email" type="email" />
      <Form.Input name="phone" label="Phone" type="tel" />
    </Stapper.Step>
    
    <Stapper.Step title="Review">
      {/* Review step content */}
    </Stapper.Step>
  </Stapper>
</Form>
```

### Form Ref and Imperative API

Access form methods using refs:

```tsx
import { useRef } from 'react';
import type { FromRef } from '@/components/form/Form';

function MyComponent() {
  const formRef = useRef<FromRef<FormType>>(null);

  const handleReset = () => {
    formRef.current?.reset();
  };

  const getCurrentValues = () => {
    const values = formRef.current?.getValues();
    console.log('Current values:', values);
  };

  return (
    <Form ref={formRef} {...otherProps}>
      {/* form fields */}
    </Form>
  );
}
```

### Custom Validation

Create complex validation schemas with Zod:

```tsx
const employeeSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email format'),
  }),
  employment: z.object({
    jobType: z.enum(['Full-time', 'Part-time', 'Contract']),
    salary: z.number().optional(),
  }),
}).superRefine((data, ctx) => {
  // Custom validation logic
  if (data.employment.jobType === 'Full-time' && !data.employment.salary) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Salary is required for full-time employees',
      path: ['employment', 'salary'],
    });
  }
});
```

## 🎨 Theming and Customization

The library uses Tailwind CSS and supports custom theming:

```tsx
// Custom styling
<Form.Input 
  name="email" 
  label="Email"
  className="border-blue-500 focus:border-blue-700"
/>

// Theme provider support
import { ThemeProvider } from '@/components/provider/theme-provider';

<ThemeProvider defaultTheme="system">
  <Form>
    {/* Your form */}
  </Form>
</ThemeProvider>
```

## 📁 Project Structure

```
src/
├── components/
│   ├── form/
│   │   ├── Form.tsx              # Main form component
│   │   ├── TextField.tsx         # Text input field
│   │   ├── PasswordField.tsx     # Password input with strength
│   │   ├── SelectField.tsx       # Dropdown select
│   │   ├── DatePickerField.tsx   # Date picker
│   │   ├── CheckboxField.tsx     # Checkbox input
│   │   ├── RadioGroupField.tsx   # Radio button group
│   │   ├── SwitchField.tsx       # Toggle switch
│   │   ├── SliderField.tsx       # Range slider
│   │   ├── TextAreaField.tsx     # Multi-line text
│   │   └── ArrayField.tsx        # Dynamic array fields
│   ├── ui/                       # Base UI components (shadcn/ui)
│   └── Stepper.tsx              # Multi-step form component
├── lib/
│   └── utils.ts                 # Utility functions
└── styles/
    └── globals.css              # Global styles
```

## 🛠 Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety
- **React Hook Form** - Performant form library
- **Zod** - Schema validation
- **Radix UI** - Accessible primitives
- **Tailwind CSS** - Utility-first styling
- **Next.js 15** - React framework
- **shadcn/ui** - Component library

## 🔧 Development

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd form

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Format code
pnpm format:write
```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format:check` - Check code formatting
- `pnpm format:write` - Format code with Prettier
- `pnpm typecheck` - Run TypeScript compiler

## 📝 Example: Complete Employee Form

```tsx
import Form from '@/components/form/Form';
import { Stapper } from '@/components/Stepper';
import { z } from 'zod';

const employeeSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Phone number is required'),
    birthDate: z.date(),
  }),
  employment: z.object({
    jobTitle: z.string().min(2, 'Job title is required'),
    department: z.string().min(2, 'Department is required'),
    salary: z.number().positive('Salary must be positive'),
    startDate: z.date(),
  }),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

type EmployeeFormType = z.infer<typeof employeeSchema>;

export default function EmployeeForm() {
  const initialValues: EmployeeFormType = {
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: new Date(),
    },
    employment: {
      jobTitle: '',
      department: '',
      salary: 0,
      startDate: new Date(),
    },
    skills: [''],
  };

  const handleSubmit = (data: EmployeeFormType) => {
    console.log('Employee data:', data);
    // Handle form submission
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">New Employee Registration</h1>
      
      <Form
        schema={employeeSchema}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <Stapper>
          <Stapper.Step title="Personal Information">
            <div className="grid grid-cols-2 gap-4">
              <Form.Input 
                name="personalInfo.firstName" 
                label="First Name" 
                placeholder="Enter first name"
              />
              <Form.Input 
                name="personalInfo.lastName" 
                label="Last Name" 
                placeholder="Enter last name"
              />
            </div>
            
            <Form.Input 
              name="personalInfo.email" 
              label="Email" 
              type="email"
              placeholder="Enter email address"
            />
            
            <Form.Input 
              name="personalInfo.phone" 
              label="Phone" 
              type="tel"
              placeholder="Enter phone number"
            />
            
            <Form.DatePicker 
              name="personalInfo.birthDate" 
              label="Birth Date" 
              placeholder="Select birth date"
            />
          </Stapper.Step>

          <Stapper.Step title="Employment Details">
            <Form.Input 
              name="employment.jobTitle" 
              label="Job Title" 
              placeholder="Enter job title"
            />
            
            <Form.Select 
              name="employment.department" 
              label="Department" 
              placeholder="Select department"
              options={[
                { value: 'engineering', label: 'Engineering' },
                { value: 'design', label: 'Design' },
                { value: 'marketing', label: 'Marketing' },
                { value: 'sales', label: 'Sales' },
              ]}
            />
            
            <Form.Slider 
              name="employment.salary" 
              label="Annual Salary (USD)"
              min={30000}
              max={200000}
              step={5000}
            />
            
            <Form.DatePicker 
              name="employment.startDate" 
              label="Start Date" 
              placeholder="Select start date"
            />
          </Stapper.Step>

          <Stapper.Step title="Skills">
            <Form.Array name="skills">
              {({ fields, append, remove }) => (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Skills & Expertise</h3>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Form.Input 
                        name={`skills.${index}`} 
                        placeholder="Enter a skill"
                        className="flex-1"
                      />
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="px-3 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => append('')}
                    className="px-4 py-2 text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                  >
                    Add Skill
                  </button>
                </div>
              )}
            </Form.Array>
          </Stapper.Step>
        </Stapper>
      </Form>
    </div>
  );
}
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions and support, please open an issue on the GitHub repository.

---

Built with ❤️ using React, TypeScript, and modern web technologies.