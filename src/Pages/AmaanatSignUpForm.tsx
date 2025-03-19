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
  } = useForm();

  const navigate = useNavigate();

  async function handleSignUpUser(data: any) {
    try {
      const newUser = await addAmaanatUser(data);
      console.log(newUser, "is the newUser");
      toast.success("Successfully created user!");
      reset();
      if (newUser?.id != null) {
        navigate(`/amaanat/${newUser.id}`);
      }
    } catch (error) {
      toast.error("Failed to create user. Please try again.");
      console.error(error);
    }
  }

  return (
    <div className="max-w-lg p-6">
      <h1 className="text-3xl font-bold">Sign Up Amaanat User</h1>
      <div>
        <form onSubmit={handleSubmit(handleSignUpUser)} className="space-y-2">
          <div>
            <Label htmlFor="name">Person Name*</Label>
            <Input
              className="my-0"
              id="name"
              {...register("name", { required: "Name is required" })}
            />
          </div>
          <div>
            <Label htmlFor="aims_no">AIMS Number*</Label>
            <Input
              className="my-0"
              id="aims_no"
              {...register("aims_no", { required: "AIMS Number is required" })}
            />
          </div>
          <div>
            <Label htmlFor="jamaat">Jamaat</Label>
            <Input className="my-0" id="jamaat" {...register("jamaat")} />
          </div>
          <div>
            <Label htmlFor="phone_no">Phone Number</Label>
            <Input className="my-0" id="phone_no" {...register("phone_no")} />
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
