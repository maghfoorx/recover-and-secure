import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  ClipboardList,
  Users,
  Box,
  PackageCheck,
  FilePlus,
  Map,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

const amaanatRoutes = [
  { title: "Amaanat", path: "/", icon: Box },
  { title: "Sign up amaanat", path: "/amaanat/sign-up", icon: Users },
];

const lostRoutes = [
  { title: "Lost items", path: "/lost-items-list", icon: ClipboardList },
  { title: "Lost item form", path: "/lost-item-form", icon: FilePlus },
];

const foundRoutes = [
  { title: "Found items", path: "/found-items-list", icon: PackageCheck },
  { title: "Found item form", path: "/found-item-form", icon: Calendar },
];

const generalRoutes = [
  { title: "Location management", path: "/location-settings", icon: Map },
  { title: "Dashboard", path: "/dashboard", icon: Home },
  { title: "Settings", path: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const computerName = localStorage.getItem("computerName");

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">
            Computer name
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="list-none px-2">
                <Badge className="uppercase cursor-default">
                  {computerName}
                </Badge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">
            Amaanat
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {amaanatRoutes.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem className="list-none" key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        isActive ? "bg-blue-500 hover:bg-blue-500" : "",
                      )}
                    >
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md transition text-black no-underline",
                          isActive ? "text-white hover:text-white" : "",
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">Lost</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {lostRoutes.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem className="list-none" key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        isActive ? "bg-blue-500 hover:bg-blue-500" : "",
                      )}
                    >
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md transition text-black no-underline",
                          isActive ? "text-white hover:text-white" : "",
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">Found</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {foundRoutes.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem className="list-none" key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        isActive ? "bg-blue-500 hover:bg-blue-500" : "",
                      )}
                    >
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md transition text-black no-underline",
                          isActive ? "text-white hover:text-white" : "",
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">
            General
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {generalRoutes.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem className="list-none" key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        isActive ? "bg-blue-500 hover:bg-blue-500" : "",
                      )}
                    >
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md transition text-black no-underline",
                          isActive ? "text-white hover:text-white" : "",
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
