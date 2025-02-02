import { ButtonPrimary } from "@/components/ui/button-primary";
import { CareComparisonDialog } from "@/components/comparison/CareComparisonDialog";
import { useTranslation } from "react-i18next";
import { Heart, Calendar, Users, MessageSquare } from "lucide-react";

const Index = () => {
  const { t } = useTranslation();

  const quickActions = [
    {
      icon: Heart,
      title: t("moodCheck"),
      description: t("trackYourMood"),
      path: "/mood-support",
      color: "bg-red-100",
      iconColor: "text-red-500",
    },
    {
      icon: Calendar,
      title: t("tasks"),
      description: t("manageCare"),
      path: "/tasks",
      color: "bg-blue-100",
      iconColor: "text-blue-500",
    },
    {
      icon: Users,
      title: t("groups"),
      description: t("connectWithOthers"),
      path: "/groups",
      color: "bg-green-100",
      iconColor: "text-green-500",
    },
    {
      icon: MessageSquare,
      title: t("messages"),
      description: t("communicate"),
      path: "/messages",
      color: "bg-purple-100",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white px-4 py-6">
      <main className="max-w-lg mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {t("welcomeToCareConnect")}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {t("careConnectorDescription")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <a
                key={action.title}
                href={action.path}
                className="block p-4 rounded-xl bg-white shadow-sm border border-gray-100"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-3",
                  action.color
                )}>
                  <action.icon className={cn("w-5 h-5", action.iconColor)} />
                </div>
                <h3 className="font-medium text-sm">{action.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{action.description}</p>
              </a>
            ))}
          </div>

          <div className="space-y-4">
            <ButtonPrimary size="lg" className="w-full">
              {t("getStarted")}
            </ButtonPrimary>
            <ButtonPrimary size="lg" variant="outline" className="w-full">
              {t("learnMore")}
            </ButtonPrimary>
          </div>
        </div>
      </main>
      <div className="fixed top-4 right-4 z-50">
        <CareComparisonDialog />
      </div>
    </div>
  );
};

export default Index;