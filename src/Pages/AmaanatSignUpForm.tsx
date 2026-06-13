import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface FormData {
  name: string;
  aims_number: string;
  jamaat: string;
  phone_number: string;
}

export default function AmaanatSignUpForm() {
  const {
    register,
    handleSubmit,
    setFocus,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      aims_number: "",
      jamaat: "",
      phone_number: "",
    },
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addUserMutation = useMutation(api.amaanat.mutations.addAmaanatUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const prefilledAimsNumber = searchParams.get("aims")?.trim() ?? "";

  useEffect(() => {
    if (prefilledAimsNumber.length === 0) {
      return;
    }

    setValue("aims_number", prefilledAimsNumber, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setFocus("name");
  }, [prefilledAimsNumber, setFocus, setValue]);

  async function handleSignUpUser(data: FormData) {
    setIsSubmitting(true);
    try {
      const newUser = await addUserMutation({
        name: data.name,
        aims_number: data.aims_number || undefined,
        jamaat: data.jamaat || undefined,
        phone_number: data.phone_number || undefined,
      });

      toast.success("Successfully created user!", {
        style: {
          background: "green",
          color: "white",
        },
      });

      reset();

      if (newUser?._id) {
        navigate(`/amaanat/${newUser._id}`);
      }
    } catch (error) {
      toast.error("Failed to create user. Please try again.", {
        style: {
          background: "red",
          color: "white",
        },
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg px-2 py-6 ">
      <h1 className="text-3xl font-bold">Sign up amaanat user</h1>
      <div>
        <form onSubmit={handleSubmit(handleSignUpUser)} className="space-y-2">
          <div>
            <Label htmlFor="aims_number">AIMS number*</Label>
            <p className="mt-1 text-sm text-slate-500">
              Scan AIMS ID or enter it manually.
            </p>
            <Input
              className="my-0"
              id="aims_number"
              placeholder="Scan AIMS ID or type it manually"
              autoFocus
              {...register("aims_number", {
                required: "AIMS Number is required",
                onBlur: (event) => {
                  event.target.value = event.target.value.trim();
                },
              })}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  setFocus("name");
                }
              }}
            />
            {errors.aims_number && (
              <p className="text-sm text-red-500 mt-1">
                {errors.aims_number.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="name">Person name*</Label>
            <Input
              className="my-0"
              id="name"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="jamaat">Jamaat</Label>
            <Input className="my-0" id="jamaat" {...register("jamaat")} />
          </div>

          <div>
            <Label htmlFor="phone_number">Phone number</Label>
            <Input
              className="my-0"
              id="phone_number"
              {...register("phone_number")}
            />
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
