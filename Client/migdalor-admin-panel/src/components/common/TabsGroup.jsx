import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import React from "react";
import { cn } from "../../lib/utils";

function TabsGroup({ tabs, listClassName, triggerClassName }) {
  if (!tabs || tabs.length === 0) {
    return null;
  }

  const defaultTriggerStyle =
    "inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 text-base font-semibold text-gray-600 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md";

  return (
    <Tabs defaultValue={tabs[0].value}>
      <TabsList
        className={cn(
          "inline-flex h-12 items-center justify-center rounded-full bg-gray-200 p-2",
          listClassName
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(defaultTriggerStyle, triggerClassName)}
          >
            {tab.icon &&
              React.createElement(tab.icon, { className: "ml-2 h-5 w-5" })}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default TabsGroup;
