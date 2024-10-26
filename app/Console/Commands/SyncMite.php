<?php

namespace App\Console\Commands;

use App\Jobs\SyncMiteJob;
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
    protected $signature = 'app:sync-mite {--clear} {id=all}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    protected function syncMiteAccess(MiteAccess $mite_access, bool $clear){
        // start the sync job
        Log::info('Syncing MiteAccess ' . $mite_access->id);
        return SyncMiteJob::dispatchSync($mite_access, $clear);
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $clear = $this->option('clear');
        $id = $this->argument('id');
        if ($id && $id !== 'all') {
            // get the MiteAccess instance with the given id
            $mite_access = MiteAccess::find($id);
            $this->syncMiteAccess($mite_access, $clear);
            return;
        }
        // get all MiteAccess instances
        $mite_accesses = MiteAccess::all();

        // iterate over all MiteAccess instances
        foreach ($mite_accesses as $mite_access) {
            $this->syncMiteAccess($mite_access, $clear);
        }
    }
}
