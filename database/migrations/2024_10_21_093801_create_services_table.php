<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestamps();
            $table->timestamp('last_sync_at')->nullable();
            $table->integer('mite_id')->required();
            $table->string('name')->required();
            $table->string('note')->default('');
            $table->boolean('archived')->default(false);
            $table->foreignUuid('mite_access_id')->constrained()->onDelete('cascade');

            $table->unique(['mite_id', 'mite_access_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
