import React from "react";

type AuthFormProps = {
  title: string;
  fields: {
    name: string;
    label: string;
    type: string;
    placeholder?: string;
  }[];
  btnText: string;
  onSubmit: (data: Record<string, string>) => void;
  errorMessage?: string;
  onPasswordChange?: (value: string) => void;
};

export const AuthForm = ({
  title,
  fields,
  btnText,
  onSubmit,
  errorMessage,
  onPasswordChange,
}: AuthFormProps) => {
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-5xl p-2 rounded-xl  ">
      <div
        className="w-[400px] p-10 rounded-xl shadow-xl bg-white rounded-2xl border-white
          shadow-xl p-10 border 
      
          transition-all duration-300 ease-out
          transform-gpu
      
          hover:-translate-y-2
          hover:scale-[1.08]
          hover:shadow-2xl">
        <h2 className="text-3xl font-bold mb-5 text-center text-gray-800 ">
          {title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-2">
          {fields.map((field) => (
            <div key={field.name} className="text-left mb-3">
              <label className="block font-semibold mb-1 text-gray-700">
                {field.label}
              </label>

              {field.type === "password" ? (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name={field.name}
                    placeholder={field.placeholder}
                    onChange={(e) => {
                      handleChange(e);
                      onPasswordChange?.(e.target.value);
                    }}
                    className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 shadow-sm transition
                    ${
                      errorMessage
                        ? "border-red-400 focus:ring-red-300"
                        : "border-purple-950 focus:ring-purple-500"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-600">
                    {showPassword ? "👀" : "🙈"}
                  </button>
                </div>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              )}
            </div>
          ))}

          {/* ✅ reserved space — NO layout jump */}
          <p className="text-sm text-red-600 mt-1 min-h-[22px]"></p>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-950 text-white p-3 rounded-lg transition shadow-md font-semibold">
            {btnText}
          </button>
        </form>
      </div>
    </div>
  );
};
