import { Link } from "react-router-dom";
import Button from "@/components/common/Button.jsx";
import Input from "@/components/common/Input.jsx";
import Logo from "@/components/branding/Logo.jsx";
import Textarea from "@/components/ui/Textarea.jsx";

export default function AuthFormCard({
  title,
  description,
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel,
  footerText,
  footerLinkText,
  footerHref,
  isPending,
  errorMessage,
  headerContent,
  formFooter,
  footerContent,
}) {
  return (
    <div className="surface rounded-[2rem] p-8 md:p-10">
      <Logo />
      <h1 className="mt-10 text-3xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
      {headerContent ? <div className="mt-6">{headerContent}</div> : null}

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        {fields.map((field) => (
          <div key={field.name}>
            <label className="mb-2 block text-sm font-medium text-slate-700">{field.label}</label>
            {field.type === "textarea" ? (
              <Textarea
                name={field.name}
                placeholder={field.placeholder}
                value={values[field.name]}
                onChange={onChange}
                maxLength={field.maxLength}
                error={field.error}
              />
            ) : (
              <Input
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={values[field.name]}
                onChange={onChange}
                error={field.error}
              />
            )}
            {field.helperText ? <p className="mt-2 text-xs text-slate-500">{field.helperText}</p> : null}
          </div>
        ))}

        <Button type="submit" className="mt-4 w-full" disabled={isPending}>
          {isPending ? "Please wait..." : submitLabel}
        </Button>
        {formFooter ? <div>{formFooter}</div> : null}
      </form>

      {errorMessage ? <p className="mt-4 text-sm text-rose-600">{errorMessage}</p> : null}

      {footerContent ? (
        <div className="mt-6 text-sm text-slate-500">{footerContent}</div>
      ) : (
        <p className="mt-6 text-sm text-slate-500">
          {footerText}{" "}
          <Link to={footerHref} className="font-semibold text-brand-600">
            {footerLinkText}
          </Link>
        </p>
      )}
    </div>
  );
}
