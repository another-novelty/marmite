<?php

namespace App\Console\Commands;

use App\Models\Customer;
use App\Models\MiteAccess;
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
            // refresh the list of projects for this MiteAccess instance
            $customers = Customer::miteGetAll($mite_access);
            // TODO: check if each database customer exists in Mite
            foreach ($customers as $customer) {
                if (Customer::where('mite_id', $customer->mite_id)->where('mite_access_id', $mite_access->id)->exists() === false) {
                    // if not, create it
                    $customer->save();
                } else {
                    // if it does, update it
                    $db_customer = Customer::where('mite_id', $customer->mite_id)->where('mite_access_id', $mite_access->id)->first();
                    $db_customer->update($customer->toArray());
                }
            }

        }
    }
}
