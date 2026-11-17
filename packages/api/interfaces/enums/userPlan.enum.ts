export enum UserPlan {
  Enterprise = "Enterprise",
  Ultimate = "Ultimate",
  Premium = "Premium",
  Pro = "Pro",
  Free = "Free",
}

export const AllUserPlans: UserPlan[] = Object.values(UserPlan);
