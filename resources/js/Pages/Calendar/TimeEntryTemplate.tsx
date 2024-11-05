import { PageProps } from "@/types";
import { Customer, Service, TimeEntryTemplate } from "@/types/calendar";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";

export default function TimeEntryTemplatePage({
  auth,
  miteAPIKey,
  templates,
  customers,
  services
}: PageProps<{
  miteAPIKey: {id: string, name: string},
  templates: TimeEntryTemplate[],
  customers: Customer[],
  services: Service[]
}>) {
  const [pageTitle, setPageTitle] = useState<"Time Entry Templates">()

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h1>{pageTitle}</h1>}
    >

      <Head title={pageTitle}></Head>

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
          </div>
        </div>
      </div>

    </AuthenticatedLayout>
  )
}