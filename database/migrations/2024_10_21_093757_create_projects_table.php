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
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestamps();
            $table->timestamp('last_sync_at')->nullable();
            $table->integer('mite_id')->required();
            $table->foreignUuid('customer_id')->constrained()->onDelete('cascade');
            $table->string('name')->required();
            $table->string('note')->default('');
            $table->boolean('archived')->default(false);
            
            $table->unique(['mite_id', 'customer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
