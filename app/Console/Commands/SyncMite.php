<?php

namespace App\Console\Commands;

use App\Models\Customer;
use App\Models\Entry;
use App\Models\MiteAccess;
use App\Models\Project;
use App\Models\Service;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncMite extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-mite';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // get all MiteAccess instances
        $mite_accesses = MiteAccess::all();

        // iterate over all MiteAccess instances
        foreach ($mite_accesses as $mite_access) {
            // refresh the list of customers for this MiteAccess instance
            $customers = Customer::miteGetAll($mite_access);
            foreach ($customers as $customer) {
                $db_customer = Customer::where('mite_id', $customer->mite_id)->where('mite_access_id', $mite_access->id)->first();
                if (Customer::where('mite_id', $customer->mite_id)->where('mite_access_id', $mite_access->id)->exists() === false) {
                    // if not, create it
                    $customer->mite_access_id = $mite_access->id;
                    $customer->save();
                } else {
                    // if it does, update it
                    $db_customer->update($customer->toArray());
                }
            }
            // TODO: check if each database customer exists in Mite and delete it if not

            // refresh the list of projects for this MiteAccess instance
            $projects = Project::miteGetAll($mite_access);
            foreach ($projects as $project) {
                $customer = Customer::where('mite_id', $project->customer->mite_id)->where('mite_access_id', $mite_access->id)->first();
                $db_project = Project::where('mite_id', $project->mite_id)->where('customer_id', $customer->id)->first();
                if ($db_project === null) {
                    // if not, create it
                    $project->save();
                } else {
                    // if it does, update it
                    $db_project->update($project->toArray());
                }
            }

            // refresh the list of services for this MiteAccess instance
            $services = Service::miteGetAll($mite_access);
            foreach ($services as $service) {
                $db_service = Service::where('mite_id', $service->mite_id)->where('mite_access_id', $mite_access->id)->first();
                if ($db_service === null) {
                    // if not, create it
                    $service->mite_access_id = $mite_access->id;
                    $service->save();
                } else {
                    // if it does, update it
                    $db_service->update($service->toArray());
                }
            }

            // refresh the list of time entries for this MiteAccess instance
            $time_entries = Entry::miteGetAll($mite_access);
            foreach ($time_entries as $time_entry) {
                $project = Project::where('mite_id', $time_entry->project->mite_id)->first();
                $service = Service::where('mite_id', $time_entry->service->mite_id)->first();
                $db_time_entry = Entry::where('mite_id', $time_entry->mite_id)->first();
                if ($db_time_entry === null) {
                    // if not, create it
                    $time_entry->project_id = $project->id;
                    $time_entry->service_id = $service->id;
                    $time_entry->save();
                } else {
                    // if it does, update it
                    $db_time_entry->update($time_entry->toArray());
                }
            }
        }
    }
}
