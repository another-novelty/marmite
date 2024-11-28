import { PageProps } from "@/types";
import { Customer, Service, Template } from "@/types/calendar";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { useCallback, useState } from "react";

function TemplateColumn({template, miteAPIKey}: {template: Template, miteAPIKey: string}) {

  const { processing, delete: destroy} = useForm({template_id: template.id});

  const handleDelete = useCallback(() => {
    destroy(route('template.destroy', {
      mite_access: miteAPIKey, 
      template: template.id
    }), {
      preserveScroll: true,
      onSuccess: () => {
        console.log('success')
      },
      onError: () => {
        console.log('error')
      }
    });
  }, [template.id]);


  return (
    <tr key={template.id}>
      <td className="px-6 py-4 whitespace-no-wrap">
        <div className="text-sm leading-5 text-gray-900 dark:text-gray-200">{template.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-no-wrap text-right text-sm leading-5 font-medium">
        <a href={route("template.edit", {"mite_access": miteAPIKey, "template": template.id})} className="text-blue-500 dark:text-blue-300">Edit</a>
        <div onClick={handleDelete} className="text-red-500 dark:text-red-300">Delete</div>
      </td>
    </tr>
  )
}

export default function Index({
  auth,
  mite,
  miteAPIKey,
  templates,
  customers,
  services
}: PageProps<{
  miteAPIKey: {id: string, name: string},
  templates: Template[],
  customers: Customer[],
  services: Service[]
}>) {
  const [pageTitle, setPageTitle] = useState<"Time Entry Templates">("Time Entry Templates")
  
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h1 className="dark:text-white font-bold text-xl">{pageTitle}</h1>}
      miteApiKeys={mite.apiKeys}
    >

      <Head title={pageTitle}></Head>

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg dark:text-white p-10">
            <div className="flex justify-between">
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Time Entry Templates</h2>
              <a href={route('template.create', miteAPIKey.id)} className="text-blue-500 dark:text-blue-300">Create New Template</a>
            </div>
            <div className="mt-6">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs leading-4 font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700"></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {templates.map((template) => (
                    <TemplateColumn key={template.id} template={template} miteAPIKey={miteAPIKey.id} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </AuthenticatedLayout>
  )
}