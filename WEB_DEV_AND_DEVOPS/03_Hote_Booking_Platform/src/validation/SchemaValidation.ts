import { z } from "zod";

const SignUpSchema = z.object({
  name: z.string().min(3, "Name must be greater then 3 chracter"),
  email: z.string().email("Invalid Email address"),
  password: z.string().min(5, "Minimum 5 character in passsword"),
  phone: z.string().length(10, "Phone must be 10 digit ").optional(),
});
