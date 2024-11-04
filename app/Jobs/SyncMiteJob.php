<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Models\Entry;
use App\Models\MiteAccess;
use App\Models\Project;
use App\Models\Service;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncMiteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private MiteAccess $mite_access;
    private bool $clear;
    
    /**
     * Create a new job instance.
     */
    public function __construct(MiteAccess $mite_access, bool $clear)
    {
        $this->mite_access = $mite_access;
        $this->clear = $clear;
    }

    protected function syncCustomers(MiteAccess $mite_access, bool $clear = false, bool $syncBack = false) {
        if ($clear) {
            // clear all data for this MiteAccess instance
            $mite_access->customers()->delete();
        }
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
            // TODO: check if each database customer exists in Mite and delete it if not
        }

        if ($syncBack) {
            // refresh the list of customers for this MiteAccess instance
            $customers = Customer::all();
            foreach ($customers as $customer) {
                $customer->syncBack();
            }
        }
    }

    protected function syncMiteProjects(MiteAccess $mite_access, bool $clear = false, bool $syncBack = false) {
        if ($clear) {
            // clear all data for this MiteAccess instance
            $mite_access->projects()->delete();
        }
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

        if ($syncBack) {
            // refresh the list of projects for this MiteAccess instance
            $projects = Project::all();
            foreach ($projects as $project) {
                $project->syncBack();
            }
        }
    }

    protected function syncMiteServices(MiteAccess $mite_access, bool $clear = false, bool $syncBack = false) {
        if ($clear) {
            // clear all data for this MiteAccess instance
            $mite_access->services()->delete();
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

        if ($syncBack) {
            // refresh the list of services for this MiteAccess instance
            $services = Service::all();
            foreach ($services as $service) {
                $service->syncBack();
            }
        }
    }

    protected function syncEntries(MiteAccess $mite_access, bool $clear = false, bool $syncBack = false) {
        if ($clear) {
            // clear all data for this MiteAccess instance
            $mite_access->entries()->delete();
        }
        // TODO: Else write any new entries to mite, which do not have a mite id.
        // TODO: If they do have a mite id, but that id is in mite (anymore), then delete them here.

        // refresh the list of time entries for this MiteAccess instance
        $time_entries = Entry::miteGetAll($mite_access);
        /** @var Entry $time_entry */
        foreach ($time_entries as $time_entry) {
            $project_id = null;
            if ($time_entry->project !== null) {
                $project = Project::where('mite_id', $time_entry->project->mite_id)->first();
                // TODO: if the project does not exist, we should create it
                $project_id = $project->id;
            }

            $service_id = null;
            if ($time_entry->service !== null) {
                $service = Service::where('mite_id', $time_entry->service->mite_id)->first();
                // TODO: if the service does not exist, we should create it
                $service_id = $service->id;
            }

            // Check if the time entry already exists in the database
            $db_time_entry = Entry::where('mite_id', $time_entry->mite_id)->first();
            if ($db_time_entry === null) {
                // check if the marmite id in the notes is set
                // TODO: There is a chance that the marmite id in mite is wrong or a duplicate. We should check if the marmite id is unique during the sync
                $time_entry->getMarmiteIdFromMite();
                if ($time_entry->marmite_id !== null) {
                    $db_time_entry = Entry::find($time_entry->marmite_id);
                    // TODO: if the db entry does not exist, then we should force update the marmite in in mite
                }
            }

            // if null, entry does not exist in the database
            if ($db_time_entry === null) {
                // create it
                $time_entry->project_id = $project_id;
                $time_entry->service_id = $service_id;
                $time_entry->save();
            } else {
                // if it does, update it
                $db_time_entry->update($time_entry->toArray());
            }
        }

        if ($syncBack) {
            // refresh the list of time entries for this MiteAccess instance
            $time_entries = Entry::all();
            foreach ($time_entries as $time_entry) {
                $time_entry->syncBack();
            }
        }
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $mite_access = $this->mite_access;
        $clear = $this->clear;
        // TODO get user roles and check if they can sync back
        $this->syncCustomers($mite_access, $clear, false);

        $this->syncMiteProjects($mite_access, $clear, false);

        $this->syncMiteServices($mite_access, $clear, false);

        $this->syncEntries($mite_access, $clear, true);
    }
}
