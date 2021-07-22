import { RouterModule, Routes } from "@angular/router";
import { UsersListComponent } from "app/modules/admin/apps/users/list/usersList.component";
import { NgModule } from "@angular/core";
import { UsersComponent } from "./users.component";
import { UsersFormComponent } from "./form/usersForm.component";

export const usersRoutes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "users",
  },
  {
    path: "list",
    component: UsersListComponent,
  },
  {
    path: "form",
    component: UsersFormComponent,
  },
  {
    path: "form/:id",
    component: UsersFormComponent,
  },
  {
    path: "usersreset",
    component: UsersComponent,
    children: [
      {
        path: "",
        component: UsersComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(usersRoutes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
