import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { addAmaanatUser } from "@/apiApi/modules/amaanat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AmaanatSignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      aims_number: "",
      jamaat: "",
      phone_number: "",
    },
  });

  const navigate = useNavigate();

  async function handleSignUpUser(data: any) {
    try {
      const newUser = await addAmaanatUser(data);
      toast.success("Successfully created user!", {
        style: {
          background: "green",
          color: "white",
        },
      });
      reset();
      if (newUser?.id != null) {
        navigate(`/amaanat/${newUser.id}`);
      }
    } catch (error) {
      toast.error("Failed to create user. Please try again.", {
        style: {
          background: "red",
          color: "white",
        },
      });
      console.error(error);
    }
  }

  return (
    <div className="max-w-lg p-6">
      <h1 className="text-3xl font-bold">Sign up amaanat user</h1>
      <div>
        <form onSubmit={handleSubmit(handleSignUpUser)} className="space-y-2">
          <div>
            <Label htmlFor="name">Person name*</Label>
            <Input
              className="my-0"
              id="name"
              {...register("name", { required: "Name is required" })}
            />
          </div>
          <div>
            <Label htmlFor="aims_number">AIMS number*</Label>
            <Input
              className="my-0"
              id="aims_number"
              {...register("aims_number", {
                required: "AIMS Number is required",
              })}
            />
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
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
