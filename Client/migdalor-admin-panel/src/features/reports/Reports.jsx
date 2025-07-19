import React from "react";
import { Sunrise, CalendarClock } from "lucide-react";
import TabsGroup from "../../components/common/TabsGroup";
import BokerTovReport from "./BokerTovReport";
import ActivitiesAndClassesReport from "./ActivitiesAndClassesReport";

const Reports = () => {
  const reportTabs = [
    {
      value: "boker_tov",
      label: "דוח בוקר טוב",
      content: <BokerTovReport />,
      icon: Sunrise,
    },
    {
      value: "activities_classes",
      label: "דוחות פעילויות וחוגים",
      content: <ActivitiesAndClassesReport />,
      icon: CalendarClock,
    },
  ];

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md" dir="rtl">
        <TabsGroup tabs={reportTabs} />
    </div>
  );
};

export default Reports;
