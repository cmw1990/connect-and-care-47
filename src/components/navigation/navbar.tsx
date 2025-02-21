import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Home,
  Users,
  Building2,
  ShoppingBag,
  BookOpen,
  MessageSquare,
  Bell,
  Settings,
  Pill,
  ShoppingCart,
} from "lucide-react";

export function Navbar() {
  const { t } = useTranslation();

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl mr-6">
          <span className="text-primary">
            {t('appName')}
          </span>
        </Link>

        <NavigationMenu className="flex-1">
          <NavigationMenuList>
            {/* Care Groups */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Users className="w-4 h-4 mr-2" />
                {t('careGroups')}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[400px]">
                  <NavigationMenuLink asChild>
                    <Link to="/groups" className="block p-2 hover:bg-accent rounded-md">
                      <div className="font-medium">{t('myCareGroups')}</div>
                      <p className="text-sm text-muted-foreground">{t('manageYourCareGroups')}</p>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link to="/groups/create" className="block p-2 hover:bg-accent rounded-md">
                      <div className="font-medium">{t('createNewGroup')}</div>
                      <p className="text-sm text-muted-foreground">{t('startNewCareGroup')}</p>
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Caregivers */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Users className="w-4 h-4 mr-2" />
                {t('caregivers')}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[400px]">
                  <NavigationMenuLink asChild>
                    <Link to="/caregivers/search" className="block p-2 hover:bg-accent rounded-md">
                      <div className="font-medium">{t('findCaregivers')}</div>
                      <p className="text-sm text-muted-foreground">{t('searchQualifiedCaregivers')}</p>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link to="/caregivers/jobs" className="block p-2 hover:bg-accent rounded-md">
                      <div className="font-medium">{t('postCareJob')}</div>
                      <p className="text-sm text-muted-foreground">{t('createCaregiverJob')}</p>
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Care Homes */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Building2 className="w-4 h-4 mr-2" />
                {t('careHomes')}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[400px]">
                  <NavigationMenuLink asChild>
                    <Link to="/care-homes/search" className="block p-2 hover:bg-accent rounded-md">
                      <div className="font-medium">{t('findCareHomes')}</div>
                      <p className="text-sm text-muted-foreground">{t('searchCompareCareHomes')}</p>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link to="/care-homes/tours" className="block p-2 hover:bg-accent rounded-md">
                      <div className="font-medium">{t('virtualTours')}</div>
                      <p className="text-sm text-muted-foreground">{t('exploreCareHomesVirtually')}</p>
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Care Products */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <ShoppingBag className="w-4 h-4 mr-2" />
                {t('careProducts')}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[400px]">
                  <NavigationMenuLink asChild>
                    <Link to="/products/essentials" className="block p-2 hover:bg-accent rounded-md">
                      <div className="font-medium">{t('careEssentials')}</div>
                      <p className="text-sm text-muted-foreground">{t('essentialCareProducts')}</p>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link to="/products/compare" className="block p-2 hover:bg-accent rounded-md">
                      <div className="font-medium">{t('compareProducts')}</div>
                      <p className="text-sm text-muted-foreground">{t('findBestCareProducts')}</p>
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Products */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {t('products.title')}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[400px]">
                  <NavigationMenuLink asChild>
                    <Link to="/products/essentials" className="block p-2 hover:bg-accent rounded-md">
                      <div className="font-medium">{t('products.essentials.title')}</div>
                      <p className="text-sm text-muted-foreground">
                        {t('products.essentials.description')}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Care Guides */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <BookOpen className="w-4 h-4 mr-2" />
                {t('careGuides')}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[400px]">
                  <NavigationMenuLink asChild>
                    <Link to="/guides/basics" className="block p-2 hover:bg-accent rounded-md">
                      <div className="font-medium">{t('careBasics')}</div>
                      <p className="text-sm text-muted-foreground">{t('fundamentalCareSkills')}</p>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link to="/guides/advanced" className="block p-2 hover:bg-accent rounded-md">
                      <div className="font-medium">{t('advancedCare')}</div>
                      <p className="text-sm text-muted-foreground">{t('specializedCareGuides')}</p>
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Medications */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Pill className="w-4 h-4 mr-2" />
                {t('medications.title')}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[400px]">
                  <NavigationMenuLink asChild>
                    <Link to="/medications" className="block p-2 hover:bg-accent rounded-md">
                      <div className="font-medium">{t('medications.list')}</div>
                      <p className="text-sm text-muted-foreground">{t('medications.listDescription')}</p>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link to="/medications/schedule" className="block p-2 hover:bg-accent rounded-md">
                      <div className="font-medium">{t('medications.schedule')}</div>
                      <p className="text-sm text-muted-foreground">{t('medications.scheduleDescription')}</p>
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <Link to="/messages">
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/notifications">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
