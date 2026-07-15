"use client";

import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SearchBar() {
  return (
    <Card className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Property Search
          </h1>

          <p className="mt-2 text-gray-500">
            Validate property addresses and retrieve comprehensive ownership,
            tax and structural data.
          </p>
        </div>

        <div className="flex gap-4">

          <div className="relative flex-1">

            <MapPin
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <Input
              placeholder="742 Evergreen Terrace, Springfield, OR 97477"
              className="h-14 rounded-xl pl-11"
            />

          </div>

          <Button
            className="h-14 rounded-xl bg-green-600 px-8 hover:bg-green-700"
          >
            <Search className="mr-2 h-5 w-5" />

            Validate Address

          </Button>

        </div>

      </div>
    </Card>
  );
}